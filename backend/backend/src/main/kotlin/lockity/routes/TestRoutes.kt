package lockity.routes

import io.ktor.application.*
import io.ktor.auth.*
import io.ktor.features.*
import io.ktor.http.*
import io.ktor.routing.*
import lockity.utils.AUTHENTICATED
import lockity.utils.ROLE
import lockity.utils.respondJSON

fun Application.testRoutes() {
    routing {
        route("/test") {
            /**
             * Authorization testing routes
             */
            get("/simple") {
                call.respondJSON("Just simple! IP: ${call.request.origin.remoteHost}", HttpStatusCode.OK)
            }
            authenticate(AUTHENTICATED) {
                get("/authenticated") {
                    call.respondJSON("Nice authed!", HttpStatusCode.OK)
                }
            }
            authenticate(ROLE.ADMIN) {
                get("/admin") {
                    call.respondJSON("Nice authed admin!", HttpStatusCode.OK)
                }
            }
        }
    }
}