package lockity.routes

import io.ktor.application.*
import io.ktor.auth.*
import io.ktor.features.*
import io.ktor.http.*
import io.ktor.request.*
import io.ktor.response.*
import io.ktor.routing.*
import lockity.services.SharedAccessService
import lockity.utils.AUTHENTICATED
import lockity.utils.jwtUser
import lockity.utils.respondJSON
import lockity.utils.withErrorHandler
import org.koin.ktor.ext.inject
import javax.naming.NoPermissionException

fun Application.sharedRoutes() {
    val sharedAccessService: SharedAccessService by inject()

    routing {
        route("/shared-access") {
            authenticate(AUTHENTICATED) {
                get("/offset/{offset}/limit/{limit}") {
                    call.withErrorHandler {
                        val currentUser = call.jwtUser()
                            ?: throw NoPermissionException("User do not have permission to get this shared access")
                        val offset = call.parameters["offset"]?.toIntOrNull()
                            ?: throw BadRequestException("Offset is not present in the parameters or in bad format.")
                        val limit = call.parameters["limit"]?.toIntOrNull()
                            ?: throw BadRequestException("Limit is not present in the parameters or in bad format.")
                        call.respond(sharedAccessService.getUserSharedAccessMetadata(currentUser, offset, limit))
                    }
                }

                get("/count") {
                    call.withErrorHandler {
                        val currentUser = call.jwtUser()
                            ?: throw NoPermissionException("User do not have permission to get this file metadata")
                        call.respond(sharedAccessService.getUserSharedAccessMetadataCount(currentUser))
                    }
                }

                post {
                    call.withErrorHandler {
                        val currentUser = call.jwtUser()
                            ?: throw NoPermissionException("User do not have permission to get this users received access")
                        sharedAccessService.createSharedAccess(currentUser, call.receive())
                        call.respondJSON(
                            "Shared access created successfully",
                            HttpStatusCode.Created
                        )
                    }
                }

                put("/{sharedId}") {
                    call.withErrorHandler {
                        val sharedId = call.parameters["sharedId"]
                            ?: throw BadRequestException("Share id is not present in the parameters.")
                        val currentUser = call.jwtUser()
                            ?: throw NoPermissionException("User do not have permission to get this users received access")
                        sharedAccessService.editSharedAccess(currentUser, sharedId, call.receive())
                        call.respondJSON(
                            "Shared access edited successfully",
                            HttpStatusCode.Created
                        )
                    }
                }

                delete("/{shareId}") {
                    call.withErrorHandler {
                        val shareId = call.parameters["shareId"]
                            ?: throw BadRequestException("Share id is not present in the parameters.")
                        val currentUser = call.jwtUser()
                            ?: throw NoPermissionException("User do not have permission to delete this access")
                        sharedAccessService.deleteSharedAccess(currentUser, shareId)
                        call.respondJSON(
                            "Shared access deleted successfully.",
                            HttpStatusCode.OK
                        )
                    }
                }
            }
        }
    }
}