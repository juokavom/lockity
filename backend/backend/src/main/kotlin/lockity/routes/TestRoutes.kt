package lockity.routes

import database.schema.tables.records.ConfirmationLinkRecord
import database.schema.tables.records.UserRecord
import io.ktor.application.*
import io.ktor.auth.*
import io.ktor.features.*
import io.ktor.http.*
import io.ktor.request.*
import io.ktor.response.*
import io.ktor.routing.*
import lockity.models.*
import lockity.repositories.ConfirmationLinkRepository
import lockity.repositories.RoleRepository
import lockity.repositories.UserRepository
import lockity.services.ConfigurationService
import lockity.services.EmailService
import lockity.services.setResponseJwtCookieHeader
import lockity.services.unsetResponseJwtCookieHeader
import lockity.utils.*
import org.koin.ktor.ext.inject
import java.time.LocalDateTime
import java.util.*

fun Application.testRoutes() {
    routing {

        /**
         * Authorization testing routes
         */
        get("/simple") {
            call.respondJSON("Just simple!", HttpStatusCode.OK)
        }
        authenticate(AUTHENTICATED) {
            get("/authenticated") {
                call.respondJSON("Nice authed!", HttpStatusCode.OK)
            }
        }
        authenticate(ROLE.ADMIN) {
            get("/admin") {
                call.respondJSON("Nice authed admin!", HttpStatusCode.OK)
            }
        }
    }
}