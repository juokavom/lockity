package lockity.routes

import io.ktor.application.*
import io.ktor.http.*
import io.ktor.response.*
import io.ktor.routing.*

fun Application.dynlinkRoutes() {
    routing {
        route("/dynlink") {
            get {
                val dynlinks = listOf(
                    DynamicLink(1, "title1", 4444),
                    DynamicLink(2, "title2", 9999)
                )
                call.respond(HttpStatusCode.OK, dynlinks)
            }
            post {
                call.respond(HttpStatusCode.Created)
            }
            get("/{dynlinkId}") {
                val dynlinkId = call.parameters["dynlinkId"]!!.toInt()
                call.respond(HttpStatusCode.OK, DynamicLink(1, "title1[$dynlinkId]", 6666))
            }
            put("/{dynlinkId}") {
                call.respond(HttpStatusCode.NoContent)
            }
            delete("/{dynlinkId}") {
                call.respond(HttpStatusCode.NoContent)
            }
        }
    }
}

data class DynamicLink(val id: Int, val title: String, val fileId: Int)