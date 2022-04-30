package lockity.services

import database.schema.tables.records.FileRecord
import database.schema.tables.records.UserRecord
import io.ktor.features.*
import io.ktor.http.content.*
import lockity.models.*
import lockity.repositories.FileRepository
import lockity.repositories.SharedAccessRepository
import lockity.repositories.UserRepository
import lockity.utils.CONFIG
import lockity.utils.GUEST_MAX_STORAGE_BYTES
import lockity.utils.Misc
import java.io.File
import java.io.InputStream
import java.io.OutputStream
import java.time.LocalDateTime
import java.util.*
import javax.naming.NoPermissionException
import javax.security.auth.login.AccountLockedException

class FileService(
    private val configurationService: ConfigurationService,
    private val fileRepository: FileRepository,
    private val sharedAccessRepository: SharedAccessRepository,
    private val userRepository: UserRepository
) {
    private val storagePath = configurationService.configValue(CONFIG.FILEPATH_STORAGE)
    private val uploadsPath = configurationService.configValue(CONFIG.FILEPATH_UPLOADS)

    fun uploadsLocation(fileName: String) = "$storagePath$uploadsPath/$fileName"

    fun copyTo(inputStream: InputStream, outputStream: OutputStream) {
        var bytesCopied: Long = 0
        val buffer = ByteArray(DEFAULT_BUFFER_SIZE)
        var bytes = inputStream.read(buffer)
        while (bytes >= 0) {
            outputStream.write(buffer, 0, bytes)
            bytesCopied += bytes
            bytes = inputStream.read(buffer)
        }
    }

    fun deletePhysicalUserFiles(uuid: UUID): Boolean {
        val userFiles = fileRepository.fetchUserFiles(uuid)
        var success = true
        userFiles.forEach {
            val deleted = deletePhysicalFile(it.id!!)
            if (!deleted) success = false
        }
        return success
    }

    fun deletePhysicalFile(id: ByteArray): Boolean = File(
        uploadsLocation(Misc.binToUuid(id).toString())
    ).deleteRecursively()

    fun uploadGuestFile(part: PartData.FileItem, fileSize: Long): FileLink {
        if (fileSize > GUEST_MAX_STORAGE_BYTES)
            throw BadRequestException("File size exceeds 1GB")
        val fileRecord = uploadFile(part, fileSize, part.originalFileName!!)
        fileRecord.link = UUID.randomUUID().toString()
        fileRepository.insert(fileRecord)
        return FileLink(
            link = fileRecord.link!!,
            validUntil = fileRecord.uploaded?.plusDays(
                configurationService.configValue(
                    CONFIG.CRON_ANONYMOUS_EXPIRY_DAYS
                ).toLong()
            )
        )
    }

    fun uploadUserFile(user: UserRecord, part: PartData.FileItem, fileSize: Long) {
        val userFileSizeSum = fileRepository.userFileSizeSum(user.id!!)
        if (userFileSizeSum + fileSize > user.storageSize!!)
            throw NoPermissionException("User storage size is exceeded")
        val fileRecord = uploadFile(part, fileSize, part.originalFileName!!)
        fileRecord.user = user.id
        fileRepository.insert(fileRecord)
    }

    fun editUserFile(fileId: String, user: UserRecord, part: PartData.FileItem, fileSize: Long) {
        val fetchedFileRecord = fileRepository.fetch(UUID.fromString(fileId))
            ?: throw NotFoundException("File was not found")
        if (!fetchedFileRecord.user.contentEquals(user.id))
            throw NoPermissionException("User do not have permission to get this file metadata")
        val userFileSizeSum = fileRepository.userFileSizeSum(user.id!!) - (fetchedFileRecord.size ?: 0)
        if (userFileSizeSum + fileSize > user.storageSize!!)
            throw NoPermissionException("User storage size is exceeded")
        val fileRecord = uploadFile(part, fileSize, fetchedFileRecord.title!!, fetchedFileRecord.id!!, true)
        fileRecord.user = user.id
        fileRecord.link = fetchedFileRecord.link
        fileRepository.update(fileRecord)
    }

    fun editUserReceivedFile(receiveId: String, user: UserRecord, part: PartData.FileItem, fileSize: Long) {
        val sharedAccessRecord = sharedAccessRepository.fetch(UUID.fromString(receiveId))
            ?: throw NotFoundException("Shared access was not found")
        if (sharedAccessRecord.canEdit != "1".toByte()) {
            throw NoPermissionException("User cannot modify no edit access")
        }
        val fetchedFileRecord = fileRepository.fetch(Misc.binToUuid(sharedAccessRecord.fileId!!))
            ?: throw NotFoundException("File was not found")
        if (!fetchedFileRecord.user.contentEquals(sharedAccessRecord.ownerId) ||
            !user.id.contentEquals(sharedAccessRecord.recipientId)
        ) {
            throw NoPermissionException("User do not have permission to get this file metadata")
        }
        val ownerUser = userRepository.fetch(Misc.binToUuid(sharedAccessRecord.ownerId!!))
            ?: throw NotFoundException("File owner was not found")
        val ownerFileSizeSum =
            fileRepository.userFileSizeSum(sharedAccessRecord.ownerId!!) - (fetchedFileRecord.size ?: 0)
        if (ownerFileSizeSum + fileSize > ownerUser.storageSize!!)
            throw NoPermissionException("User storage size is exceeded")
        val fileRecord = uploadFile(part, fileSize, fetchedFileRecord.title!!, fetchedFileRecord.id!!, true)
        fileRecord.user = ownerUser.id
        fileRecord.link = fetchedFileRecord.link
        fileRepository.update(fileRecord)
    }

    fun uploadFile(
        part: PartData.FileItem,
        fileSize: Long,
        fileName: String,
        fileId: ByteArray = Misc.uuidToBin(UUID.randomUUID()),
        reupload: Boolean = false
    ): FileRecord {
        val fileIdStringed = Misc.binToUuid(fileId).toString()
        val fileFolderLocation = uploadsLocation(fileIdStringed)
        if (reupload) {
            deletePhysicalFile(fileId)
        }
        File(fileFolderLocation).mkdir()
        val fileLocation = "$fileFolderLocation/$fileName"
        val file = File(fileLocation)
        part.streamProvider().use { inputStream ->
            file.outputStream().buffered().use { outputStream ->
                copyTo(inputStream, outputStream)
            }
        }
        part.dispose

        return FileRecord(
            id = fileId,
            title = file.name,
            location = fileFolderLocation,
            user = null,
            key = null,
            link = null,
            uploaded = LocalDateTime.now(),
            lastAccessed = null,
            size = fileSize
        )
    }

    fun getUserFile(fileId: String, userId: ByteArray): File {
        val fileRecord = fileRepository.fetch(UUID.fromString(fileId))
            ?: throw NotFoundException("File was not found")
        if (!fileRecord.user.contentEquals(userId))
            throw NoPermissionException("User do not have permission to get this file")
        return File(fileRecord.location!! + "/" + fileRecord.title!!)
    }

    fun getUserReceivedFile(receiveId: String, user: UserRecord): File {
        val sharedAccessRecord = sharedAccessRepository.fetch(UUID.fromString(receiveId))
            ?: throw NotFoundException("Shared access record was not found")
        if (!sharedAccessRecord.recipientId.contentEquals(user.id))
            throw NoPermissionException("User do not have permission to stream this file")
        val fileRecord = fileRepository.fetch(Misc.binToUuid(sharedAccessRecord.fileId!!))
            ?: throw NotFoundException("File was not found")
        return File(fileRecord.location!! + "/" + fileRecord.title!!)
    }

    fun getDynamicLinkFile(dynlinkId: String): File {
        val fileRecord = fileRepository.fetchWithDynlink(dynlinkId)
            ?: throw NotFoundException("File was not found")
        if (fileRecord.link == null)
            throw NoPermissionException("File is not shared")
        return File(fileRecord.location!! + "/" + fileRecord.title!!)
    }

    fun getUserFilesMetadata(userId: ByteArray, offset: Int, limit: Int): List<FileMetadata> {
        if (limit > 20) throw BadRequestException("Maximum limit(20) is exceeded.")
        return fileRepository.fetchUserFilesWithOffsetAndLimit(
            userUuid = Misc.binToUuid(userId),
            offset = offset,
            limit = limit
        ).map {
            FileMetadata(
                id = Misc.binToUuid(it.id!!).toString(),
                title = it.title!!,
                size = it.size!!,
                link = it.link
            )
        }
    }

    fun getUserFilesMetadata(user: UserRecord, title: String) = fileRepository.fetchUserFilesWithTitleLike(
        userBinId = user.id!!,
        titleLike = "$title%"
    ).map {
        FileMetadataForSharing(
            id = Misc.binToUuid(it.id!!).toString(),
            title = it.title!!
        )
    }

    fun getUserFilesMetadataInfo(user: UserRecord) = FileMetadataInfo(
        storageData = StorageData(
            totalSize = user.storageSize!!,
            usedSize = fileRepository.userFileSizeSum(user.id!!)
        ),
        fileCount = fileRepository.fetchUserFilesCount(
            userBinId = user.id!!
        ) ?: 0
    )

    fun getUserReceivedFilesMetadata(user: UserRecord, offset: Int, limit: Int): List<ReceivedFileMetadata> {
        if (limit > 20) throw BadRequestException("Maximum limit(20) is exceeded.")
        return sharedAccessRepository.fetchRecipientFilesWithOffsetAndLimit(
            userBinId = user.id!!,
            offset = offset,
            limit = limit
        )
    }

    fun getUserReceivedFilesMetadataCount(user: UserRecord) = ReceivedFileMetadataCount(
        receivedCount = sharedAccessRepository.fetchRecipientSharedAccessCount(user.id!!)
    )

    fun getDynamicLinkFileTitleLink(dynlinkId: String): FileTitleLink {
        val fileRecord = fileRepository.fetchWithDynlink(dynlinkId)
            ?: throw NotFoundException("File was not found")
        if (fileRecord.link == null)
            throw NoPermissionException("File is not shared")
        return FileTitleLink(
            title = fileRecord.title!!,
            link = fileRecord.link!!,
            validUntil = fileRecord.uploaded?.plusDays(
                configurationService.configValue(
                    CONFIG.CRON_ANONYMOUS_EXPIRY_DAYS
                ).toLong()
            )
        )
    }

    fun updateUserFileTitle(user: UserRecord, fileId: String, editedFile: EditableFile) {
        editedFile.isValuesValid()
        val fileRecord = fileRepository.fetch(UUID.fromString(fileId))
            ?: throw NotFoundException("File was not found")
        if (!fileRecord.user.contentEquals(user.id))
            throw NoPermissionException("User do not have permission to get this file metadata")
        if (editedFile.title == "")
            throw BadRequestException("File title cannot be empty")
        val sourceFile = File(fileRecord.location, fileRecord.title!!)
        val newTitle = editedFile.title + "." + sourceFile.extension
        val destinationFile = File(fileRecord.location, newTitle)
        if (!sourceFile.renameTo(destinationFile)) throw BadRequestException("File renaming failed, check title")
        fileRecord.title = newTitle
        fileRepository.update(fileRecord)
    }

    fun modifyUserFileSharing(user: UserRecord, fileId: String, shareCondition: Boolean): String? {
        val fileRecord = fileRepository.fetch(UUID.fromString(fileId))
            ?: throw NotFoundException("File was not found")
        if (!fileRecord.user.contentEquals(user.id))
            throw NoPermissionException("User do not have permission to modify this file metadata")

        if (shareCondition) {
            if (fileRecord.link == null) {
                fileRecord.link = UUID.randomUUID().toString()
                fileRepository.update(fileRecord)
                return fileRecord.link
            } else {
                throw BadRequestException("File already has dynamic link")
            }
        } else {
            if (fileRecord.link == null) {
                throw BadRequestException("File is not shared")
            } else {
                fileRecord.link = null
                fileRepository.update(fileRecord)
                return null
            }
        }
    }

    fun deleteFile(userId: ByteArray, fileId: String) {
        val fileRecord = fileRepository.fetch(UUID.fromString(fileId))
            ?: throw NotFoundException("File was not found")
        if (!fileRecord.user.contentEquals(userId))
            throw NoPermissionException("User do not have permission to get this file metadata")
        if (!deletePhysicalFile(fileRecord.id!!))
            throw AccountLockedException("Unable to delete physical files")
        fileRepository.delete(fileRecord.id!!)
    }
}