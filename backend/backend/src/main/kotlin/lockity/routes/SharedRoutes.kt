package lockity.routes

import io.ktor.application.*
import io.ktor.http.*
import io.ktor.response.*
import io.ktor.routing.*

fun Application.sharedRoutes() {
    routing {
        route("/shared") {
            /**
             * Get shared access list
             * SCOPE = registered (on his file)
             */
            get {
                val shares = listOf(
                    SharedAccess(1, "title1", 4444),
                    SharedAccess(2, "title2", 9999)
                )
                call.respond(HttpStatusCode.OK, shares)
            }
            /**
             * Create shared access record (fileId, ownerId, guesId)
             * SCOPE = registered (on his file)
             */
            post {
                call.respond(HttpStatusCode.Created)
            }
            /**
             * Get shared access record
             * SCOPE = registered (on his file)
             */
            get("/{shareId}") {
                val shareId = call.parameters["shareId"]!!.toInt()
                call.respond(HttpStatusCode.OK, SharedAccess(1, "title1[$shareId]", 6666))
            }
            /**
             * Edit shared access record
             * SCOPE = registered (on his file)
             */
            put("/{shareId}") {
                call.respond(HttpStatusCode.NoContent)
            }
            /**
             * Delete shared access record
             * SCOPE = registered (on his file)
             */
            delete("/{shareId}") {
                call.respond(HttpStatusCode.NoContent)
            }
        }
    }
}

data class SharedAccess(val id: Int, val title: String, val fileId: Int)