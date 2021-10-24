package lockity.routes

import io.ktor.application.*
import io.ktor.http.*
import io.ktor.response.*
import io.ktor.routing.*

fun Application.metadataRoutes() {
    routing {
        route("/file/metadata") {
            get {
                val metadatas = listOf(
                    Metadata(1, "title1", 4096),
                    Metadata(2, "title2", 8192)
                )
                call.respond(HttpStatusCode.OK, metadatas)
            }
            post {
                call.respond(HttpStatusCode.Created)
            }
            get("/{metadataId}") {
                val metaId = call.parameters["metadataId"]!!.toInt()
                call.respond(HttpStatusCode.OK, Metadata(1, "title1($metaId)", 4096))
            }
            put("/{metadataId}") {
                call.respond(HttpStatusCode.NoContent)
            }
            delete("/{metadataId}") {
                call.respond(HttpStatusCode.NoContent)
            }
        }
    }
}

data class Metadata(val id: Int, val title: String, val size: Int)