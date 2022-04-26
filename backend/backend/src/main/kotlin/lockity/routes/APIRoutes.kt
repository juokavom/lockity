package lockity.routes

import io.ktor.application.*
import io.ktor.auth.*
import io.ktor.features.*
import io.ktor.http.*
import io.ktor.http.content.*
import io.ktor.request.*
import io.ktor.response.*
import io.ktor.routing.*
import lockity.models.TokenResponse
import lockity.services.APIService
import lockity.utils.AUTHENTICATED
import lockity.utils.jwtUser
import lockity.utils.respondJSON
import lockity.utils.withErrorHandler
import org.koin.ktor.ext.inject
import javax.naming.NoPermissionException

fun Application.apiRoutes() {
    val apiService: APIService by inject()

    routing {
        route("/api") {
            authenticate(AUTHENTICATED) {
                post {
                    call.withErrorHandler {
                        val currentUser = call.jwtUser()
                            ?: throw NoPermissionException("User do not have permission to generate token")
                        val token = apiService.createToken(call.receive(), currentUser)
                        call.respond(
                            TokenResponse(
                                message = "API token created successfully",
                                token = token
                            )
                        )
                    }
                }

                get("/offset/{offset}/limit/{limit}") {
                    call.withErrorHandler {
                        val currentUser = call.jwtUser()
                            ?: throw NoPermissionException("User do not have permission to get token information")
                        val offset = call.parameters["offset"]?.toIntOrNull()
                            ?: throw BadRequestException("Offset is not present in the parameters or in bad format.")
                        val limit = call.parameters["limit"]?.toIntOrNull()
                            ?: throw BadRequestException("Limit is not present in the parameters or in bad format.")
                        call.respond(apiService.getTokens(currentUser, offset, limit))
                    }
                }

                get("/count") {
                    call.withErrorHandler {
                        val currentUser = call.jwtUser()
                            ?: throw NoPermissionException("User do not have permission to get token information")
                        call.respond(apiService.getAPICount(currentUser.id!!))
                    }
                }

                delete("/api-id/{apiId}") {
                    call.withErrorHandler {
                        val apiId = call.parameters["apiId"]
                            ?: throw BadRequestException("API id is not present in the parameters.")
                        val currentUser = call.jwtUser()
                            ?: throw NoPermissionException("User do not have permission to delete this api metadata")
                        apiService.deleteAPI(currentUser, apiId)
                        call.respondJSON("API token deleted successfully", HttpStatusCode.OK)
                    }
                }
            }
            route("/file") {
                get("/metadata/offset/{offset}/limit/{limit}") {
                    call.withErrorHandler {
                        val offset = call.parameters["offset"]?.toIntOrNull()
                            ?: throw BadRequestException("Offset is not present in the parameters or in bad format.")
                        val limit = call.parameters["limit"]?.toIntOrNull()
                            ?: throw BadRequestException("Limit is not present in the parameters or in bad format.")
                        call.respond(apiService.getTokenFilesMetadata(call.receive(), offset, limit))
                    }
                }

                get("/metadata/info") {
                    call.withErrorHandler {
                        call.respond(apiService.getTokenFilesMetadataInfo(call.receive()))
                    }
                }

                get("/file-id/{fileId}/download") {
                    call.withErrorHandler {
                        val fileId = call.parameters["fileId"]
                            ?: throw BadRequestException("File id is not present in the parameters.")
                        val file = apiService.getTokenFile(fileId, call.receive())
                        call.response.header(
                            HttpHeaders.ContentDisposition,
                            ContentDisposition.Attachment.withParameter(
                                ContentDisposition.Parameters.FileName, file.name
                            ).toString()
                        )
                        call.respondFile(file)
                    }
                }

                post {
                    call.withErrorHandler {
                        val fileSize = call.request.headers["Content-Length"]!!.toLong()
                        val multipart = call.receiveMultipart()
                        var token: String? = null
                        var filePart: PartData.FileItem? = null
                        multipart.forEachPart { part ->
                            when (part) {
                                is PartData.FormItem -> {
                                    token = part.value
                                }
                                is PartData.FileItem -> {
                                    filePart = part
                                }
                                else -> throw BadRequestException("Unsupported multipart data")
                            }
                        }
                        if (token == null) throw BadRequestException("Token not attached")
                        if (filePart == null) throw BadRequestException("File not attached")
                        apiService.uploadTokenFile(token!!, filePart!!, fileSize)
                        call.respondJSON("File uploaded successfully", HttpStatusCode.Created)
                    }
                }

                put("/file-id/{fileId}") {
                    call.withErrorHandler {
                        val fileSize = call.request.headers["Content-Length"]!!.toLong()
                        val multipart = call.receiveMultipart()
                        var token: String? = null
                        var filePart: PartData.FileItem? = null
                        multipart.forEachPart { part ->
                            when (part) {
                                is PartData.FormItem -> {
                                    token = part.value
                                }
                                is PartData.FileItem -> {
                                    filePart = part
                                }
                                else -> throw BadRequestException("Unsupported multipart data")
                            }
                        }
                        if (token == null) throw BadRequestException("Token not attached")
                        if (filePart == null) throw BadRequestException("File not attached")
                        val fileId = call.parameters["fileId"]
                            ?: throw BadRequestException("File id is not present in the parameters.")
                        apiService.replaceTokenFile(fileId, token!!, filePart!!, fileSize)
                        call.respondJSON("File updated successfully", HttpStatusCode.OK)
                    }
                }

                delete("/file-id/{fileId}") {
                    call.withErrorHandler {
                        val fileId = call.parameters["fileId"]
                            ?: throw BadRequestException("File id is not present in the parameters.")
                        apiService.deleteTokenFile(call.receive(), fileId)
                        call.respondJSON("File deleted successfully", HttpStatusCode.OK)
                    }
                }
            }
        }
    }
}

