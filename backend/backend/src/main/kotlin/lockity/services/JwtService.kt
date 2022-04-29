package lockity.services

import com.auth0.jwt.JWT
import com.auth0.jwt.algorithms.Algorithm
import com.auth0.jwt.exceptions.SignatureVerificationException
import com.auth0.jwt.exceptions.TokenExpiredException
import lockity.utils.CONFIG
import lockity.utils.USER
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