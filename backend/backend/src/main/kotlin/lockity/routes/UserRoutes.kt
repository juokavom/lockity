package lockity.routes

import io.ktor.application.*
import io.ktor.http.*
import io.ktor.response.*
import io.ktor.routing.*

fun Application.userRoutes() {
    routing {
        route("/user") {
            /**
             * Get registered users with email filter
             * SCOPE = REGISTERED
             */
            get("/email-like/{emailLike}}") {
                val users = listOf(
                    User(1, "test1"),
                    User(2, "test2")
                )
                call.respond(HttpStatusCode.OK, users)
            }
            /**
             * Post new user
             * SCOPE = ADMIN
             */
            post {
                call.respond(HttpStatusCode.Created)
            }
            /**
             * Get user with id
             * SCOPE = Registered
             */
            get("/{userId}") {
                val userId = call.parameters["userId"]!!.toInt()
                return@get call.respond(HttpStatusCode.OK, User(userId, "single user email"))
            }
            /**
             * Edit user with id
             * SCOPE = Registered (if self), Admin
             */
            put("/{userId}") {
                call.respond(HttpStatusCode.NoContent)
            }
            /**
             * Delete user with id
             * SCOPE = Admin
             */
            delete("/{userId}") {
                call.respond(HttpStatusCode.NoContent)
            }
        }
    }
}

data class User(val id: Int, val email: String)