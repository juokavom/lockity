package lockity.routes

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
                return@get call.respond(HttpStatusCode.OK, User(userId, "single user email"))
            }
            get("/{userId}/{fileId}/{startsWith}"){
                val userId = call.parameters["userId"]!!.toInt()
                val fileId = call.parameters["fileId"]
                val startsWith = call.parameters["startsWith"]
                val users = listOf(
                    User(1, "11 - userId = $userId, fileId = $fileId, startsWith = $startsWith"),
                    User(2, "22 - userId = $userId, fileId = $fileId, startsWith = $startsWith")
                )
                return@get call.respond(HttpStatusCode.OK, users)
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