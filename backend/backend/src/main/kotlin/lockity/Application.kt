package lockity

import io.ktor.application.*
import lockity.Service.ConfigurationService
import lockity.plugins.configureRouting
import lockity.utils.DatabaseService
import lockity.utils.EmailService
import org.koin.core.context.GlobalContext.startKoin
import org.koin.dsl.module

fun Application.main() {
    startKoin {
        modules(
            module {
                single { Application(get()) }
                single { EmailService(get()) }
                single { ConfigurationService(environment) }
                single { DatabaseService(get()) }
            }
        )
    }
    configureRouting()
}