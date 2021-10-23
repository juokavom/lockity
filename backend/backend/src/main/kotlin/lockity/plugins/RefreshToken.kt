package lockity.plugins

import com.auth0.jwt.JWT
import com.auth0.jwt.algorithms.Algorithm
import com.auth0.jwt.exceptions.SignatureVerificationException
import com.auth0.jwt.exceptions.TokenExpiredException
import io.ktor.application.*
import io.ktor.response.*
import io.ktor.util.*
import io.ktor.util.pipeline.*
import lockity.utils.JWT_COOKIE_NAME
import lockity.utils.USER_ID
import lockity.utils.USER_ROLE

class RefreshToken(configuration: Configuration) {
    private val jwtSecret = configuration.jwtSecret
    private val generateToken = configuration.generateToken
    private val lastActive = configuration.lastActive

    class Configuration {
        lateinit var jwtSecret: String
        lateinit var generateToken: (id: String, role: String) -> String
        lateinit var lastActive: (id: String) -> Unit
    }

    private fun intercept(context: PipelineContext<Unit, ApplicationCall>) {
        val jwt = context.call.request.cookies[JWT_COOKIE_NAME]
        if (jwt != null) {
            try {
                JWT.require(Algorithm.HMAC256(jwtSecret)).build().verify(jwt)
                val decodedJWT = JWT.decode(jwt)
                // Refresh JWT token
                context.call.response.header(
                    "Set-Cookie",
                    "$JWT_COOKIE_NAME=${
                        generateToken(
                            decodedJWT.getClaim(USER_ID).asString(),
                            decodedJWT.getClaim(USER_ROLE).asString()
                        )
                    }"
                )
                // Update `LastActive` user column
                lastActive(decodedJWT.getClaim(USER_ID).asString())
            } catch (e: TokenExpiredException) {
            } catch (e: SignatureVerificationException) {
            } catch (e: Exception) {
            }
        }
    }

    companion object Feature : ApplicationFeature<ApplicationCallPipeline, Configuration, RefreshToken> {
        override val key = AttributeKey<RefreshToken>("RefreshToken")
        override fun install(pipeline: ApplicationCallPipeline, configure: Configuration.() -> Unit): RefreshToken {
            val feature = RefreshToken(Configuration().apply(configure))
            pipeline.intercept(ApplicationCallPipeline.Call) {
                feature.intercept(this)
            }
            return feature
        }
    }
}