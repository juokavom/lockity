package lockity.Routes

import database.schema.tables.records.UserRecord
import io.ktor.application.*
import io.ktor.features.*
import io.ktor.http.*
import io.ktor.request.*
import io.ktor.response.*
import io.ktor.routing.*
import lockity.Models.RegistrableUser
import lockity.repository.RoleRepository
import lockity.repository.UserRepository
import lockity.utils.*
import org.koin.ktor.ext.inject
import java.time.LocalDate

fun Application.authRoutes() {
    val emailService: EmailService by inject()
    val userRepository: UserRepository by inject()
    val roleRepository: RoleRepository by inject()

    routing {
        route("/auth") {
            post("/login") {
                call.response.header("Set-Cookie", "$JWT_COOKIE_NAME=${generateJwtToken(ROLE.ADMIN)}")
                call.respond(HttpStatusCode.NoContent)
            }
            post("/register") {
                withErrorHandler(call) {
                    val newUser = call.receive<RegistrableUser>()
                    if (!emailService.isEmailValid(newUser.email)) throw BadRequestException("Email is not in correct format.")
                    if (!userRepository.isEmailUnique(newUser.email)) throw BadRequestException("User exists.")
                    userRepository.insertUser(
                        UserRecord(
                            id = generateBinaryUUID(),
                            name = newUser.name,
                            surname = newUser.surname,
                            email = newUser.email,
                            password = bcryptPassword(newUser.password),
                            role = roleRepository.roleUUID(ROLE.REGISTERED),
                            registered = LocalDate.now(),
                            lastActive = LocalDate.now(),
                            confirmed = 0
                        )
                    )
                    call.respondJSON("User created", HttpStatusCode.Created)
                }
            }
            post("/logout") {
                call.response.header("Set-Cookie", "$JWT_COOKIE_NAME=")
                call.respond(HttpStatusCode.NoContent)
            }
            post("/confirm") {
                call.respond(HttpStatusCode.NoContent)
            }
            post("/password/reset/request") {
                call.respond(HttpStatusCode.NoContent)
            }
            post("/password/reset/confirm") {
                call.respond(HttpStatusCode.NoContent)
            }
        }
    }
}