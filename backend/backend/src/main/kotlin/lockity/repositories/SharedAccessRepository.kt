package lockity.repositories

import database.schema.tables.records.SharedAccessRecord
import database.schema.tables.references.SharedAccessTable
import lockity.models.SharedAccess
import lockity.utils.DatabaseService
import java.util.*

class SharedAccessRepository(
    private val databaseService: DatabaseService
) {
    fun fromRecord(sharedAccessRecord: SharedAccessRecord) = SharedAccess(
        id = databaseService.binToUuid(sharedAccessRecord.id!!).toString(),
        fileId = databaseService.binToUuid(sharedAccessRecord.fileId!!).toString(),
        ownerId = databaseService.binToUuid(sharedAccessRecord.ownerId!!).toString(),
        recipientId = databaseService.binToUuid(sharedAccessRecord.recipientId!!).toString()
    )

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

    fun fetchUserSharedSharedAccesses(userBinId: ByteArray): List<SharedAccess> = databaseService.dsl
        .selectFrom(SharedAccessTable)
        .where(SharedAccessTable.RecipientId.eq(userBinId))
        .fetchArray()
        .toList()
        .map { fromRecord(it) }

    fun isUniqueFileAndRecipientEntry(fileUuid: UUID, recipientUuid: UUID): Boolean = databaseService.dsl
        .selectCount()
        .from(SharedAccessTable)
        .where(SharedAccessTable.FileId.eq(databaseService.uuidToBin(fileUuid))
            .and(SharedAccessTable.RecipientId.eq(databaseService.uuidToBin(recipientUuid))))
        .fetchOne()?.value1() == 0
}