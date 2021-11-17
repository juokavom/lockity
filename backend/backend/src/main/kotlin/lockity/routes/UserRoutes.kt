package lockity.routes

import io.ktor.application.*
import io.ktor.auth.*
import io.ktor.features.*
import io.ktor.http.*
import io.ktor.request.*
import io.ktor.response.*
import io.ktor.routing.*
import lockity.models.EditableUser
import lockity.services.UserService
import lockity.services.jwtUser
import lockity.services.unsetResponseJwtCookieHeader
import lockity.utils.*
import org.koin.ktor.ext.inject
import javax.naming.NoPermissionException

fun Application.userRoutes() {
    val userService: UserService by inject()
    val databaseService: DatabaseService by inject()

    routing {
        route("/user") {
            authenticate(ROLE.ADMIN) {
                get("/offset/{offset}/limit/{limit}") {
                    call.withErrorHandler {
                        val offset = call.parameters["offset"]?.toIntOrNull()
                            ?: throw BadRequestException("Offset is not present in the parameters or in bad format.")
                        val limit = call.parameters["limit"]?.toIntOrNull()
                            ?: throw BadRequestException("Limit is not present in the parameters or in bad format.")
                        call.respond(userService.getUsers(offset, limit))
                    }
                }

                get("/count") {
                    call.withErrorHandler {
                        call.respond(userService.getUserCount())
                    }
                }

                post {
                    call.withErrorHandler {
                        userService.createUser(call.receive())
                        call.respondJSON(
                            "User created successfully.",
                            HttpStatusCode.Created
                        )
                    }
                }

                put("/{userId}") {
                    call.withErrorHandler {
                        val userId = call.parameters["userId"]
                            ?: throw BadRequestException("User id is not present in the parameters.")
                        val editedUser = call.receive<EditableUser>()
                        userService.editUser(userId, editedUser)
                        call.respondJSON(
                            "User edited successfully.",
                            HttpStatusCode.OK
                        )
                    }
                }

                delete("/{userId}") {
                    call.withErrorHandler {
                        val userId = call.parameters["userId"]
                            ?: throw BadRequestException("User id is not present in the parameters.")
                        userService.deleteUser(userId)
                        if (databaseService.binToUuid(call.jwtUser()!!.id!!).toString() == userId) {
                            call.unsetResponseJwtCookieHeader()
                        }
                        call.respondJSON(
                            "User deleted successfully.",
                            HttpStatusCode.OK
                        )
                    }
                }
            }
            authenticate(AUTHENTICATED) {
                get("/{userId}") {
                    call.withErrorHandler {
                        val userId = call.parameters["userId"]
                            ?: throw BadRequestException("User id is not present in the parameters.")
                        val currentUser = call.jwtUser()
                            ?: throw NoPermissionException("User do not have permission to get this user")
                        call.respond(userService.getUser(currentUser, userId))
                    }
                }

                put("/{userId}/self") {
                    call.withErrorHandler {
                        val userId = call.parameters["userId"]
                            ?: throw BadRequestException("User id is not present in the parameters.")
                        val currentUser = call.jwtUser()
                            ?: throw NoPermissionException("User do not have permission to edit this user")
                        userService.editUser(currentUser, userId, call.receive())
                        call.respondJSON(
                            "User edited successfully.",
                            HttpStatusCode.OK
                        )
                    }
                }

                get("/email-starts-with/{email}") {
                    call.withErrorHandler {
                        val email = call.parameters["email"]
                            ?: throw BadRequestException("Email is not present in the parameters.")
                        val currentUser = call.jwtUser()
                            ?: throw NoPermissionException("User do not have permission to modify this file metadata")
                        call.respond(userService.getUsers(currentUser, email))
                    }
                }
            }
        }
    }
}