package lockity.services

import io.ktor.application.*

class ConfigurationService(
    private val environment: ApplicationEnvironment
) {
    fun configValue(key: String): String = environment.config.property(key).getString()
}