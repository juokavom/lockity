package lockity.plugins

import io.ktor.application.*
import io.ktor.features.*
import io.ktor.gson.*
import io.ktor.locations.*
import io.ktor.routing.*
import lockity.Routes.*
import lockity.Service.ConfigurationService
import lockity.repository.UserRepository
import lockity.utils.*
import org.koin.ktor.ext.inject
import java.util.*

fun Application.configureRouting() {
    val configurationService: ConfigurationService by inject()
    val userRepository: UserRepository by inject()

    install(ContentNegotiation) {
        gson()
    }
    install(Locations)
    installJwtVerifier()
    install(RefreshToken) {
        jwtSecret = configurationService.configValue(CONFIG.JWT_SECRET)
        generateToken = { id, role -> generateJwtToken(id, role) }
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

//        get("/email") {
//            emailService.sendEmail(
//                "j.akramas@gmail.com", "New email from someone!", """
//                    <html>
//                        <head>
//                        </head>
//                        <body>
//                            <p>
//                                Hi from lockity backend service, please visit <a href="https://www.youtube.com/watch?v=ebaY37b07Y8">this song</a>. See you!
//                            </p>
//                        </body>
//                    </html>
//                """.trimIndent()
//            )
//        }
    }
}