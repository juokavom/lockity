package lockity.repositories

import database.schema.tables.records.FileRecord
import database.schema.tables.references.FileTable
import database.schema.tables.references.SharedAccessTable
import database.schema.tables.references.UserTable
import lockity.models.FileMetadata
import lockity.models.SharedAccess
import lockity.utils.DatabaseService
import org.jooq.impl.DSL
import java.math.BigDecimal
import java.util.*

class FileRepository(
    private val databaseService: DatabaseService
) {
    fun fileExist(uuid: UUID): Boolean = databaseService.dsl
        .selectCount()
        .from(FileTable)
        .where(FileTable.Id.eq(databaseService.uuidToBin(uuid)))
        .fetchOne()?.value1() == 1

    fun fileOwner(uuid: UUID): ByteArray? = databaseService.dsl
        .select(FileTable.User)
        .from(FileTable)
        .where(FileTable.Id.eq(databaseService.uuidToBin(uuid)))
        .fetchOne()?.value1()

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
        .orderBy(FileTable.Uploaded.desc())
        .fetchArray()
        .toList()

    fun fetchUserFilesWithOffsetAndLimit(userUuid: UUID, offset: Int, limit: Int): List<FileRecord> = databaseService.dsl
        .selectFrom(FileTable)
        .where(FileTable.User.eq(databaseService.uuidToBin(userUuid)))
        .orderBy(FileTable.Uploaded.desc())
        .offset(offset)
        .limit(limit)
        .fetchArray()
        .toList()

    fun fetchUserFilesCount(userUuid: UUID): Int? = databaseService.dsl
        .selectCount()
        .from(FileTable)
        .where(FileTable.User.eq(databaseService.uuidToBin(userUuid)))
        .fetchOne()?.value1()

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

//    fun fetchUserReceivedSharedFiles(userBin: ByteArray): List<FileMetadata> = databaseService.dsl
//        .select()
//        .from(SharedAccessTable)
//        .join(FileTable).onKey()
//        .where(SharedAccessTable.OwnerId.eq(userBin))
//        .fetchArray()
//        .toList()
//        .map {
//            FileMetadata(
//                id = i
//                title = it[FileTable.Title]!!,
//                size = it[FileTable.Size]!!
//            )
//        }
}