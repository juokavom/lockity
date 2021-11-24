package lockity.services

import database.schema.tables.records.SharedAccessRecord
import database.schema.tables.records.UserRecord
import io.ktor.features.*
import lockity.models.SharedAccessCount
import lockity.models.UploadableSharedAccess
import lockity.models.isValuesValid
import lockity.repositories.FileRepository
import lockity.repositories.SharedAccessRepository
import lockity.repositories.UserRepository
import lockity.utils.Misc
import java.time.LocalDateTime
import java.util.*
import javax.naming.NoPermissionException

class SharedAccessService(
    private val fileRepository: FileRepository,
    private val sharedAccessRepository: SharedAccessRepository,
    private val userRepository: UserRepository
) {
    fun getUserSharedAccessMetadata(user: UserRecord, offset: Int, limit: Int) =
        sharedAccessRepository.fetchOwnerFilesWithOffsetAndLimit(
            userBinId = user.id!!,
            offset = offset,
            limit = limit
        )

    fun getUserSharedAccessMetadataCount(user: UserRecord) = SharedAccessCount(
        sharedAccessCount = sharedAccessRepository.fetchOwnerSharedAccessCount(user.id!!)
    )

    fun createSharedAccess(user: UserRecord, newAccess: UploadableSharedAccess) {
        newAccess.isValuesValid()
        if (!userRepository.userExist(UUID.fromString(newAccess.userId)))
            throw BadRequestException("Receiver doesn't exist")
        if (!fileRepository.fileExist(UUID.fromString(newAccess.fileId)))
            throw BadRequestException("File doesn't exist")
        val fileOwner = fileRepository.fileOwner(
            UUID.fromString(newAccess.fileId)
        )
        if (fileOwner == null || !fileOwner.contentEquals(user.id))
            throw NoPermissionException("User is not the owner of the file")
        if (fileOwner.contentEquals(Misc.uuidToBin(UUID.fromString(newAccess.userId)))) {
            throw BadRequestException("Owner cannot be recipient of the shared file")
        }
        if (!sharedAccessRepository.isUniqueFileAndRecipientEntry(
                fileUuid = UUID.fromString(newAccess.fileId),
                recipientUuid = UUID.fromString(newAccess.userId)
            )
        ) throw BadRequestException("Shared access with the same file and recipient already exists")

        sharedAccessRepository.insert(
            SharedAccessRecord(
                id = Misc.uuidToBin(UUID.randomUUID()),
                fileId = Misc.uuidToBin(UUID.fromString(newAccess.fileId)),
                ownerId = fileOwner,
                recipientId = Misc.uuidToBin(UUID.fromString(newAccess.userId)),
                created = LocalDateTime.now()
            )
        )
    }

    fun editSharedAccess(user: UserRecord, sharedId: String, editedAccess: UploadableSharedAccess) {
        val sharedAccessRecord = sharedAccessRepository.fetch(UUID.fromString(sharedId))
            ?: throw NotFoundException("Shared access was not found")
        if (!sharedAccessRecord.ownerId.contentEquals(user.id))
            throw NoPermissionException("User do not have permission to get this users received access")
        editedAccess.isValuesValid()
        val recipientUUID = UUID.fromString(editedAccess.userId)
        if (!userRepository.userExist(recipientUUID))
            throw BadRequestException("Receiver doesn't exist")
        if (sharedAccessRecord.ownerId.contentEquals(
                Misc.uuidToBin(UUID.fromString(editedAccess.userId))
            )
        ) {
            throw BadRequestException("Owner cannot be recipient of the shared file")
        }
        if (!sharedAccessRepository.isUniqueFileAndRecipientEntry(
                fileUuid = Misc.binToUuid(sharedAccessRecord.fileId!!),
                recipientUuid = UUID.fromString(editedAccess.userId)
            )
        ) throw BadRequestException("Shared access with the same file and recipient already exists")
        sharedAccessRepository.updateRecipient(
            sharedId = sharedAccessRecord.id!!,
            userId = Misc.uuidToBin(recipientUUID)
        )
    }

    fun deleteSharedAccess(user: UserRecord, sharedId: String) {
        val sharedAccessRecord = sharedAccessRepository.fetch(UUID.fromString(sharedId))
            ?: throw NotFoundException("Shared access was not found")
        if (!sharedAccessRecord.ownerId.contentEquals(user.id))
            throw NoPermissionException("User do not have permission to delete this access")
        sharedAccessRepository.delete(sharedAccessRecord.id!!)
    }
}