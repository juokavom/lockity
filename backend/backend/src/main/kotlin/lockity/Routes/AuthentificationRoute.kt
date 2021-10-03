package lockity.Routes

import io.ktor.application.*
import io.ktor.auth.*
import io.ktor.response.*
import io.ktor.routing.*
import io.ktor.sessions.*
import lockity.utils.ROLE
import lockity.utils.generateJwtToken
import lockity.utils.jwtCookieName

fun Application.authenticationRoute() {
    routing {
        post("/login") {
            call.response.header("Set-Cookie", "$jwtCookieName=${generateJwtToken(ROLE.ADMIN)}")
            call.respondText("Issued token")
        }
        post("/register"){

        }
        authenticate(ROLE.ADMIN) {
            post("/secret") {
                call.respondText("nice")
            }
        }
    }
}