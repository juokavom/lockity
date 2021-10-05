package lockity.plugins

import io.ktor.application.*
import io.ktor.features.*
import io.ktor.gson.*
import io.ktor.locations.*
import io.ktor.routing.*
import lockity.Routes.*
import lockity.configValue
import lockity.utils.CONFIG
import lockity.utils.generateJwtToken
import lockity.utils.installJwtVerifier
import org.jooq.DSLContext

fun Application.configureRouting(dsl: DSLContext?) {
    install(ContentNegotiation) {
        gson()
    }
    install(Locations)
    installJwtVerifier()
    install(RefreshToken) {
        jwtSecret = configValue(CONFIG.JWT_SECRET)
        generateToken = { role -> generateJwtToken(role) }
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