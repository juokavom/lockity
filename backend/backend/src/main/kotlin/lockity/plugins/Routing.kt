package lockity.plugins

import io.ktor.application.*
import io.ktor.features.*
import io.ktor.gson.*
import io.ktor.locations.*
import io.ktor.routing.*
import lockity.repositories.UserRepository
import lockity.routes.*
import lockity.services.JwtService
import lockity.services.installJwtVerifier
import org.koin.ktor.ext.inject
import java.util.*

fun Application.configureRouting() {
    val userRepository: UserRepository by inject()
    val jwtService: JwtService by inject()

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