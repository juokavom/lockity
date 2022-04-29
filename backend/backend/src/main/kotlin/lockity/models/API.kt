@file:UseSerializers(JsonLocalDateTimeSerializer::class)

package lockity.models

import io.ktor.features.*
import kotlinx.serialization.Serializable
import kotlinx.serialization.UseSerializers
import lockity.plugins.JsonLocalDateTimeSerializer
import lockity.utils.inputValid
import java.time.LocalDateTime

@Serializable
data class CreatableToken(
    val title: String,
    val permissions: List<String>,
    val validFrom: LocalDateTime,
    val validTo: LocalDateTime
)

fun CreatableToken.isValuesValid() {
    if (title == "" || permissions.isEmpty() || validFrom > validTo || !title.inputValid())
        throw BadRequestException("Token title, permissions or valid dates failed validation.")
}

enum class APIPermissions {
    CREATE,
    READ,
    UPDATE,
    DELETE
}

@Serializable
data class TokenResponse(
    val message: String,
    val token: String
)

@Serializable
data class TokenData(
    val id: String,
    val title: String,
    val token: String,
    val permissions: List<String>,
    val validFrom: LocalDateTime,
    val validTo: LocalDateTime
)

@Serializable
data class APICount(
    val apiCount: Int
)

@Serializable
data class SendableToken(
    val token: String
)