package lockity.utils

import com.auth0.jwt.JWT
import com.auth0.jwt.algorithms.Algorithm
import io.ktor.application.*
import io.ktor.auth.*
import io.ktor.auth.jwt.*
import io.ktor.http.*
import io.ktor.http.auth.*
import io.ktor.request.*
import lockity.configValue
import java.util.*

fun Application.installJwtVerifier() = install(Authentication) {
    listOf(ROLE.ADMIN, ROLE.REGISTERED, ROLE.VIP).map {
        jwt(it) {
            authHeader { call ->
                parseAuthorizationHeader("Bearer ${call.request.cookies[jwtCookieName] ?: ""}")
            }
            verifier(
                JWT.require(
                    Algorithm.HMAC256(configValue("jwt.secret"))
                ).build()
            )
            validate { credential ->
                if (credential.payload.getClaim("role").asString() == it) {
                    JWTPrincipal(credential.payload)
                } else {
                    null
                }
            }
        }
    }
}

fun Application.generateJwtToken(role: String): String = JWT.create()
    .withClaim("role", role)
    .withExpiresAt(Date(System.currentTimeMillis() + configValue("jwt.sessionTimeMillis").toInt()))
    .sign(Algorithm.HMAC256(configValue("jwt.secret")))