package lockity

import io.ktor.application.*
import lockity.plugins.configureRouting
import lockity.repositories.*
import lockity.services.ConfigurationService
import lockity.services.JwtService
import lockity.utils.DatabaseService
import lockity.services.EmailService
import lockity.services.FileService
import org.koin.core.context.GlobalContext.startKoin
import org.koin.dsl.module
import org.koin.ktor.ext.inject
import java.io.File

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
                single { FileService(get(), get(), get()) }
                single { RoleRepository(get()) }
                single { JwtService(get()) }
                single { ConfirmationLinkRepository(get()) }
                single { SharedAccessRepository(get()) }
            }
        )
    }
    configureRouting()
}