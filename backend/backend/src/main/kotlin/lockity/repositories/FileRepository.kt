package lockity.repositories

import database.schema.tables.records.FileRecord
import database.schema.tables.references.FileTable
import lockity.utils.DatabaseService
import org.jooq.impl.DSL
import java.math.BigDecimal
import java.util.*

class FileRepository(
    private val databaseService: DatabaseService
) {
    fun insert(fileRecord: FileRecord) = databaseService.dsl
        .batchInsert(fileRecord)
        .execute()

    fun fetch(uuid: UUID): FileRecord? = databaseService.dsl
        .selectFrom(FileTable)
        .where(FileTable.Id.eq(databaseService.uuidToBin(uuid)))
        .fetchOne()

    fun fetchUserFiles(userUuid: UUID): List<FileRecord> = databaseService.dsl
        .selectFrom(FileTable)
        .where(FileTable.User.eq(databaseService.uuidToBin(userUuid)))
        .fetchArray()
        .toList()

    fun deleteUserFiles(userUuid: UUID) = databaseService.dsl
        .deleteFrom(FileTable)
        .where(FileTable.User.eq(databaseService.uuidToBin(userUuid)))
        .execute()

    fun update(fileRecord: FileRecord) = databaseService.dsl
        .update(FileTable)
        .set(fileRecord)
        .execute()

    fun userFileSizeSum(userBinId: ByteArray): BigDecimal? = databaseService.dsl
        .select(DSL.sum(FileTable.Size))
        .from(FileTable)
        .where(FileTable.User.eq(userBinId))
        .fetchOne()?.value1()
}