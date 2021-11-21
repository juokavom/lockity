package lockity.plugins

import io.ktor.application.*
import io.ktor.util.*
import io.ktor.util.pipeline.*
import lockity.services.JwtService
import lockity.utils.JWT_COOKIE_NAME
import lockity.utils.setResponseJwtCookieHeader
import lockity.utils.unsetResponseJwtCookieHeader

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
                val jwtUserId = jwtService.getJwtUserId(it)
                // Refresh JWT token
                context.call.setResponseJwtCookieHeader(jwtUserId)
                // Update `LastActive` user column
                lastActive(jwtUserId)
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