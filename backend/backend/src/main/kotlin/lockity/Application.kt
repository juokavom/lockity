package lockity

import io.ktor.application.*
import lockity.plugins.configureRouting
import lockity.utils.databaseConnection

fun Application.main() {
    configureRouting(databaseConnection())
}

fun Application.configValue(key: String): String = environment.config.property(key).getString()