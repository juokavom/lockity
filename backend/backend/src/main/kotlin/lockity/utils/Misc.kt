package lockity.utils

import at.favre.lib.crypto.bcrypt.BCrypt
import com.auth0.jwt.JWT
import com.auth0.jwt.algorithms.Algorithm
import com.google.gson.JsonSyntaxException
import database.schema.tables.records.UserRecord
import io.ktor.application.*
import io.ktor.auth.*
import io.ktor.auth.jwt.*
import io.ktor.features.*
import io.ktor.http.*
import io.ktor.http.auth.*
import io.ktor.response.*
import kotlinx.coroutines.runBlocking
import kotlinx.serialization.SerializationException
import lockity.repositories.RoleRepository
import lockity.repositories.UserRepository
import lockity.services.ConfigurationService
import lockity.services.JwtService
import org.koin.ktor.ext.inject
import java.util.*
import javax.naming.NoPermissionException
import javax.security.auth.login.AccountLockedException

suspend fun ApplicationCall.withErrorHandler(block: suspend () -> Unit) {
    val badRequestParameters = "Bad request parameters"
    try {
        block()
    } catch (e: JsonSyntaxException) {
        this.respondJSON("Bad body parameters", HttpStatusCode.BadRequest)
    } catch (e: SerializationException) {
        this.respondJSON("Bad body parameters", HttpStatusCode.BadRequest)
    } catch (e: IllegalStateException) {
        this.respondJSON(badRequestParameters, HttpStatusCode.BadRequest)
    } catch (e: NullPointerException) {
        this.respondJSON(badRequestParameters, HttpStatusCode.BadRequest)
    } catch (e: java.lang.IllegalArgumentException) {
        this.respondJSON(badRequestParameters, HttpStatusCode.BadRequest)
    } catch (e: java.lang.NumberFormatException) {
        this.respondJSON(badRequestParameters, HttpStatusCode.BadRequest)
    } catch (e: java.time.format.DateTimeParseException) {
        this.respondJSON(badRequestParameters, HttpStatusCode.BadRequest)
    } catch (e: java.io.IOException) {
        this.respondJSON("File not attached correctly", HttpStatusCode.BadRequest)
    }  catch (e: AccountLockedException) {
        this.respondJSON(e.message.toString(), HttpStatusCode.Locked)
    } catch (e: BadRequestException) {
        this.respondJSON(e.message.toString(), HttpStatusCode.BadRequest)
    } catch (e: NotFoundException) {
        this.respondJSON(e.message.toString(), HttpStatusCode.NotFound)
    } catch (e: NoPermissionException) {
        this.respondJSON(e.message.toString(), HttpStatusCode.Forbidden)
    }
}

suspend fun ApplicationCall.respondJSON(message: String, httpStatusCode: HttpStatusCode, title: String? = "message") {
    this.respondText("{\"$title\":\"$message\"}", ContentType.Application.Json, httpStatusCode)
}

fun ApplicationCall.jwtUser(): UserRecord? {
    val userRepository: UserRepository by inject()
    val jwtService: JwtService by inject()

    return this.request.cookies[JWT_COOKIE_NAME]?.let {
        if (jwtService.isValidToken(it)) {
            userRepository.fetch(UUID.fromString(jwtService.getJwtUserId(it)))
        } else null
    }
}

fun ApplicationCall.setResponseJwtCookieHeader(id: String) {
    val jwtService: JwtService by inject()
    val configurationService: ConfigurationService by inject()

    this.response.header(
        "Set-Cookie", "$JWT_COOKIE_NAME=${
            jwtService.generateToken(id)
        }; Max-Age=${
            configurationService.configValue(CONFIG.JWT_SESSION_TIME_MILLIS).toInt() / 1000
        }; Path=/; HttpOnly"
    )
}

fun ApplicationCall.unsetResponseJwtCookieHeader() {
    this.response.header("Set-Cookie", "$JWT_COOKIE_NAME=; Path=/; HttpOnly")
}

fun Application.installJwtVerifier() = install(Authentication) {
    val configurationService: ConfigurationService by inject()
    val roleRepository: RoleRepository by inject()

    listOf(ROLE.ADMIN, ROLE.REGISTERED, ROLE.VIP).map {
        jwt(it) {
            authHeader { call ->
                val jwtCookie = call.request.cookies[JWT_COOKIE_NAME]
                if (jwtCookie == null || jwtCookie == "") {
                    runBlocking {
                        call.respondJSON("User not authenticated", HttpStatusCode.Unauthorized)
                    }
                    return@authHeader null
                }
                parseAuthorizationHeader("Bearer $jwtCookie")
            }
            verifier(
                JWT.require(
                    Algorithm.HMAC256(configurationService.configValue(CONFIG.JWT_SECRET))
                ).build()
            )
            validate { credential ->
                val role = this.jwtUser()?.let { userRecord ->
                    roleRepository.fetch(userRecord.role!!)?.name
                }
                if (role == null || role != it) {
                    this.respondJSON("User does not have permission", HttpStatusCode.Forbidden)
                    null
                } else {
                    JWTPrincipal(credential.payload)
                }
            }
        }
    }
    jwt(AUTHENTICATED) {
        authHeader { call ->
            val jwtCookie = call.request.cookies[JWT_COOKIE_NAME]
            if (jwtCookie == null || jwtCookie == "") {
                runBlocking {
                    call.respondJSON("User not authenticated", HttpStatusCode.Unauthorized)
                }
                return@authHeader null
            }
            parseAuthorizationHeader("Bearer $jwtCookie")
        }
        verifier(
            JWT.require(
                Algorithm.HMAC256(configurationService.configValue(CONFIG.JWT_SECRET))
            ).build()
        )
        validate { credential ->
            val role = this.jwtUser()?.let { userRecord ->
                roleRepository.fetch(userRecord.role!!)?.name
            }
            if (role != null && when (role) {
                    ROLE.ADMIN,
                    ROLE.REGISTERED,
                    ROLE.VIP -> true
                    else -> false
                }
            ) {
                JWTPrincipal(credential.payload)
            } else {
                this.respondJSON("User does not have permission", HttpStatusCode.Forbidden)
                null
            }
        }
    }
}