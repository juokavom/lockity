package lockity.services

import com.auth0.jwt.JWT
import com.auth0.jwt.algorithms.Algorithm
import com.auth0.jwt.exceptions.SignatureVerificationException
import com.auth0.jwt.exceptions.TokenExpiredException
import io.ktor.application.*
import io.ktor.auth.*
import io.ktor.auth.jwt.*
import io.ktor.http.auth.*
import io.ktor.response.*
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

    fun generateToken(id: String, role: String): String = JWT.create()
        .withClaim(USER.ID, id)
        .withClaim(USER.ROLE, role)
        .withExpiresAt(
            Date(
                System.currentTimeMillis() + configurationService
                    .configValue(CONFIG.JWT_SESSION_TIME_MILLIS).toInt()
            )
        )
        .sign(Algorithm.HMAC256(configurationService.configValue(CONFIG.JWT_SECRET)))
}

fun ApplicationCall.setResponseJwtCookieHeader(id: String, role: String) {
    val jwtService: JwtService by inject()
    val configurationService: ConfigurationService by inject()

    this.response.header(
        "Set-Cookie", "$JWT_COOKIE_NAME=${
            jwtService.generateToken(id, role)
        }; Max-Age=${
            configurationService.configValue(CONFIG.JWT_SESSION_TIME_MILLIS).toInt() / 1000
        }; Secure; Path=/; HttpOnly"
    )
}

fun Application.installJwtVerifier() = install(Authentication) {
    val configurationService: ConfigurationService by inject()
    listOf(ROLE.ADMIN, ROLE.REGISTERED, ROLE.VIP).map {
        jwt(it) {
            authHeader { call ->
                parseAuthorizationHeader("Bearer ${call.request.cookies[JWT_COOKIE_NAME] ?: ""}")
            }
            verifier(
                JWT.require(
                    Algorithm.HMAC256(configurationService.configValue(CONFIG.JWT_SECRET))
                ).build()
            )
            validate { credential ->
                if (credential.payload.getClaim(USER.ROLE).asString() == it) {
                    JWTPrincipal(credential.payload)
                } else {
                    null
                }
            }
        }
    }
    jwt(AUTHENTICATED) {
        authHeader { call ->
            parseAuthorizationHeader("Bearer ${call.request.cookies[JWT_COOKIE_NAME] ?: ""}")
        }
        verifier(
            JWT.require(
                Algorithm.HMAC256(configurationService.configValue(CONFIG.JWT_SECRET))
            ).build()
        )
        validate { credential ->
            when (credential.payload.getClaim(USER.ROLE).asString()) {
                ROLE.ADMIN,
                ROLE.REGISTERED,
                ROLE.VIP -> JWTPrincipal(credential.payload)
                else -> null
            }
        }
    }
}