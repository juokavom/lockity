package lockity.routes

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
                val rootPath = environment.config.property(CONFIG.FILEPATH_ROOT_PATH).getString()
                val storagePath = environment.config.property(CONFIG.FILEPATH_STORAGE).getString()
                val file = File("$rootPath$storagePath/sample.mp4")
                call.respondFile(file)
            }
        }
    }
}