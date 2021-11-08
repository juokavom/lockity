package lockity.routes

import database.schema.tables.records.FileRecord
import io.ktor.application.*
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
import java.time.LocalDate
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
             * Upload physical file, save metadata to database and generate fileKey
             * which is returned to client to later generate file link
             * (if upload is anonymous)
             * SCOPE = ALL: (guest (anonymous upload), registered (not anonymous))
             */
            post("/anonymous/{anonymous}") {
                call.withErrorHandler {
                    val isAnonymous = call.parameters["anonymous"]?.toBooleanStrictOrNull()
                        ?: throw BadRequestException("Anonymous value is not present in the request")
                    val fileSize = call.request.headers["Content-Length"]!!.toLong()
                    if (fileSize > DEFAULT_STORAGE_BYTES) throw BadRequestException("File size exceeds 1GB")

                    val part = call.receiveMultipart().readPart()
                    val fileId = databaseService.uuidToBin()
                    val fileIdStringed = databaseService.binToUuid(fileId).toString()
                    if (part is PartData.FileItem) {
                        val fileName = part.originalFileName!!
                        File(fileService.uploadsLocation(fileIdStringed)).mkdir()
                        val fileLocation = fileService.uploadsLocation("$fileIdStringed/$fileName")
                        val inputStream = part.streamProvider()
                        val outputStream = File(fileLocation).outputStream().buffered()
                        fileService.copyTo(inputStream, outputStream)
                        part.dispose

                        val currentUserId = call.request.headers[JWT_COOKIE_NAME]?.let { jwt ->
                            if (jwtService.isValidToken(jwt)) jwtService.getJwtClaims(jwt) else null
                        }?.userId

                        val fileKey = UUID.randomUUID().toString()
                        fileRepository.insert(
                            FileRecord(
                                id = fileId,
                                title = fileName,
                                location = fileLocation,
                                user = if (isAnonymous) null else databaseService.uuidToBin(
                                    UUID.fromString(
                                        currentUserId
                                    )
                                ),
                                key = if (isAnonymous) fileKey else null,
                                link = null,
                                uploaded = LocalDateTime.now(),
                                lastAccessed = null
                            )
                        )
                        call.respond(AnonymousFileMetadata(fileIdStringed, fileKey))
                    } else throw BadRequestException("Multipart data is not file type")
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
                    val key = call.request.queryParameters["key"]
                    val user = call.jwtUser()
                    val file = fileRepository.fetch(UUID.fromString(fileId))
                        ?: throw NotFoundException("File was not found")

                    if (file.user != null) {
                        if (user == null || !file.user.contentEquals(user.id)) {
                            throw NoPermissionException("User do not own the file.")
                        }
                    } else if (key != null) {
                        if (file.key != key) {
                            throw NoPermissionException("File key does not match.")
                        }
                    }

                    file.link = UUID.randomUUID().toString()
                    file.key = null
                    fileRepository.update(file)

                    call.respondJSON(file.link!!, HttpStatusCode.OK, "fileLink")
                }
            }
            /**
             * Get physical file by providing file id
             * SCOPE = Registered (gets his own file or file is shared access with him)
             */
            get("/file-id/{fileId}") {
            }
            /**
             * Get physical file by providing dynamic link id
             * SCOPE = Guest
             */
            get("/dynlink-id/{dynlinkId}") {
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
             * Gets list of user's shared access files
             * SCOPE = Registered
             */
            get("/shared/user/{userId}") {
            }
        }
    }
}