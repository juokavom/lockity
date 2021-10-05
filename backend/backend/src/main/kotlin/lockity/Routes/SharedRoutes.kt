package lockity.Routes

import io.ktor.application.*
import io.ktor.http.*
import io.ktor.response.*
import io.ktor.routing.*

fun Application.sharedRoutes() {
    routing {
        route("/shared") {
            get {
                val shares = listOf(
                    SharedAccess(1, "title1", 4444),
                    SharedAccess(2, "title2", 9999)
                )
                call.respond(HttpStatusCode.OK, shares)
            }
            post {
                call.respond(HttpStatusCode.Created)
            }
            get("/{shareId}") {
                val shareId = call.parameters["shareId"]!!.toInt()
                call.respond(HttpStatusCode.OK, SharedAccess(1, "title1[$shareId]", 6666))
            }
            put("/{shareId}") {
                call.respond(HttpStatusCode.NoContent)
            }
            delete("/{shareId}") {
                call.respond(HttpStatusCode.NoContent)
            }
        }
    }
}

data class SharedAccess(val id: Int, val title: String, val fileId: Int)