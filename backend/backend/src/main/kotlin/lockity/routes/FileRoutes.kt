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
import lockity.models.*
import lockity.repositories.*
import lockity.services.*
import lockity.utils.AUTHENTICATED
import lockity.utils.DatabaseService
import lockity.utils.respondJSON
import lockity.utils.withErrorHandler
import org.koin.ktor.ext.inject
import java.io.File
import java.time.LocalDateTime
import java.util.*
import javax.naming.NoPermissionException
import javax.security.auth.login.AccountLockedException

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
    val sharedAccessRepository: SharedAccessRepository by inject()

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
//            post("/anonymous") {
//                call.withErrorHandler {
//                    val fileSize = call.request.headers["Content-Length"]!!.toLong()
//                    if (fileSize > DEFAULT_STORAGE_BYTES) throw BadRequestException("File size exceeds 1GB")
//
//                    val part = call.receiveMultipart().readPart() ?: throw BadRequestException("File not attached")
//
//                    val fileId = databaseService.uuidToBin()
//                    val fileIdStringed = databaseService.binToUuid(fileId).toString()
//                    if (part is PartData.FileItem) {
//                        val fileName = part.originalFileName!!
//                        val fileFolderLocation = fileService.uploadsLocation(fileIdStringed)
//                        File(fileFolderLocation).mkdir()
//                        val fileLocation = "$fileFolderLocation/$fileName"
//                        part.streamProvider().use { inputStream ->
//                            File(fileLocation).outputStream().buffered().use { outputStream ->
//                                fileService.copyTo(inputStream, outputStream)
//                            }
//                        }
//                        part.dispose
//
//                        val fileKey = UUID.randomUUID().toString()
//                        fileRepository.insert(
//                            FileRecord(
//                                id = fileId,
//                                title = fileName,
//                                location = fileFolderLocation,
//                                user = null,
//                                key = fileKey,
//                                link = null,
//                                uploaded = LocalDateTime.now(),
//                                lastAccessed = null,
//                                size = fileSize
//                            )
//                        )
//                        call.respond(AnonymousFileMetadata(fileIdStringed, fileKey))
//                    } else throw BadRequestException("Multipart data is not file type")
//                }
//            }

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
                        val currentUser = call.jwtUser()
                            ?: throw BadRequestException("User not found")

                        val part = call.receiveMultipart().readPart() ?: throw BadRequestException("File not attached")
                        val userFileSizeSum = fileRepository.userFileSizeSum(currentUser.id!!)
                        if (userFileSizeSum + fileSize > currentUser.storageSize!!)
                            throw NoPermissionException("User storage size is exceeded")

                        val fileId = databaseService.uuidToBin()
                        val fileIdStringed = databaseService.binToUuid(fileId).toString()
                        if (part is PartData.FileItem) {
                            val fileName = part.originalFileName!!
                            val fileFolderLocation = fileService.uploadsLocation(fileIdStringed)
                            File(fileFolderLocation).mkdir()
                            val fileLocation = "$fileFolderLocation/$fileName"
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
                                    location = fileFolderLocation,
                                    user = currentUser.id,
                                    key = null,
                                    link = null,
                                    uploaded = LocalDateTime.now(),
                                    lastAccessed = null,
                                    size = fileSize
                                )
                            )
                            call.respondJSON("User file uploaded successfully", HttpStatusCode.OK)
                        } else throw BadRequestException("Multipart data is not file type")
                    }
                }

                /**
                //                 * Get physical file by providing file id
                //                 * SCOPE = Registered (gets his own file)
                //                 */
//                get("/file-id/{fileId}") {
//                    call.withErrorHandler {
//                        val fileId = call.parameters["fileId"]
//                            ?: throw BadRequestException("File id is not present in the parameters.")
//                        val fileRecord = fileRepository.fetch(UUID.fromString(fileId))
//                            ?: throw NotFoundException("File was not found")
//                        val currentUser = call.jwtUser()
//                            ?: throw NoPermissionException("User do not have permission to get this file")
//                        if (!fileRecord.user.contentEquals(currentUser.id))
//                            throw NoPermissionException("User do not have permission to get this file")
//
//                        call.respondFile(File(fileRecord.location!!))
//                    }
//                }

                get("/file-id/{fileId}/stream") {
                    call.withErrorHandler {
                        val fileId = call.parameters["fileId"]
                            ?: throw BadRequestException("File id is not present in the parameters.")
                        val fileRecord = fileRepository.fetch(UUID.fromString(fileId))
                            ?: throw NotFoundException("File was not found")
                        val currentUser = call.jwtUser()
                            ?: throw NoPermissionException("No permission to stream the file")
                        if (!fileRecord.user.contentEquals(currentUser.id))
                            throw NoPermissionException("User do not have permission to get this file")

                        call.respondFile(
                            File(fileRecord.location!! + "/" + fileRecord.title!!)
                        )
                    }
                }

                get("/file-id/{fileId}/download") {
                    call.withErrorHandler {
                        val fileId = call.parameters["fileId"]
                            ?: throw BadRequestException("File id is not present in the parameters.")
                        val fileRecord = fileRepository.fetch(UUID.fromString(fileId))
                            ?: throw NotFoundException("File was not found")
                        val currentUser = call.jwtUser()
                            ?: throw NoPermissionException("No permission to download the file")
                        if (!fileRecord.user.contentEquals(currentUser.id))
                            throw NoPermissionException("User do not have permission to get this file")

                        call.response.header(
                            HttpHeaders.ContentDisposition,
                            ContentDisposition.Attachment.withParameter(
                                ContentDisposition.Parameters.FileName, fileRecord.title!!
                            ).toString()
                        )

                        call.respondFile(
                            File(fileRecord.location!! + "/" + fileRecord.title!!)
                        )
                    }
                }

//                /**
//                 * Get shared physical file by providing file id
//                 * SCOPE = Registered (gets shared access file with him)
//                 */
//                get("/share-id/{shareId}") {
//                    call.withErrorHandler {
//
//                        val shareId = call.parameters["shareId"]
//                            ?: throw BadRequestException("Share id is not present in the parameters.")
//                        val sharedAccessRecord = sharedAccessRepository.fetch(UUID.fromString(shareId))
//                            ?: throw NotFoundException("Shared access was not found")
//                        val currentUser = call.jwtUser()
//                            ?: throw NoPermissionException("User do not have permission to get this file")
//                        if (!sharedAccessRecord.recipientId.contentEquals(currentUser.id))
//                            throw NoPermissionException("User do not have permission to get this file")
//
//                        val fileRecord = fileRepository.fetch(databaseService.binToUuid(sharedAccessRecord.fileId!!))
//                            ?: throw NotFoundException("File was not found")
//
//                        call.respondFile(File(fileRecord.location!!))
//                    }
//                }
                /**
                 * Get physical file by providing file id
                 * SCOPE = Registered (gets his own file or file is shared access with him)
                 */
//                get("/metadata/file-id/{fileId}") {
//                    call.withErrorHandler {
//                        val fileId = call.parameters["fileId"]
//                            ?: throw BadRequestException("File id is not present in the parameters.")
//                        val fileRecord = fileRepository.fetch(UUID.fromString(fileId))
//                            ?: throw NotFoundException("File was not found")
//                        val currentUser = call.jwtUser()
//                            ?: throw NoPermissionException("User do not have permission to get this file metadata")
//                        if (!fileRecord.user.contentEquals(currentUser.id))
//                            throw NoPermissionException("User do not have permission to get this file metadata")
//
//                        call.respond(
//                            FileMetadata(
//                                title = fileRecord.title!!,
//                                size = fileRecord.size!!
//                            )
//                        )
//                    }
//                }

                /**
                 * Get physical file by providing file id
                 * SCOPE = Registered (gets his own file or file is shared access with him)
                 */
//                get("/metadata/shared-id/{shareId}") {
//                    call.withErrorHandler {
//                        val shareId = call.parameters["shareId"]
//                            ?: throw BadRequestException("Share id is not present in the parameters.")
//                        val sharedAccessRecord = sharedAccessRepository.fetch(UUID.fromString(shareId))
//                            ?: throw NotFoundException("Shared access was not found")
//                        val currentUser = call.jwtUser()
//                            ?: throw NoPermissionException("User do not have permission to get this file metadata")
//                        if (!sharedAccessRecord.recipientId.contentEquals(currentUser.id))
//                            throw NoPermissionException("User do not have permission to get this file metadata")
//
//                        val fileRecord = fileRepository.fetch(databaseService.binToUuid(sharedAccessRecord.fileId!!))
//                            ?: throw NotFoundException("File was not found")
//
//                        call.respond(
//                            FileMetadata(
//                                title = fileRecord.title!!,
//                                size = fileRecord.size!!
//                            )
//                        )
//                    }
//                }
                /**
                 * Gets list of user's files metadata whose titles start with
                 * SCOPE = Registered
                 */
                get("/metadata/offset/{offset}/limit/{limit}") {
                    call.withErrorHandler {
                        val currentUser = call.jwtUser()
                            ?: throw NoPermissionException("User do not have permission to get this file metadata")
                        val offset = call.parameters["offset"]?.toIntOrNull()
                            ?: throw BadRequestException("Offset is not present in the parameters or in bad format.")
                        val limit = call.parameters["limit"]?.toIntOrNull()
                            ?: throw BadRequestException("Limit is not present in the parameters or in bad format.")
                        if (limit > 20) throw BadRequestException("Maximum limit(20) is exceeded.")

                        val userFiles = fileRepository.fetchUserFilesWithOffsetAndLimit(
                            userUuid = databaseService.binToUuid(currentUser.id!!),
                            offset = offset,
                            limit = limit
                        )

                        call.respond(
                            userFiles.map {
                                FileMetadata(
                                    id = databaseService.binToUuid(it.id!!).toString(),
                                    title = it.title!!,
                                    size = it.size!!,
                                    link = it.link
                                )
                            }
                        )
                    }
                }

                get("/metadata/title-starts-with/{title}") {
                    call.withErrorHandler {
                        val currentUser = call.jwtUser()
                            ?: throw NoPermissionException("User do not have permission to get this file metadata")
                        val title = call.parameters["title"]
                            ?: throw BadRequestException("Title is not present in the parameters.")

                        val userFiles = fileRepository.fetchUserFilesWithTitleLike(
                            userBinId = currentUser.id!!,
                            titleLike = "$title%"
                        )

                        call.respond(
                            userFiles.map {
                                FileMetadataForSharing(
                                    id = databaseService.binToUuid(it.id!!).toString(),
                                    title = it.title!!
                                )
                            }
                        )
                    }
                }

                get("/metadata/info") {
                    call.withErrorHandler {
                        val currentUser = call.jwtUser()
                            ?: throw NoPermissionException("User do not have permission to get this file metadata")
                        call.respond(
                            FileMetadataInfo(
                                storageData = StorageData(
                                    totalSize = currentUser.storageSize!!,
                                    usedSize = fileRepository.userFileSizeSum(currentUser.id!!)
                                ),
                                fileCount = fileRepository.fetchUserFilesCount(
                                    userUuid = databaseService.binToUuid(currentUser.id!!)
                                ) ?: 0
                            )
                        )
                    }
                }
                /**
                 * Gets list of user's files metadata whose titles start with
                 * SCOPE = Registered
                 */
//                get("/metadata/shared") {
//                    call.withErrorHandler {
//                        val currentUser = call.jwtUser()
//                            ?: throw NoPermissionException("User do not have permission to get this file metadata")
//                        val userSharedFiles = fileRepository.fetchUserReceivedSharedFiles(currentUser.id!!)
//                        call.respond(userSharedFiles)
//                    }
//                }
                /**
                 * Edits file data (title)
                //                 * SCOPE = Registered (edits his own file)
                //                 */
                put("/file-id/{fileId}") {
                    call.withErrorHandler {
                        val fileId = call.parameters["fileId"]
                            ?: throw BadRequestException("File id is not present in the parameters.")
                        val fileRecord = fileRepository.fetch(UUID.fromString(fileId))
                            ?: throw NotFoundException("File was not found")
                        val currentUser = call.jwtUser()
                            ?: throw NoPermissionException("User do not have permission to get this file metadata")
                        if (!fileRecord.user.contentEquals(currentUser.id))
                            throw NoPermissionException("User do not have permission to get this file metadata")

                        val editedFile = call.receive<EditableFile>()
                        if (editedFile.title == "")
                            throw BadRequestException("File title cannot be empty")

                        val sourceFile = File(fileRecord.location, fileRecord.title!!)
                        val newTitle = editedFile.title + "." + sourceFile.extension
                        val destinationFile = File(fileRecord.location, newTitle)

                        if (!sourceFile.renameTo(destinationFile))
                            throw BadRequestException("File renaming failed, check title")

                        fileRecord.title = newTitle
                        fileRepository.update(fileRecord)

                        call.respondJSON("File updated successfully", HttpStatusCode.OK)
                    }
                }

                put("/file-id/{fileId}/share/{shareCondition}") {
                    call.withErrorHandler {
                        val fileId = call.parameters["fileId"]
                            ?: throw BadRequestException("File id is not present in the parameters.")
                        val shareCondition = call.parameters["shareCondition"]?.toBooleanStrictOrNull()
                            ?: throw BadRequestException("Share condition is not present in the parameters or in wrong format.")
                        val fileRecord = fileRepository.fetch(UUID.fromString(fileId))
                            ?: throw NotFoundException("File was not found")
                        val currentUser = call.jwtUser()
                            ?: throw NoPermissionException("User do not have permission to modify this file metadata")
                        if (!fileRecord.user.contentEquals(currentUser.id))
                            throw NoPermissionException("User do not have permission to modify this file metadata")

                        if (shareCondition) {
                            if (fileRecord.link == null) {
                                fileRecord.link = UUID.randomUUID().toString()
                                fileRepository.update(fileRecord)
                                call.respondJSON("File shared successfully", HttpStatusCode.OK)
                            } else {
                                throw BadRequestException("File already has dynamic link")
                            }
                        } else {
                            if (fileRecord.link == null) {
                                throw BadRequestException("File is not shared")
                            } else {
                                fileRecord.link = null
                                fileRepository.update(fileRecord)
                                call.respondJSON("File unshared successfully", HttpStatusCode.OK)
                            }
                        }
                    }
                }

                delete("/file-id/{fileId}") {
                    call.withErrorHandler {
                        val fileId = call.parameters["fileId"]
                            ?: throw BadRequestException("File id is not present in the parameters.")
                        val fileRecord = fileRepository.fetch(UUID.fromString(fileId))
                            ?: throw NotFoundException("File was not found")
                        val currentUser = call.jwtUser()
                            ?: throw NoPermissionException("User do not have permission to get this file metadata")
                        if (!fileRecord.user.contentEquals(currentUser.id))
                            throw NoPermissionException("User do not have permission to get this file metadata")

                        val successfulDeletion = fileService.deletePhysicalFile(fileRecord.id!!)
                        if (!successfulDeletion) throw AccountLockedException("Unable to delete physical file")

                        fileRepository.delete(fileRecord.id!!)
                        call.respondJSON("File deleted successfully", HttpStatusCode.OK)
                    }
                }
            }
//        /**
//         * Generate dynamic link for file access
//         * SCOPE = ALL: (guest (with key), registered (his file))
//         */
//        post("/dynlink/file-id/{fileId}") {
//            call.withErrorHandler {
//                val fileId = call.parameters["fileId"]
//                    ?: throw BadRequestException("File id is not present in the parameters.")
//                val key = call.request.queryParameters["fileKey"]
//                val user = call.jwtUser()
//                val file = fileRepository.fetch(UUID.fromString(fileId))
//                    ?: throw NotFoundException("File was not found")
//
//                if (file.link != null) throw BadRequestException("File has link already")
//                if (file.user != null) {
//                    if (user == null || !file.user.contentEquals(user.id)) {
//                        throw NoPermissionException("User do not own the file.")
//                    }
//                } else {
//                    if (key == null) throw BadRequestException("File key is not provided.")
//                    else if (file.key != key) {
//                        throw BadRequestException("File key is not correct.")
//                    }
//                }
//
//                file.link = UUID.randomUUID().toString()
//                file.key = null
//                fileRepository.update(file)
//
//                call.respondJSON(file.link!!, HttpStatusCode.OK, "fileLink")
//            }
//        }
//        /**
//         * Get physical file by providing dynamic link id
//         * SCOPE = Guest
//         */
//        get("/dynlink-id/{dynlinkId}") {
//            call.withErrorHandler {
//            }
//        }
        }
    }
}