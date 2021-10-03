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
import lockity.utils.ROLE_NAME

class RefreshToken(configuration: Configuration) {
    private val jwtSecret = configuration.jwtSecret
    private val generateToken = configuration.generateToken

    class Configuration {
        lateinit var jwtSecret: String
        lateinit var generateToken: (role: String) -> String
    }

    private fun intercept(context: PipelineContext<Unit, ApplicationCall>) {
        val jwt = context.call.request.cookies[JWT_COOKIE_NAME]
        if (jwt != null) {
            try {
                JWT.require(Algorithm.HMAC256(jwtSecret)).build().verify(jwt)
                context.call.response.header(
                    "Set-Cookie",
                    "$JWT_COOKIE_NAME=${generateToken(JWT.decode(jwt).getClaim(ROLE_NAME).asString())}"
                )
            } catch (e: TokenExpiredException) {
            } catch (e: SignatureVerificationException) {
            } catch (e: Exception) {
            }
        }
    }

    companion object Feature : ApplicationFeature<ApplicationCallPipeline, RefreshToken.Configuration, RefreshToken> {
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