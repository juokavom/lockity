package lockity

import io.ktor.application.*
import lockity.plugins.configureRouting
import lockity.repositories.*
import lockity.services.*
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
                single { FileRepository(get()) }
                single { FileService(get(), get(), get(), get()) }
                single { RoleRepository(get()) }
                single { JwtService(get()) }
                single { ConfirmationLinkRepository(get()) }
                single { SharedAccessRepository(get()) }
            }
        )
    }
    configureRouting()
}