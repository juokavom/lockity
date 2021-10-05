package lockity.Routes

import io.ktor.application.*
import io.ktor.http.*
import io.ktor.response.*
import io.ktor.routing.*

fun Application.emailRoutes() {
    routing {
        route("/email/") {
            post("/newsletter") {
                call.respond(HttpStatusCode.NoContent)
            }
        }
    }
}