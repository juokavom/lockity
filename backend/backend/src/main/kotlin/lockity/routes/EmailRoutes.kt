package lockity.routes

import io.ktor.application.*
import io.ktor.http.*
import io.ktor.response.*
import io.ktor.routing.*

fun Application.emailRoutes() {
    routing {
        route("/email") {
            /**
             * Send newsletter to all subscribers
             * SCOPE = ADMIN
             */
            post("/newsletter") {
                call.respond(HttpStatusCode.NoContent)
            }
            /**
             * Send newsletter to all subscribers
             * SCOPE = ADMIN
             */
            post("/file-share") {
                call.respond(HttpStatusCode.NoContent)
            }
        }
    }
}