package lockity.utils

import com.auth0.jwt.JWT
import com.auth0.jwt.algorithms.Algorithm
import io.ktor.application.*
import io.ktor.auth.*
import io.ktor.auth.jwt.*
import io.ktor.http.auth.*
import lockity.Service.ConfigurationService
import org.koin.ktor.ext.inject
import java.util.*

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
                    if (credential.payload.getClaim(ROLE_NAME).asString() == it) {
                        JWTPrincipal(credential.payload)
                    } else {
                        null
                    }
                }
            }
        }
    }

fun Application.generateJwtToken(role: String): String {
    val configurationService: ConfigurationService by inject()
    return JWT.create()
        .withClaim(ROLE_NAME, role)
        .withExpiresAt(Date(System.currentTimeMillis() + configurationService.configValue(CONFIG.JWT_SESSION_TIME_MILLIS).toInt()))
        .sign(Algorithm.HMAC256(configurationService.configValue(CONFIG.JWT_SECRET)))
}