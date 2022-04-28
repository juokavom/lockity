package lockity.plugins

import io.ktor.application.*
import io.ktor.features.*
import io.ktor.gson.*
import io.ktor.http.*
import io.ktor.http.content.*
import io.ktor.locations.*
import io.ktor.request.*
import io.ktor.routing.*
import io.ktor.serialization.*
import io.ktor.util.pipeline.*
import kotlinx.serialization.json.Json
import lockity.repositories.UserRepository
import lockity.routes.*
import lockity.services.ConfigurationService
import lockity.services.JwtService
import lockity.utils.CONFIG
import lockity.utils.installJwtVerifier
import org.koin.ktor.ext.inject
import java.util.*
import java.util.concurrent.TimeUnit

fun Application.configureRouting() {
    val userRepository: UserRepository by inject()
    val jwtService: JwtService by inject()
    val configurationService: ConfigurationService by inject()

    install(CORS) {
        allowCredentials = true
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
        json(Json {
            prettyPrint = true
            isLenient = true
        })
        register(ContentType.MultiPart.FormData, NullConverter())
    }
    install(Locations)
    installJwtVerifier()
    install(RefreshToken) {
        jwtTokenService = jwtService
        lastActive = { id ->
            userRepository.updateLastActive(UUID.fromString(id))
        }
    }
    install(PartialContent)

    routing {
        authRoutes()
        userRoutes()
        sharedRoutes()
        fileRoutes()
        apiRoutes()
        testRoutes()
    }
}

class NullConverter : ContentConverter {
    override suspend fun convertForSend(
        context: PipelineContext<Any, ApplicationCall>,
        contentType: ContentType,
        value: Any
    ): Any? {
        return null
    }

    override suspend fun convertForReceive(context: PipelineContext<ApplicationReceiveRequest, ApplicationCall>): Any? {
        return null
    }
}