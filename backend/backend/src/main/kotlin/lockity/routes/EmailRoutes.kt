package lockity.routes

import io.ktor.application.*
import io.ktor.http.*
import io.ktor.response.*
import io.ktor.routing.*
import lockity.utils.withErrorHandler

fun Application.emailRoutes() {
    routing {
        route("/email") {

            /**
             * Description: Sends newsletter to subscribers
             * Params: null
             * Body: Newsletter { subject, htmlBody }
             * Validation: Check if values are not empty
             * OK Response: message, send newsletter
             * Scope: Admin
             */
            post("/newsletter") {
                call.withErrorHandler {

                    call.respond(HttpStatusCode.NoContent)
                }
            }

            /**
             * Description: Sends email with shared file link
             * Params: null
             * Body: FileShareEmail { email (receiver), name (sender), link }
             * Validation: Check if link is valid, email is in correct format
             * OK Response: message, set email to recipient
             * Scope: all
             */
            post("/file-share") {
                call.withErrorHandler {

                    call.respond(HttpStatusCode.NoContent)
                }
            }
        }
    }
}