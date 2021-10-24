package lockity.routes

import database.schema.tables.records.UserRecord
import io.ktor.application.*
import io.ktor.auth.*
import io.ktor.features.*
import io.ktor.http.*
import io.ktor.request.*
import io.ktor.response.*
import io.ktor.routing.*
import lockity.models.RegistrableUser
import lockity.models.SignInableUser
import lockity.repositories.RoleRepository
import lockity.repositories.UserRepository
import lockity.services.JwtService
import lockity.utils.*
import org.koin.ktor.ext.inject
import java.time.LocalDateTime
import java.util.*

fun Application.authRoutes() {
    val emailService: EmailService by inject()
    val userRepository: UserRepository by inject()
    val roleRepository: RoleRepository by inject()
    val databaseService: DatabaseService by inject()
    val jwtService: JwtService by inject()

    routing {
        route("/auth") {
            post("/login") {
                withErrorHandler(call) {
                    val signInUser = call.receive<SignInableUser>()
                    userRepository.fetchLoginUserMap(signInUser.email)?.let { dbUser ->
                        dbUser[USER.CONFIRMED].let {
                            if (it == null || it == "0") throw BadRequestException("User is not confirmed.")
                        }
                        dbUser[USER.PASSWORD].let { password ->
                            if (password == null || !passwordIsCorrect(signInUser.password, password)) {
                                throw BadRequestException("Password is incorrect")
                            }
                        }
                        dbUser[USER.ID]?.let { uid ->
                            dbUser[USER.ROLE]?.let { urole ->
                                call.response.header(
                                    "Set-Cookie",
                                    "$JWT_COOKIE_NAME=${jwtService.generateToken(uid, urole)}"
                                )
                                userRepository.updateLastActive(UUID.fromString(uid))
                                call.respondJSON("Login successful", HttpStatusCode.OK)
                            }
                        }
                    } ?: throw BadRequestException("User does not exists.")
                }
            }
            post("/register") {
                withErrorHandler(call) {
                    val newUser = call.receive<RegistrableUser>()
                    if (!emailService.isEmailValid(newUser.email)) throw BadRequestException("Email is not in correct format.")
                    if (!userRepository.isEmailUnique(newUser.email)) throw BadRequestException("User exists.")
                    userRepository.insertUser(
                        UserRecord(
                            id = databaseService.uuidToBin(),
                            name = newUser.name,
                            surname = newUser.surname,
                            email = newUser.email,
                            password = bcryptPassword(newUser.password),
                            role = roleRepository.roleUUID(ROLE.REGISTERED),
                            registered = LocalDateTime.now(),
                            lastActive = LocalDateTime.now(),
                            confirmed = 0
                        )
                    )
                    call.respondJSON("User created", HttpStatusCode.Created)
                }
            }
            post("/logout") {
                withErrorHandler(call) {
                    val jwt = call.request.cookies[JWT_COOKIE_NAME]
                    if (jwt != null && jwtService.isValidToken(jwt)) {
                        call.response.header("Set-Cookie", "$JWT_COOKIE_NAME=")
                        call.respondJSON("Successful logout", HttpStatusCode.OK)
                    } else {
                        call.response.header("Set-Cookie", "$JWT_COOKIE_NAME=")
                        throw BadRequestException("User already logged out")
                    }
                }
            }
            authenticate(ROLE.ADMIN) {
                post("/admin") {
                    call.respondText("nice Admin")
                }
            }
            authenticate(AUTHENTICATED) {
                post("/authenticated") {
                    call.respondText("nice authenticated")
                }
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