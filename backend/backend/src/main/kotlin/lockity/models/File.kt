@file:UseSerializers(JsonLocalDateTimeSerializer::class)
package lockity.models

import io.ktor.features.*
import kotlinx.serialization.Serializable
import kotlinx.serialization.UseSerializers
import lockity.plugins.JsonLocalDateTimeSerializer
import lockity.utils.inputValid
import java.time.LocalDateTime

@Serializable
data class StorageData(
    val totalSize: Long,
    val usedSize: Long
)

@Serializable
data class EditableFile(
    val title: String
)

fun EditableFile.isValuesValid() {
    if (title == "" || !title.inputValid())
        throw BadRequestException("Title failed validation.")
}

@Serializable
data class FileMetadata(
    val id: String,
    val title: String,
    val size: Long,
    val link: String?,
    val uploaded: LocalDateTime
)

@Serializable
data class FileMetadataForSharing(
    val id: String,
    val title: String
)

@Serializable
data class FileMetadataInfo(
    val storageData: StorageData,
    val fileCount: Int
)

@Serializable
data class ReceivedFileMetadata(
    val id: String,
    val title: String,
    val size: Long,
    val ownerPublicName: String,
    val canEdit: Boolean
)

@Serializable
data class ReceivedFileMetadataCount(
    val receivedCount: Int
)

@Serializable
data class FileLink(
    val link: String,
    val validUntil: LocalDateTime?
)

@Serializable
data class FileTitleLink(
    val title: String,
    val link: String,
    val validUntil: LocalDateTime?
)