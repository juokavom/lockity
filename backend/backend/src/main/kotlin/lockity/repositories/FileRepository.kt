package lockity.repositories

import database.schema.tables.records.FileRecord
import database.schema.tables.references.FileTable
import lockity.services.DatabaseService
import lockity.utils.Misc
import org.jooq.impl.DSL
import java.time.LocalDateTime
import java.util.*

class FileRepository(
    private val databaseService: DatabaseService
) {
    fun fileExist(uuid: UUID): Boolean = databaseService.dsl
        .selectCount()
        .from(FileTable)
        .where(FileTable.Id.eq(Misc.uuidToBin(uuid)))
        .fetchOne()?.value1() == 1

    fun fileOwner(uuid: UUID): ByteArray? = databaseService.dsl
        .select(FileTable.User)
        .from(FileTable)
        .where(FileTable.Id.eq(Misc.uuidToBin(uuid)))
        .fetchOne()?.value1()

    fun insert(fileRecord: FileRecord) = databaseService.dsl
        .batchInsert(fileRecord)
        .execute()

    fun fetch(uuid: UUID): FileRecord? = databaseService.dsl
        .selectFrom(FileTable)
        .where(FileTable.Id.eq(Misc.uuidToBin(uuid)))
        .fetchOne()

    fun fetchWithDynlink(link: String): FileRecord? = databaseService.dsl
        .selectFrom(FileTable)
        .where(FileTable.Link.eq(link))
        .fetchOne()

    fun fetchUserFiles(userUuid: UUID): List<FileRecord> = databaseService.dsl
        .selectFrom(FileTable)
        .where(FileTable.User.eq(Misc.uuidToBin(userUuid)))
        .orderBy(FileTable.Uploaded.desc())
        .fetchArray()
        .toList()

    fun fetchExpiredAnonymousFiles(expiryDate: LocalDateTime): List<FileRecord> = databaseService.dsl
        .selectFrom(FileTable)
        .where(FileTable.User.isNull.and(FileTable.Uploaded.lessThan(expiryDate)))
        .fetchArray()
        .toList()

    fun fetchUserFilesWithOffsetAndLimit(userUuid: UUID, offset: Int, limit: Int): List<FileRecord> =
        databaseService.dsl
            .selectFrom(FileTable)
            .where(FileTable.User.eq(Misc.uuidToBin(userUuid)))
            .orderBy(FileTable.Uploaded.desc())
            .offset(offset)
            .limit(limit)
            .fetchArray()
            .toList()

    fun fetchUserFilesCount(userBinId: ByteArray): Int? = databaseService.dsl
        .selectCount()
        .from(FileTable)
        .where(FileTable.User.eq(userBinId))
        .fetchOne()?.value1()

    fun deleteUserFiles(userUuid: UUID) = databaseService.dsl
        .deleteFrom(FileTable)
        .where(FileTable.User.eq(Misc.uuidToBin(userUuid)))
        .execute()

    fun update(fileRecord: FileRecord) = databaseService.dsl
        .update(FileTable)
        .set(fileRecord)
        .where(FileTable.Id.eq(fileRecord.id))
        .execute()

    fun delete(fileId: ByteArray) = databaseService.dsl
        .deleteFrom(FileTable)
        .where(FileTable.Id.eq(fileId))
        .execute()

    fun userFileSizeSum(userBinId: ByteArray): Long = databaseService.dsl
        .select(DSL.sum(FileTable.Size))
        .from(FileTable)
        .where(FileTable.User.eq(userBinId))
        .fetchOne()?.value1()?.toLong() ?: 0L

    fun fetchUserFilesWithTitleLike(userBinId: ByteArray, titleLike: String): List<FileRecord> = databaseService.dsl
        .selectFrom(FileTable)
        .where(FileTable.User.eq(userBinId).and(FileTable.Title.like(titleLike)))
        .fetchArray()
        .toList()

}