package lockity.routes

import database.schema.tables.records.ConfirmationLinkRecord
import database.schema.tables.records.UserRecord
import io.ktor.application.*
import io.ktor.features.*
import io.ktor.http.*
import io.ktor.request.*
import io.ktor.response.*
import io.ktor.routing.*
import lockity.models.*
import lockity.repositories.ConfirmationLinkRepository
import lockity.repositories.RoleRepository
import lockity.repositories.UserRepository
import lockity.services.ConfigurationService
import lockity.services.EmailService
import lockity.services.setResponseJwtCookieHeader
import lockity.services.unsetResponseJwtCookieHeader
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

        /**
         * Description: Logins user to the system
         * Params: null
         * Body: SignInAbleUser { name, email }
         * Validation: Check if user exist, password matches,
         * is confirmed (if not confirmed send another email with new link (expiry others))
         * OK Response: FrontEndUser {name, surname, email, password, subscribed, role }, JWT cookie
         * Scope: all
         */
        // TODO: persiusti confirm linka jei dar neconfirmintas (kitiem nustatyti valid boolean false)
        post("/login") {
            call.withErrorHandler {
                val signInUser = call.receive<SignInAbleUser>()
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
                        call.setResponseJwtCookieHeader(uid)
                        userRepository.updateLastActive(UUID.fromString(uid))
                        userRepository.fetch(UUID.fromString(uid))?.let { userRecord ->
                            call.respond(
                                HttpStatusCode.OK,
                                FrontendUser(
                                    email = userRecord.email!!,
                                    role = roleRepository.fetch(userRecord.role!!)!!.name!!
                                )
                            )
                        }
                    }
                } ?: throw NotFoundException("User does not exists.")
            }
        }

        /**
         * Description: Registers user to the system
         * Params: null
         * Body: RegistrableUser { name?, surname?, email, password, subscribed }
         * Validation: Check if required values are not empty, email matches regex,
         * email is unique
         * OK Response: message, send email link to user with confirmation link with expiry date
         * Scope: all
         */
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

        /**
         * Description: Logouts user from the system
         * Params: null
         * Body: null
         * Validation: null
         * OK Response: message, unset JWT cookie
         * Scope: all
         */
        post("/logout") {
            call.withErrorHandler {
                call.unsetResponseJwtCookieHeader()
                call.respondJSON("Successful logout", HttpStatusCode.OK)
            }
        }

        /**
         * Description: Confirms user registration
         * Params: null
         * Body: ConfirmableLink { link }
         * Validation: Check if confirmation link is not expired, link is valid and if user isn't already confirmed
         * OK Response: message, send email link to user with confirmation link with expiry date
         * Scope: all
         */
        //TODO: prideti boolean ar confirmation link valid
        post("/register/confirm") {
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

        /**
         * Description: Initiates user password reset
         * Params: null
         * Body: Email { email }
         * Validation: Check if email matches regex, user exist
         * OK Response: message, send email link to user with reset link with expiry date
         * Scope: all
         */
        // TODO: implementuot
        post("/password/reset") {
            call.withErrorHandler {
            }
        }

        /**
         * Description: Changes user password with reset link
         * Params: null
         * Body: PasswordReset { password, link }
         * Validation: Check if link is valid, not expired
         * OK Response: message, set link to invalid
         * Scope: all
         */
        // TODO: implementuot
        post("/password/confirm") {
            call.withErrorHandler {
            }
        }
    }
}