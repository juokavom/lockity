package lockity.plugins

import io.ktor.application.*
import io.ktor.features.*
import io.ktor.gson.*
import io.ktor.http.*
import io.ktor.locations.*
import io.ktor.routing.*
import lockity.repositories.UserRepository
import lockity.routes.*
import lockity.services.ConfigurationService
import lockity.services.JwtService
import lockity.services.installJwtVerifier
import lockity.utils.CONFIG
import org.koin.ktor.ext.inject
import java.util.*

fun Application.configureRouting() {
    val userRepository: UserRepository by inject()
    val jwtService: JwtService by inject()
    val configurationService: ConfigurationService by inject()

    install(CORS) {
        host(
            host = configurationService.configValue(CONFIG.CORS_HOST),
            subDomains = listOf(configurationService.configValue(CONFIG.CORS_SUBDOMAIN)),
            schemes = listOf(configurationService.configValue(CONFIG.CORS_SCHEME))
        )
        header(HttpHeaders.ContentType)
        method(HttpMethod.Options)
        method(HttpMethod.Put)
        method(HttpMethod.Patch)
        method(HttpMethod.Delete)
    }
    install(ContentNegotiation) {
        gson()
    }
    install(Locations)
    installJwtVerifier()
    install(RefreshToken) {
        jwtTokenService = jwtService
        lastActive = { id -> userRepository.updateLastActive(UUID.fromString(id)) }
    }

    routing {
        authRoutes()
        userRoutes()
        metadataRoutes()
        dynlinkRoutes()
        sharedRoutes()
        emailTemplateRoutes()
        emailRoutes()
        fileRoutes()
    }
}