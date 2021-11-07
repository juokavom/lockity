package lockity.routes

import io.ktor.application.*
import io.ktor.features.*
import io.ktor.http.*
import io.ktor.request.*
import io.ktor.response.*
import io.ktor.routing.*
import lockity.models.AnonymousFileMetadata
import lockity.repositories.FileRepository
import lockity.services.jwtUser
import lockity.utils.respondJSON
import lockity.utils.withErrorHandler
import org.koin.ktor.ext.inject
import java.util.*
import javax.naming.NoPermissionException

fun Application.dynlinkRoutes() {
    val fileRepository: FileRepository by inject()
    routing {
        route("/dynlink") {
            get {
                val dynlinks = listOf(
                    DynamicLink(1, "title1", 4444),
                    DynamicLink(2, "title2", 9999)
                )
                call.respond(HttpStatusCode.OK, dynlinks)
            }
            post("/file-id/{fileId}") {
                call.withErrorHandler {
                    val fileId = call.parameters["fileId"]
                        ?: throw BadRequestException("File id is not present in the parameters.")
                    val key = call.request.queryParameters["key"]
                    val user = call.jwtUser()
                    val file = fileRepository.fetch(UUID.fromString(fileId))
                        ?: throw NotFoundException("File was not found")

                    if (file.user != null) {
                        if (user == null || !file.user.contentEquals(user.id)) {
                            throw NoPermissionException("User do not own the file.")
                        }
                    } else if (key != null) {
                        if (file.key != key) {
                            throw NoPermissionException("File key does not match.")
                        }
                    }

                    file.link = UUID.randomUUID().toString()
                    file.key = null
                    fileRepository.update(file)

                    call.respondJSON(file.link!!, HttpStatusCode.OK, "fileLink")
                }
            }
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

data class DynamicLink(val id: Int, val title: String, val fileId: Int)