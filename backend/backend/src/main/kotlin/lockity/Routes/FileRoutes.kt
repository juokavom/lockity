package lockity.Routes

import io.ktor.application.*
import io.ktor.http.*
import io.ktor.response.*
import io.ktor.routing.*
import lockity.utils.CONFIG
import java.io.File

fun Application.fileRoutes() {
    routing {
        route("/file") {
            post {
                call.respond(HttpStatusCode.OK, "jf3io9f9s9sdfj32111")
            }
            get("/{fileId}") {
                val rootPath = environment.config.property(CONFIG.ROOT_PATH).getString()
                val storagePath = environment.config.property(CONFIG.STORAGE).getString()
                val file = File("$rootPath$storagePath/sample.mp4")
                call.respondFile(file)
            }
        }
    }
}