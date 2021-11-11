@file:UseSerializers(JsonLocalDateTimeSerializer::class)

package lockity.models

import io.ktor.features.*
import kotlinx.serialization.Serializable
import kotlinx.serialization.UseSerializers
import lockity.plugins.JsonLocalDateTimeSerializer

@Serializable
data class UploadableSharedAccess(
    val fileId: String,
    val recipientId: String
)

fun UploadableSharedAccess.isValuesValid() {
    if (fileId == "" || recipientId == "") throw BadRequestException("Email and password cannot be empty.")
}

@Serializable
data class SharedAccess(
    val id: String,
    val fileId: String,
    val ownerId: String,
    val recipientId: String
)

fun SharedAccess.isValuesValid() {
    if (fileId == "" || recipientId == "") throw BadRequestException("Email and password cannot be empty.")
}


