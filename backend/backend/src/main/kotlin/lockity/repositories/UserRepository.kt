package lockity.repositories

import database.schema.tables.records.UserRecord
import database.schema.tables.references.RoleTable
import database.schema.tables.references.UserTable
import lockity.utils.DatabaseService
import lockity.utils.USER
import java.time.LocalDateTime
import java.util.*

class UserRepository(
    private val databaseService: DatabaseService
) {
    fun isEmailUnique(email: String): Boolean = databaseService.dsl
        .selectCount()
        .from(UserTable)
        .where(UserTable.Email.eq(email))
        .fetchOne()?.value1() == 0

    fun isAnyoneElseEmailUnique(uuid: UUID, email: String): Boolean = databaseService.dsl
        .selectCount()
        .from(UserTable)
        .where(UserTable.Email.eq(email)
            .and(UserTable.Id.ne(databaseService.uuidToBin(uuid))))
        .fetchOne()?.value1() == 0

    fun insertUser(userRecord: UserRecord) = databaseService.dsl
        .batchInsert(userRecord)
        .execute()

    fun delete(uuid: UUID) = databaseService.dsl
        .deleteFrom(UserTable)
        .where(UserTable.Id.eq(databaseService.uuidToBin(uuid)))
        .execute()

    fun updateUser(userRecord: UserRecord) = databaseService.dsl
        .update(UserTable)
        .set(userRecord)
        .where(UserTable.Id.eq(userRecord.id))
        .execute()

    fun fetch(uuid: UUID): UserRecord? = databaseService.dsl
        .selectFrom(UserTable)
        .where(UserTable.Id.eq(databaseService.uuidToBin(uuid)))
        .fetchOne()

    fun fetchWithEmailLike(emailLike: String): List<UserRecord> = databaseService.dsl
        .selectFrom(UserTable)
        .where(UserTable.Email.like(emailLike))
        .fetchArray()
        .toList()

    fun fetchAll(): List<UserRecord> = databaseService.dsl
        .selectFrom(UserTable)
        .fetchArray()
        .toList()

    fun updateLastActive(uuid: UUID) = databaseService.dsl
        .update(UserTable)
        .set(UserTable.LastActive, LocalDateTime.now())
        .where(UserTable.Id.eq(databaseService.uuidToBin(uuid)))
        .execute()

    fun fetchLoginUserMap(email: String): Map<String, String?>? = databaseService.dsl
        .select()
        .from(UserTable)
        .join(RoleTable)
        .onKey()
        .where(UserTable.Email.eq(email))
        .fetchOne()
        ?.map {
            mapOf(
                USER.ID to it[UserTable.Id]?.let { it1 -> databaseService.binToUuid(it1).toString() },
                USER.PASSWORD to it[UserTable.Password],
                USER.CONFIRMED to it[UserTable.Confirmed].toString(),
                USER.ROLE to it[RoleTable.Name]
            )
        }
}