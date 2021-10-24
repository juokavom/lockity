package lockity

import io.ktor.application.*
import lockity.plugins.configureRouting
import lockity.repositories.ConfirmationLinkRepository
import lockity.repositories.RoleRepository
import lockity.repositories.UserRepository
import lockity.services.ConfigurationService
import lockity.services.JwtService
import lockity.utils.DatabaseService
import lockity.services.EmailService
import org.koin.core.context.GlobalContext.startKoin
import org.koin.dsl.module

fun Application.main() {
    startKoin {
        modules(
            module {
                single { Application(get()) }
                single { ConfigurationService(environment) }
                single { EmailService(get()) }
                single { DatabaseService(get()) }
                single { UserRepository(get()) }
                single { RoleRepository(get()) }
                single { JwtService(get()) }
                single { ConfirmationLinkRepository(get()) }
            }
        )
    }
    configureRouting()
}