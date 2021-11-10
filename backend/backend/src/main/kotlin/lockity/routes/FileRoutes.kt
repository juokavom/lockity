package lockity.routes

import database.schema.tables.records.FileRecord
import io.ktor.application.*
import io.ktor.auth.*
import io.ktor.features.*
import io.ktor.http.*
import io.ktor.http.content.*
import io.ktor.request.*
import io.ktor.response.*
import io.ktor.routing.*
import lockity.models.AnonymousFileMetadata
import lockity.repositories.ConfirmationLinkRepository
import lockity.repositories.FileRepository
import lockity.repositories.RoleRepository
import lockity.repositories.UserRepository
import lockity.services.*
import lockity.utils.*
import org.koin.ktor.ext.inject
import java.io.File
import java.time.LocalDateTime
import java.util.*
import javax.naming.NoPermissionException

fun Application.fileRoutes() {
    val emailService: EmailService by inject()
    val userRepository: UserRepository by inject()
    val fileRepository: FileRepository by inject()
    val fileService: FileService by inject()
    val roleRepository: RoleRepository by inject()
    val databaseService: DatabaseService by inject()
    val confirmationLinkRepository: ConfirmationLinkRepository by inject()
    val configurationService: ConfigurationService by inject()
    val jwtService: JwtService by inject()

    routing {
        route("/file") {
            /**
             * Description: Upload physical file, save metadata to database and generate fileKey
             * which is returned to client to later generate file link
             * Params: null
             * Body: multipart file
             * Validation: Check if file do not exceed limit, is attached and in correct format
             * OK Response: AnonymousFileMetadata { fileId, fileKey }
             * Scope: all
             */
            post("/anonymous") {
                call.withErrorHandler {
                    val fileSize = call.request.headers["Content-Length"]!!.toLong()
                    if (fileSize > DEFAULT_STORAGE_BYTES) throw BadRequestException("File size exceeds 1GB")

                    val part = call.receiveMultipart().readPart() ?: throw BadRequestException("File not attached")
                    val fileId = databaseService.uuidToBin()
                    val fileIdStringed = databaseService.binToUuid(fileId).toString()
                    if (part is PartData.FileItem) {
                        val fileName = part.originalFileName!!
                        File(fileService.uploadsLocation(fileIdStringed)).mkdir()
                        val fileLocation = fileService.uploadsLocation("$fileIdStringed/$fileName")
                        part.streamProvider().use { inputStream ->
                            File(fileLocation).outputStream().buffered().use { outputStream ->
                                fileService.copyTo(inputStream, outputStream)
                            }
                        }
                        part.dispose

                        val fileKey = UUID.randomUUID().toString()
                        fileRepository.insert(
                            FileRecord(
                                id = fileId,
                                title = fileName,
                                location = fileLocation,
                                user = null,
                                key = fileKey,
                                link = null,
                                uploaded = LocalDateTime.now(),
                                lastAccessed = null,
                                size = fileSize
                            )
                        )
                        call.respond(AnonymousFileMetadata(fileIdStringed, fileKey))
                    } else throw BadRequestException("Multipart data is not file type")
                }
            }

            /**
             * Description: Upload physical file, save metadata to database
             * Params: null
             * Body: multipart file
             * Validation: Check if file do not exceed limit, is attached and in correct format
             * OK Response: AnonymousFileMetadata { fileId, fileKey }
             * Scope: registered
             */
            authenticate(AUTHENTICATED) {
                post {
                    call.withErrorHandler {
                        val fileSize = call.request.headers["Content-Length"]!!.toLong()
                        if (fileSize > DEFAULT_STORAGE_BYTES) throw BadRequestException("File size exceeds 1GB")
                        val currentUser = call.jwtUser()
                            ?: throw BadRequestException("User not found")

                        val part = call.receiveMultipart().readPart() ?: throw BadRequestException("File not attached")
                        val userFileSizeSum = fileRepository.userFileSizeSum(currentUser.id!!)?.toLong() ?: 0L
                        if (userFileSizeSum + fileSize > currentUser.storageSize!!)
                            throw NoPermissionException("User storage size is exceeded")

                        val fileId = databaseService.uuidToBin()
                        val fileIdStringed = databaseService.binToUuid(fileId).toString()
                        if (part is PartData.FileItem) {
                            val fileName = part.originalFileName!!
                            File(fileService.uploadsLocation(fileIdStringed)).mkdir()
                            val fileLocation = fileService.uploadsLocation("$fileIdStringed/$fileName")
                            part.streamProvider().use { inputStream ->
                                File(fileLocation).outputStream().buffered().use { outputStream ->
                                    fileService.copyTo(inputStream, outputStream)
                                }
                            }
                            part.dispose

                            fileRepository.insert(
                                FileRecord(
                                    id = fileId,
                                    title = fileName,
                                    location = fileLocation,
                                    user = currentUser.id,
                                    key = null,
                                    link = null,
                                    uploaded = LocalDateTime.now(),
                                    lastAccessed = null,
                                    size = fileSize
                                )
                            )
                            call.respond(AnonymousFileMetadata(fileIdStringed, null))
                        } else throw BadRequestException("Multipart data is not file type")
                    }
                }
                /**
                 * Get physical file by providing file id
                 * SCOPE = Registered (gets his own file or file is shared access with him)
                 */
                get("/file-id/{fileId}") {
                }
                /**
                 * Get shared physical file by providing file id
                 * SCOPE = Registered (gets shared access file with him)
                 */
                get("/shared/file-id/{fileId}") {
                }
                /**
                 * Edits file data (title)
                 * SCOPE = Registered (edits his own file)
                 */
                put("/file-id/{fileId}") {
                }
                /**
                 * Deletes file (and shared access)
                 * SCOPE = Registered (deletes his own file)
                 */
                delete("/file-id/{fileId}") {
                }
                /**
                 * Gets list of user's files metadata whose titles start with
                 * SCOPE = Registered
                 */
                get("/metadata/user/{userId}/starts-with/{startsWith}") {
                }
                /**
                 * Gets list of user's shared access files metadata
                 * SCOPE = Registered
                 */
                get("/metadata/shared/user/{userId}") {
                }
            }
            /**
             * Generate dynamic link for file access
             * SCOPE = ALL: (guest (with key), registered (his file))
             */
            post("/dynlink/file-id/{fileId}") {
                call.withErrorHandler {
                    val fileId = call.parameters["fileId"]
                        ?: throw BadRequestException("File id is not present in the parameters.")
                    val key = call.request.queryParameters["fileKey"]
                    val user = call.jwtUser()
                    val file = fileRepository.fetch(UUID.fromString(fileId))
                        ?: throw NotFoundException("File was not found")

                    if (file.link != null) throw BadRequestException("File has link already")
                    if (file.user != null) {
                        if (user == null || !file.user.contentEquals(user.id)) {
                            throw NoPermissionException("User do not own the file.")
                        }
                    } else {
                        if (key == null) throw BadRequestException("File key is not provided.")
                        else if (file.key != key) {
                            throw BadRequestException("File key is not correct.")
                        }
                    }

                    file.link = UUID.randomUUID().toString()
                    file.key = null
                    fileRepository.update(file)

                    call.respondJSON(file.link!!, HttpStatusCode.OK, "fileLink")
                }
            }
            /**
             * Get physical file by providing dynamic link id
             * SCOPE = Guest
             */
            get("/dynlink-id/{dynlinkId}") {
            }
        }
    }
}