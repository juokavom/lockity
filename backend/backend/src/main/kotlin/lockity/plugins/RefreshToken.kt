package lockity.plugins

import com.auth0.jwt.JWT
import io.ktor.application.*
import io.ktor.util.*
import io.ktor.util.pipeline.*
import lockity.services.JwtService
import lockity.services.setResponseJwtCookieHeader
import lockity.services.unsetResponseJwtCookieHeader
import lockity.utils.JWT_COOKIE_NAME
import lockity.utils.USER

class RefreshToken(configuration: Configuration) {
    private val jwtService = configuration.jwtTokenService
    private val lastActive = configuration.lastActive

    class Configuration {
        lateinit var jwtTokenService: JwtService
        lateinit var lastActive: (id: String) -> Unit
    }

    private fun intercept(context: PipelineContext<Unit, ApplicationCall>) {
        context.call.request.cookies[JWT_COOKIE_NAME]?.let {
            if (jwtService.isValidToken(it)) {
                val jwtClaims = jwtService.getJwtClaims(it)
                // Refresh JWT token
                context.call.setResponseJwtCookieHeader(jwtClaims.userId, jwtClaims.role)
                // Update `LastActive` user column
                lastActive(jwtClaims.userId)
            } else {
                context.call.unsetResponseJwtCookieHeader()
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