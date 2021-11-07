package lockity.routes

import database.schema.tables.records.ConfirmationLinkRecord
import database.schema.tables.records.UserRecord
import io.ktor.application.*
import io.ktor.auth.*
import io.ktor.features.*
import io.ktor.http.*
import io.ktor.request.*
import io.ktor.response.*
import io.ktor.routing.*
import lockity.models.*
import lockity.repositories.ConfirmationLinkRepository
import lockity.repositories.RoleRepository
import lockity.repositories.UserRepository
import lockity.services.*
import lockity.utils.*
import org.koin.ktor.ext.inject
import java.time.LocalDateTime
import java.util.*

fun Application.authRoutes() {
    val emailService: EmailService by inject()
    val userRepository: UserRepository by inject()
    val roleRepository: RoleRepository by inject()
    val databaseService: DatabaseService by inject()
    val confirmationLinkRepository: ConfirmationLinkRepository by inject()
    val configurationService: ConfigurationService by inject()

    routing {
        route("/auth") {
            post("/login") {
                call.withErrorHandler {
                    val signInUser = call.receive<SignInableUser>()
                    signInUser.isValuesValid()
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
                                call.setResponseJwtCookieHeader(uid, urole)
                                userRepository.updateLastActive(UUID.fromString(uid))
                                userRepository.fetch(UUID.fromString(uid))?.let { userRecord ->
                                    call.respond(HttpStatusCode.OK, FrontendUser.fromRecordAndRole(userRecord, urole))
                                }
                            }
                        }
                    } ?: throw NotFoundException("User does not exists.")
                }
            }
            post("/register") {
                call.withErrorHandler {
                    val newUser = call.receive<RegistrableUser>()
                    newUser.isValuesValid()
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
                            confirmed = 0,
                            subscribed = if (newUser.subscribed) "1".toByte() else "0".toByte(),
                            imagePath = configurationService.configValue(CONFIG.FILEPATH_DEFAULT_USER_IMAGE),
                            storageSize = DEFAULT_STORAGE_BYTES
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
                call.withErrorHandler {
                    call.unsetResponseJwtCookieHeader()
                    call.respondJSON("Successful logout", HttpStatusCode.OK)
                }
            }
            post("/confirm") {
                call.withErrorHandler {
                    val link = call.receive<ConfirmableLink>()
                    link.isValuesValid()
                    val fetchLinkData =
                        confirmationLinkRepository.fetchConfirmationLinkAndUserRecordMapByLink(link.link)
                    fetchLinkData?.confirmationLink?.let {
                        if (it.validUntil!! < LocalDateTime.now()) throw BadRequestException("Confirmation link expired")
                        fetchLinkData.user.let { user ->
                            if (user.confirmed == "1".toByte()) throw BadRequestException("User already confirmed")
                            user.confirmed = "1".toByte()
                            userRepository.updateUser(user)
                            call.respondJSON("Successful confirmation", HttpStatusCode.OK)
                        }
                    } ?: throw NotFoundException("Confirmation link does not exist.")
                }
            }
            get("/simple") {
                call.respondJSON("Just simple!", HttpStatusCode.OK)
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
            post("/password/reset/request") {
                call.respond(HttpStatusCode.NotImplemented)
            }
            post("/password/reset/confirm") {
                call.respond(HttpStatusCode.NotImplemented)
            }
        }
    }
}