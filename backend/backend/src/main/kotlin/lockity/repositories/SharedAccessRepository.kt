package lockity.repositories

import database.schema.tables.records.SharedAccessRecord
import database.schema.tables.references.FileTable
import database.schema.tables.references.SharedAccessTable
import database.schema.tables.references.UserTable
import lockity.models.*
import lockity.services.DatabaseService
import lockity.services.UserService
import lockity.utils.Misc
import java.util.*

class SharedAccessRepository(
    private val databaseService: DatabaseService
) {
    fun insert(sharedAccessRecord: SharedAccessRecord) = databaseService.dsl
        .batchInsert(sharedAccessRecord)
        .execute()

    fun fetch(uuid: UUID): SharedAccessRecord? = databaseService.dsl
        .selectFrom(SharedAccessTable)
        .where(SharedAccessTable.Id.eq(Misc.uuidToBin(uuid)))
        .fetchOne()

    fun updateRecipient(sharedId: ByteArray, userId: ByteArray) = databaseService.dsl
        .update(SharedAccessTable)
        .set(SharedAccessTable.RecipientId, userId)
        .where(SharedAccessTable.Id.eq(sharedId))
        .execute()

    fun delete(sharedId: ByteArray) = databaseService.dsl
        .deleteFrom(SharedAccessTable)
        .where(SharedAccessTable.Id.eq(sharedId))
        .execute()

    fun fetchOwnerFilesWithOffsetAndLimit(userBinId: ByteArray, offset: Int, limit: Int): List<SharedAccess> =
        databaseService.dsl
            .select()
            .from(SharedAccessTable)
            .join(FileTable).on(SharedAccessTable.FileId.eq(FileTable.Id))
            .join(UserTable).on(SharedAccessTable.RecipientId.eq(UserTable.Id))
            .where(SharedAccessTable.OwnerId.eq(userBinId))
            .orderBy(SharedAccessTable.Created.desc())
            .offset(offset)
            .limit(limit)
            .fetchArray()
            .map {
                SharedAccess(
                    id = Misc.binToUuid(it[SharedAccessTable.Id]!!).toString(),
                    file = FileMetadataForSharing(
                        id = Misc.binToUuid(it[FileTable.Id]!!).toString(),
                        title = it[FileTable.Title]!!
                    ),
                    user = UserForSharing(
                        id = Misc.binToUuid(it[UserTable.Id]!!).toString(),
                        publicName = UserService.getUserPublicName(it[UserTable.Id]!!, it[UserTable.Username]!!)
                    )
                )
            }
            .toList()

    fun fetchOwnerSharedAccessCount(userBinId: ByteArray): Int = databaseService.dsl
        .selectCount()
        .from(SharedAccessTable)
        .where(SharedAccessTable.OwnerId.eq(userBinId))
        .fetchOne()?.value1() ?: 0

    fun fetchRecipientFilesWithOffsetAndLimit(userBinId: ByteArray, offset: Int, limit: Int): List<ReceivedFileMetadata> =
        databaseService.dsl
            .select()
            .from(SharedAccessTable)
            .join(FileTable).on(SharedAccessTable.FileId.eq(FileTable.Id))
            .join(UserTable).on(SharedAccessTable.OwnerId.eq(UserTable.Id))
            .where(SharedAccessTable.RecipientId.eq(userBinId))
            .orderBy(SharedAccessTable.Created.desc())
            .offset(offset)
            .limit(limit)
            .fetchArray()
            .map {
                ReceivedFileMetadata(
                    id = Misc.binToUuid(it[SharedAccessTable.Id]!!).toString(),
                    title = it[FileTable.Title]!!,
                    size = it[FileTable.Size]!!,
                    ownerEmail = it[UserTable.Email]!!
                )
            }
            .toList()

    fun fetchRecipientSharedAccessCount(userBinId: ByteArray): Int = databaseService.dsl
        .selectCount()
        .from(SharedAccessTable)
        .where(SharedAccessTable.RecipientId.eq(userBinId))
        .fetchOne()?.value1() ?: 0

    fun isUniqueFileAndRecipientEntry(fileUuid: UUID, recipientUuid: UUID): Boolean = databaseService.dsl
        .selectCount()
        .from(SharedAccessTable)
        .where(
            SharedAccessTable.FileId.eq(Misc.uuidToBin(fileUuid))
                .and(SharedAccessTable.RecipientId.eq(Misc.uuidToBin(recipientUuid)))
        )
        .fetchOne()?.value1() == 0
}