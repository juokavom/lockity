package lockity.models

import kotlinx.serialization.Serializable


@Serializable
data class StorageData(
    val totalSize: Long,
    val usedSize: Long
)

@Serializable
data class EditableFile(
    val title: String
)

@Serializable
data class FileMetadata(
    val id: String,
    val title: String,
    val size: Long,
    val link: String?
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
    val ownerEmail: String
)

@Serializable
data class ReceivedFileMetadataCount(
    val receivedCount: Int
)