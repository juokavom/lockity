package lockity.services

import com.auth0.jwt.JWT
import com.auth0.jwt.algorithms.Algorithm
import com.auth0.jwt.exceptions.SignatureVerificationException
import com.auth0.jwt.exceptions.TokenExpiredException
import database.schema.tables.records.UserRecord
import io.ktor.application.*
import io.ktor.auth.*
import io.ktor.auth.jwt.*
import io.ktor.http.*
import io.ktor.http.auth.*
import io.ktor.response.*
import kotlinx.coroutines.runBlocking
import lockity.repositories.RoleRepository
import lockity.repositories.UserRepository
import lockity.utils.*
import org.koin.ktor.ext.inject
import java.util.*

class JwtService(
    private val configurationService: ConfigurationService
) {
    fun isValidToken(jwt: String): Boolean {
        try {
            JWT.require(Algorithm.HMAC256(configurationService.configValue(CONFIG.JWT_SECRET))).build().verify(jwt)
        } catch (e: TokenExpiredException) {
            return false
        } catch (e: SignatureVerificationException) {
            return false
        } catch (e: Exception) {
            return false
        }
        return true
    }

    fun getJwtUserId(token: String): String = JWT.decode(token).getClaim(USER.ID).asString()

    fun generateToken(id: String): String = JWT.create()
        .withClaim(USER.ID, id)
        .withExpiresAt(
            Date(
                System.currentTimeMillis() + configurationService
                    .configValue(CONFIG.JWT_SESSION_TIME_MILLIS).toInt()
            )
        )
        .sign(Algorithm.HMAC256(configurationService.configValue(CONFIG.JWT_SECRET)))
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