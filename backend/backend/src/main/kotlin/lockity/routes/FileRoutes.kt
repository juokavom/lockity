package lockity.routes

import io.ktor.application.*
import io.ktor.auth.*
import io.ktor.features.*
import io.ktor.http.*
import io.ktor.http.content.*
import io.ktor.request.*
import io.ktor.response.*
import io.ktor.routing.*
import lockity.models.EditableFile
import lockity.services.FileService
import lockity.utils.AUTHENTICATED
import lockity.utils.jwtUser
import lockity.utils.respondJSON
import lockity.utils.withErrorHandler
import org.koin.ktor.ext.inject
import javax.naming.NoPermissionException

fun Application.fileRoutes() {
    val fileService: FileService by inject()

    routing {
        route("/file") {
            post("/anonymous") {
                call.withErrorHandler {
                    val fileSize = call.request.headers["Content-Length"]!!.toLong()
                    val part = call.receiveMultipart().readPart()
                        ?: throw BadRequestException("File not attached")
                    if (part !is PartData.FileItem)
                        throw BadRequestException("Multipart data is not file type")
                    call.respond(fileService.uploadGuestFile(part, fileSize))
                }
            }

            authenticate(AUTHENTICATED) {
                post {
                    call.withErrorHandler {
                        val fileSize = call.request.headers["Content-Length"]!!.toLong()
                        val part = call.receiveMultipart().readPart()
                            ?: throw BadRequestException("File not attached")
                        if (part !is PartData.FileItem)
                            throw BadRequestException("Multipart data is not file type")
                        val currentUser = call.jwtUser()
                            ?: throw BadRequestException("User not found")
                        fileService.uploadUserFile(currentUser, part, fileSize)
                        call.respondJSON("User file uploaded successfully", HttpStatusCode.Created)
                    }
                }

                get("/file-id/{fileId}/stream") {
                    call.withErrorHandler {
                        val fileId = call.parameters["fileId"]
                            ?: throw BadRequestException("File id is not present in the parameters.")
                        val currentUser = call.jwtUser()
                            ?: throw NoPermissionException("No permission to stream the file")
                        call.respondFile(fileService.getUserFile(fileId, currentUser.id!!))
                    }
                }

                get("/file-id/{fileId}/download") {
                    call.withErrorHandler {
                        val fileId = call.parameters["fileId"]
                            ?: throw BadRequestException("File id is not present in the parameters.")
                        val currentUser = call.jwtUser()
                            ?: throw NoPermissionException("No permission to download the file")
                        val file = fileService.getUserFile(fileId, currentUser.id!!)
                        call.response.header(
                            HttpHeaders.ContentDisposition,
                            ContentDisposition.Attachment.withParameter(
                                ContentDisposition.Parameters.FileName, file.name
                            ).toString()
                        )
                        call.respondFile(file)
                    }
                }

                get("/received/receive-id/{receiveId}/stream") {
                    call.withErrorHandler {
                        val receiveId = call.parameters["receiveId"]
                            ?: throw BadRequestException("Receive id is not present in the parameters.")
                        val currentUser = call.jwtUser()
                            ?: throw NoPermissionException("No permission to stream the file")
                        call.respondFile(
                            fileService.getUserReceivedFile(receiveId, currentUser)
                        )
                    }
                }

                get("/received/receive-id/{receiveId}/download") {
                    call.withErrorHandler {
                        val receiveId = call.parameters["receiveId"]
                            ?: throw BadRequestException("Receive id is not present in the parameters.")
                        val currentUser = call.jwtUser()
                            ?: throw NoPermissionException("No permission to stream the file")
                        val file = fileService.getUserReceivedFile(receiveId, currentUser)
                        call.response.header(
                            HttpHeaders.ContentDisposition,
                            ContentDisposition.Attachment.withParameter(
                                ContentDisposition.Parameters.FileName, file.name
                            ).toString()
                        )
                        call.respondFile(file)
                    }
                }

                get("/metadata/offset/{offset}/limit/{limit}") {
                    call.withErrorHandler {
                        val currentUser = call.jwtUser()
                            ?: throw NoPermissionException("User do not have permission to get this file metadata")
                        val offset = call.parameters["offset"]?.toIntOrNull()
                            ?: throw BadRequestException("Offset is not present in the parameters or in bad format.")
                        val limit = call.parameters["limit"]?.toIntOrNull()
                            ?: throw BadRequestException("Limit is not present in the parameters or in bad format.")
                        call.respond(fileService.getUserFilesMetadata(currentUser.id!!, offset, limit))
                    }
                }

                get("/metadata/info") {
                    call.withErrorHandler {
                        val currentUser = call.jwtUser()
                            ?: throw NoPermissionException("User do not have permission to get this file metadata")
                        call.respond(fileService.getUserFilesMetadataInfo(currentUser))
                    }
                }

                get("/received/metadata/offset/{offset}/limit/{limit}") {
                    call.withErrorHandler {
                        val currentUser = call.jwtUser()
                            ?: throw NoPermissionException("User do not have permission to get this file metadata")
                        val offset = call.parameters["offset"]?.toIntOrNull()
                            ?: throw BadRequestException("Offset is not present in the parameters or in bad format.")
                        val limit = call.parameters["limit"]?.toIntOrNull()
                            ?: throw BadRequestException("Limit is not present in the parameters or in bad format.")
                        call.respond(fileService.getUserReceivedFilesMetadata(currentUser, offset, limit))
                    }
                }

                get("/received/metadata/count") {
                    call.withErrorHandler {
                        val currentUser = call.jwtUser()
                            ?: throw NoPermissionException("User do not have permission to get this file metadata")
                        call.respond(fileService.getUserReceivedFilesMetadataCount(currentUser))
                    }
                }

                get("/metadata/title-starts-with/{title}") {
                    call.withErrorHandler {
                        val currentUser = call.jwtUser()
                            ?: throw NoPermissionException("User do not have permission to get this file metadata")
                        val title = call.parameters["title"]
                            ?: throw BadRequestException("Title is not present in the parameters.")
                        call.respond(fileService.getUserFilesMetadata(currentUser, title))
                    }
                }

                put("/file-id/{fileId}") {
                    call.withErrorHandler {
                        val fileSize = call.request.headers["Content-Length"]!!.toLong()
                        val part = call.receiveMultipart().readPart()
                            ?: throw BadRequestException("File not attached")
                        if (part !is PartData.FileItem)
                            throw BadRequestException("Multipart data is not file type")
                        val fileId = call.parameters["fileId"]
                            ?: throw BadRequestException("File id is not present in the parameters.")
                        val currentUser = call.jwtUser()
                            ?: throw NoPermissionException("User do not have permission to get this file metadata")
                        fileService.editUserFile(fileId, currentUser, part, fileSize)
                        call.respondJSON("File updated successfully", HttpStatusCode.OK)
                    }
                }

                put("/title/file-id/{fileId}") {
                    call.withErrorHandler {
                        val fileId = call.parameters["fileId"]
                            ?: throw BadRequestException("File id is not present in the parameters.")
                        val currentUser = call.jwtUser()
                            ?: throw NoPermissionException("User do not have permission to get this file metadata")
                        val editedFile = call.receive<EditableFile>()
                        fileService.updateUserFileTitle(currentUser, fileId, editedFile)
                        call.respondJSON("File updated successfully", HttpStatusCode.OK)
                    }
                }

                put("/file-id/{fileId}/share/{shareCondition}") {
                    call.withErrorHandler {
                        val fileId = call.parameters["fileId"]
                            ?: throw BadRequestException("File id is not present in the parameters.")
                        val shareCondition = call.parameters["shareCondition"]?.toBooleanStrictOrNull()
                            ?: throw BadRequestException("Share condition is not present in the parameters or in wrong format.")
                        val currentUser = call.jwtUser()
                            ?: throw NoPermissionException("User do not have permission to modify this file metadata")
                        val link = fileService.modifyUserFileSharing(currentUser, fileId, shareCondition)
                        val returnable = link?.let {
                            "\"$it\""
                        } ?: link
                        call.respondText("{\"fileLink\":$returnable}", ContentType.Application.Json, HttpStatusCode.OK)
                    }
                }

                delete("/file-id/{fileId}") {
                    call.withErrorHandler {
                        val fileId = call.parameters["fileId"]
                            ?: throw BadRequestException("File id is not present in the parameters.")
                        val currentUser = call.jwtUser()
                            ?: throw NoPermissionException("User do not have permission to get this file metadata")
                        fileService.deleteFile(currentUser.id!!, fileId)
                        call.respondJSON("File deleted successfully", HttpStatusCode.OK)
                    }
                }
            }

            get("/dynlink-id/{dynlinkId}/download") {
                call.withErrorHandler {
                    val dynlinkId = call.parameters["dynlinkId"]
                        ?: throw BadRequestException("Dynamic link id is not present in the parameters.")
                    val file = fileService.getDynamicLinkFile(dynlinkId)
                    call.response.header(
                        HttpHeaders.ContentDisposition,
                        ContentDisposition.Attachment.withParameter(
                            ContentDisposition.Parameters.FileName, file.name
                        ).toString()
                    )
                    call.respondFile(file)
                }
            }

            get("/metadata/dynlink-id/{dynlinkId}") {
                call.withErrorHandler {
                    val dynlinkId = call.parameters["dynlinkId"]
                        ?: throw BadRequestException("Dynamic link id is not present in the parameters.")
                    call.respond(fileService.getDynamicLinkFileTitleLink(dynlinkId))
                }
            }
        }
    }
}