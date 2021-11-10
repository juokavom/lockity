package lockity.repositories

import database.schema.tables.records.FileRecord
import database.schema.tables.records.UserRecord
import database.schema.tables.references.FileTable
import database.schema.tables.references.RoleTable
import database.schema.tables.references.UserTable
import lockity.utils.DatabaseService
import lockity.utils.USER
import java.time.LocalDateTime
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
}