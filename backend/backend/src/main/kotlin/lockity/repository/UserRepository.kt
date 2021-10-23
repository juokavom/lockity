package lockity.repository

import database.schema.tables.records.UserRecord
import database.schema.tables.references.UserTable
import lockity.utils.DatabaseService
import java.time.LocalDateTime
import java.util.*

class UserRepository(
    private val databaseService: DatabaseService
) {
    fun isEmailUnique(email: String) = databaseService.dsl
        .selectCount()
        .from(UserTable)
        .where(UserTable.Email.eq(email))
        .fetchOne()?.value1() == 0

    fun insertUser(userRecord: UserRecord) = databaseService.dsl
        .batchInsert(userRecord)
        .execute()

    fun fetch(): List<UserRecord> = databaseService.dsl
        .selectFrom(UserTable)
        .fetchArray()
        .toList()

    fun updateLastActive(uuid: UUID) = databaseService.dsl
        .update(UserTable)
        .set(UserTable.LastActive, LocalDateTime.now())
        .where(UserTable.Id.eq(databaseService.generateBinaryUUID(uuid)))
        .execute()
}