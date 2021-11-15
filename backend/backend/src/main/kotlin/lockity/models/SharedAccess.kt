@file:UseSerializers(JsonLocalDateTimeSerializer::class)

package lockity.models

import io.ktor.features.*
import kotlinx.serialization.Serializable
import kotlinx.serialization.UseSerializers
import lockity.plugins.JsonLocalDateTimeSerializer

@Serializable
data class UploadableSharedAccess(
    val fileId: String,
    val userId: String
)

fun UploadableSharedAccess.isValuesValid() {
    if (fileId == "" || userId == "") throw BadRequestException("File and user cannot be empty.")
}

@Serializable
data class EditableSharedAccess(
    val userId: String
)

fun EditableSharedAccess.isValuesValid() {
    if (userId == "") throw BadRequestException("User cannot be empty.")
}

@Serializable
data class SharedAccessCount(
    val sharedAccessCount: Int
)

@Serializable
data class SharedAccess(
    val id: String,
    val file: FileMetadataForSharing,
    val user: UserForSharing
)


