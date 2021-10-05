package lockity.Routes

import io.ktor.application.*
import io.ktor.auth.*
import io.ktor.http.*
import io.ktor.response.*
import io.ktor.routing.*
import lockity.utils.ROLE
import lockity.utils.generateJwtToken
import lockity.utils.JWT_COOKIE_NAME

fun Application.authRoutes() {
    routing {
        route("/auth") {
            post("/login") {
                call.response.header("Set-Cookie", "$JWT_COOKIE_NAME=${generateJwtToken(ROLE.ADMIN)}")
                call.respond(HttpStatusCode.NoContent)
            }
            post("/register"){
                call.respond(HttpStatusCode.NoContent)
            }
            post("/logout"){
                call.response.header("Set-Cookie", "$JWT_COOKIE_NAME=")
                call.respond(HttpStatusCode.NoContent)
            }
            post("/confirm"){
                call.respond(HttpStatusCode.NoContent)
            }
            post("/password/reset/request"){
                call.respond(HttpStatusCode.NoContent)
            }
            post("/password/reset/confirm"){
                call.respond(HttpStatusCode.NoContent)
            }
        }
    }
}