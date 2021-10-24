package lockity.routes

import database.schema.tables.records.ConfirmationLinkRecord
import database.schema.tables.records.UserRecord
import io.ktor.application.*
import io.ktor.features.*
import io.ktor.http.*
import io.ktor.request.*
import io.ktor.response.*
import io.ktor.routing.*
import lockity.models.ConfirmableLink
import lockity.models.RegistrableUser
import lockity.models.SignInableUser
import lockity.repositories.ConfirmationLinkRepository
import lockity.repositories.RoleRepository
import lockity.repositories.UserRepository
import lockity.services.ConfigurationService
import lockity.services.EmailService
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
    val confirmationLinkRepository: ConfirmationLinkRepository by inject()
    val configurationService: ConfigurationService by inject()

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
                    } ?: throw NotFoundException("User does not exists.")
                }
            }
            post("/register") {
                withErrorHandler(call) {
                    val newUser = call.receive<RegistrableUser>()
                    if (!emailService.isEmailValid(newUser.email)) throw BadRequestException("Email is not in correct format.")
                    if (!userRepository.isEmailUnique(newUser.email)) throw BadRequestException("User exists.")
                    val userId = databaseService.uuidToBin()
                    userRepository.insertUser(
                        UserRecord(
                            id = userId,
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
                    val confirmationLink = ConfirmationLinkRecord(
                        id = databaseService.uuidToBin(),
                        user = userId,
                        link = UUID.randomUUID().toString(),
                        validUntil = LocalDateTime.now().plusMinutes(
                            configurationService.configValue(
                                CONFIG.LINK_EXPIRY_MINUTES
                            ).toLong()
                        )
                    )
                    confirmationLinkRepository.insertLink(confirmationLink)
                    emailService.sendEmail(
                        newUser.email,
                        "Welcome to lockity ${newUser.name ?: ""}!",
                        emailService.confirmRegistrationTemplate(confirmationLink)
                    )
                    call.respondJSON(
                        "Successful registration. Check your email for further steps.",
                        HttpStatusCode.Created
                    )
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
            post("/confirm") {
                withErrorHandler(call) {
                    val fetchLinkData = confirmationLinkRepository.fetchConfirmationLinkAndUserRecordMapByLink(
                        call.receive<ConfirmableLink>().link
                    )
                    fetchLinkData?.confirmationLink?.let {
                        if(it.validUntil!! < LocalDateTime.now()) throw BadRequestException("Confirmation link expired")
                        fetchLinkData.user.let { user ->
                            if(user.confirmed == "1".toByte()) throw BadRequestException("User already confirmed")
                            user.confirmed = "1".toByte()
                            userRepository.updateUser(user)
                            call.respondJSON("Successful confirmation", HttpStatusCode.OK)
                        }
                    } ?: throw NotFoundException("Confirmation link does not exist.")
                }
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