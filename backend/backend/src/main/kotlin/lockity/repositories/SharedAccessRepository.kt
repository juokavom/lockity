package lockity.repositories

import database.schema.tables.records.SharedAccessRecord
import database.schema.tables.references.FileTable
import database.schema.tables.references.RoleTable
import database.schema.tables.references.SharedAccessTable
import database.schema.tables.references.UserTable
import lockity.models.FileMetadataForSharing
import lockity.models.SharedAccess
import lockity.models.UserForSharing
import lockity.utils.DatabaseService
import lockity.utils.USER
import java.util.*

class SharedAccessRepository(
    private val databaseService: DatabaseService
) {
//    fun fromRecord(sharedAccessRecord: SharedAccessRecord) = SharedAccess(
//        id = databaseService.binToUuid(sharedAccessRecord.id!!).toString(),
//        fileId = databaseService.binToUuid(sharedAccessRecord.fileId!!).toString(),
//        ownerId = databaseService.binToUuid(sharedAccessRecord.ownerId!!).toString(),
//        recipientId = databaseService.binToUuid(sharedAccessRecord.recipientId!!).toString()
//    )

    fun insert(sharedAccessRecord: SharedAccessRecord) = databaseService.dsl
        .batchInsert(sharedAccessRecord)
        .execute()

    fun fetch(uuid: UUID): SharedAccessRecord? = databaseService.dsl
        .selectFrom(SharedAccessTable)
        .where(SharedAccessTable.Id.eq(databaseService.uuidToBin(uuid)))
        .fetchOne()

    fun update(sharedAccessRecord: SharedAccessRecord) = databaseService.dsl
        .update(SharedAccessTable)
        .set(sharedAccessRecord)
        .execute()

    fun delete(uuid: UUID) = databaseService.dsl
        .deleteFrom(SharedAccessTable)
        .where(SharedAccessTable.Id.eq(databaseService.uuidToBin(uuid)))
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
                    id = databaseService.binToUuid(it[SharedAccessTable.Id]!!).toString(),
                    file = FileMetadataForSharing(
                        id = databaseService.binToUuid(it[FileTable.Id]!!).toString(),
                        title = it[FileTable.Title]!!
                    ),
                    user = UserForSharing(
                        id = databaseService.binToUuid(it[UserTable.Id]!!).toString(),
                        email = it[UserTable.Email]!!
                    )
                )
            }
            .toList()

    fun fetchOwnerSharedAccessCount(userBinId: ByteArray): Int = databaseService.dsl
        .selectCount()
        .from(SharedAccessTable)
        .where(SharedAccessTable.OwnerId.eq(userBinId))
        .fetchOne()?.value1() ?: 0

//    fun fetchUserSharedSharedAccesses(userBinId: ByteArray): List<SharedAccess> = databaseService.dsl
//        .selectFrom(SharedAccessTable)
//        .where(SharedAccessTable.RecipientId.eq(userBinId))
//        .fetchArray()
//        .toList()
//        .map { fromRecord(it) }

    fun isUniqueFileAndRecipientEntry(fileUuid: UUID, recipientUuid: UUID): Boolean = databaseService.dsl
        .selectCount()
        .from(SharedAccessTable)
        .where(
            SharedAccessTable.FileId.eq(databaseService.uuidToBin(fileUuid))
                .and(SharedAccessTable.RecipientId.eq(databaseService.uuidToBin(recipientUuid)))
        )
        .fetchOne()?.value1() == 0
}