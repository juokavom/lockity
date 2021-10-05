package lockity.Routes

import io.ktor.application.*
import io.ktor.http.*
import io.ktor.response.*
import io.ktor.routing.*

fun Application.userRoutes() {
    routing {
        route("/user") {
            get {
                val users = listOf(
                    User(1, "test1"),
                    User(2, "test2")
                )
                call.respond(HttpStatusCode.OK, users)
            }
            post {
                call.respond(HttpStatusCode.Created)
            }
            get("/{userId}"){
                val userId = call.parameters["userId"]!!.toInt()
                call.respond(HttpStatusCode.OK, User(userId, "testEmail"))
            }
            put("/{userId}"){
                call.respond(HttpStatusCode.NoContent)
            }
            delete("/{userId}"){
                call.respond(HttpStatusCode.NoContent)
            }
        }
    }
}

data class User(val id: Int, val email: String)