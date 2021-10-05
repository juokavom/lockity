package lockity.Routes

import io.ktor.application.*
import io.ktor.http.*
import io.ktor.response.*
import io.ktor.routing.*

fun Application.emailTemplateRoutes() {
    routing {
        route("/email/templates") {
            get {
                val templates = listOf(
                    EmailTemplate(1, "Hello, subscriber!"),
                    EmailTemplate(2, "Low memory!")
                )
                call.respond(HttpStatusCode.OK, templates)
            }
            get("/{templateId}") {
                val templateId = call.parameters["templateId"]!!.toInt()
                call.respond(HttpStatusCode.OK, EmailTemplate(1, "Some new text of template $templateId"))
            }
            put("/{templateId}") {
                call.respond(HttpStatusCode.NoContent)
            }
        }
    }
}

data class EmailTemplate(val id: Int, val content: String)