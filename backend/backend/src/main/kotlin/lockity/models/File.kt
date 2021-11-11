package lockity.models

import kotlinx.serialization.Serializable

@Serializable
data class AnonymousFileMetadata(
    val fileId: String,
    val fileKey: String?
)

@Serializable
data class StorageData(
    val totalSize: Long,
    val usedSize: Long
)

@Serializable
data class FileMetadata(
    val title: String,
    val size: Long
)