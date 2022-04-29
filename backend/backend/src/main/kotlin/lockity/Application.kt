package lockity

import io.ktor.application.*
import kotlinx.coroutines.launch
import lockity.plugins.configureRouting
import lockity.repositories.*
import lockity.services.*
import org.koin.core.context.GlobalContext.startKoin
import org.koin.dsl.module
import org.koin.ktor.ext.inject

fun Application.main() {
    startKoin {
        modules(
            module {
                single { Application(get()) }

                // Repositories
                single { RoleRepository(get()) }
                single { ConfirmationLinkRepository(get()) }
                single { ForgotLinkRepository(get()) }
                single { FileRepository(get()) }
                single { SharedAccessRepository(get()) }
                single { UserRepository(get()) }
                single { APIRepository(get()) }

                // Services
                single { ConfigurationService(environment) }
                single { JwtService(get()) }
                single { EmailService(get()) }
                single { DatabaseService(get()) }
                single { FileService(get(), get(), get(), get()) }
                single { SharedAccessService(get(), get(), get()) }
                single { UserService(get(), get(), get(), get(), get(), get(), get(), get()) }
                single { APIService(get(), get(), get()) }
                single { CoroutineService(get(), get(), get()) }
            }
        )
    }
    val coroutineService: CoroutineService by inject()
    configureRouting()

    launch {
        coroutineService.launchUnregisteredFileDeletion()
    }
}