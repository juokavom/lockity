package lockity.plugins

import database.schema.tables.references.RoleTable
import database.schema.tables.references.UserTable
import io.ktor.application.*
import io.ktor.locations.*
import io.ktor.response.*
import io.ktor.routing.*
import lockity.Routes.authenticationRoute
import lockity.configValue
import lockity.utils.CONFIG
import lockity.utils.generateJwtToken
import lockity.utils.installJwtVerifier
import org.jooq.DSLContext

fun Application.configureRouting(dsl: DSLContext?) {
    install(Locations)
    installJwtVerifier()
    install(RefreshToken) {
        jwtSecret = configValue(CONFIG.JWT_SECRET)
        generateToken = { role -> generateJwtToken(role) }
    }

    routing {
        authenticationRoute()
    }
}