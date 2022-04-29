package lockity.routes

import io.ktor.application.*
import io.ktor.http.*
import io.ktor.request.*
import io.ktor.response.*
import io.ktor.routing.*
import lockity.services.UserService
import lockity.utils.respondJSON
import lockity.utils.setResponseJwtCookieHeader
import lockity.utils.unsetResponseJwtCookieHeader
import lockity.utils.withErrorHandler
import org.koin.ktor.ext.inject

fun Application.authRoutes() {
    val userService: UserService by inject()

    routing {
        post("/login") {
            call.withErrorHandler {
                val loggedIdUser = userService.loginUser(call.receive())
                call.setResponseJwtCookieHeader(loggedIdUser.id)
                call.respond(loggedIdUser)
            }
        }

        post("/register") {
            call.withErrorHandler {
                userService.registerUser(call.receive())
                call.respondJSON(
                    "Successful registration. Check your email for further steps.",
                    HttpStatusCode.Created
                )
            }
        }

        post("/logout") {
            call.withErrorHandler {
                call.unsetResponseJwtCookieHeader()
                call.respondJSON("Successful logout", HttpStatusCode.OK)
            }
        }

        post("/register/confirm") {
            call.withErrorHandler {
                userService.confirmRegistration(call.receive())
                call.respondJSON("Successful confirmation", HttpStatusCode.OK)
            }
        }

        route("/forgot-password") {
            post {
                call.withErrorHandler {
                    userService.resetPassword(call.receive())
                    call.respondJSON(
                        "Password reset initiated. Check your email for further information.",
                        HttpStatusCode.OK
                    )
                }
            }

            post("/confirm") {
                call.withErrorHandler {
                    userService.confirmResetedPassword(call.receive())
                    call.respondJSON("Password changed successfully.", HttpStatusCode.OK)
                }
            }
        }
    }
}