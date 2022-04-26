package lockity.routes

import io.ktor.application.*
import io.ktor.auth.*
import io.ktor.features.*
import io.ktor.http.*
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
        }
    }
}

