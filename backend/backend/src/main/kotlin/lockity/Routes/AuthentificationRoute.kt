package lockity.Routes

import io.ktor.application.*
import io.ktor.auth.*
import io.ktor.response.*
import io.ktor.routing.*
import lockity.utils.ROLE
import lockity.utils.generateJwtToken
import lockity.utils.JWT_COOKIE_NAME

fun Application.authenticationRoute() {
    routing {
        post("/login") {
            call.response.header("Set-Cookie", "$JWT_COOKIE_NAME=${generateJwtToken(ROLE.ADMIN)}")
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