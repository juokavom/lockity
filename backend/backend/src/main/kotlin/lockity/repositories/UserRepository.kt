package lockity.repositories

import database.schema.tables.records.UserRecord
import database.schema.tables.references.RoleTable
import database.schema.tables.references.UserTable
import lockity.models.UserData
import lockity.services.DatabaseService
import lockity.utils.Misc
import lockity.utils.USER
import java.time.LocalDateTime
import java.util.*

class UserRepository(
    private val databaseService: DatabaseService
) {
    fun userExist(uuid: UUID): Boolean = databaseService.dsl
        .selectCount()
        .from(UserTable)
        .where(UserTable.Id.eq(Misc.uuidToBin(uuid)))
        .fetchOne()?.value1() == 1

    fun isEmailUnique(email: String): Boolean = databaseService.dsl
        .selectCount()
        .from(UserTable)
        .where(UserTable.Email.eq(email))
        .fetchOne()?.value1() == 0

    fun isAnyoneElseEmailUnique(uuid: UUID, email: String): Boolean = databaseService.dsl
        .selectCount()
        .from(UserTable)
        .where(
            UserTable.Email.eq(email)
                .and(UserTable.Id.ne(Misc.uuidToBin(uuid)))
        )
        .fetchOne()?.value1() == 0

    fun insertUser(userRecord: UserRecord) = databaseService.dsl
        .batchInsert(userRecord)
        .execute()

    fun delete(uuid: UUID) = databaseService.dsl
        .deleteFrom(UserTable)
        .where(UserTable.Id.eq(Misc.uuidToBin(uuid)))
        .execute()

    fun updateUser(userRecord: UserRecord) = databaseService.dsl
        .update(UserTable)
        .set(userRecord)
        .where(UserTable.Id.eq(userRecord.id))
        .execute()

    fun fetch(uuid: UUID): UserRecord? = databaseService.dsl
        .selectFrom(UserTable)
        .where(UserTable.Id.eq(Misc.uuidToBin(uuid)))
        .fetchOne()

    fun fetchWithEmailLike(emailLike: String): List<UserRecord> = databaseService.dsl
        .selectFrom(UserTable)
        .where(UserTable.Email.like(emailLike))
        .fetchArray()
        .toList()

    fun updateLastActive(uuid: UUID) = databaseService.dsl
        .update(UserTable)
        .set(UserTable.LastActive, LocalDateTime.now())
        .where(UserTable.Id.eq(Misc.uuidToBin(uuid)))
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
                USER.ID to it[UserTable.Id]?.let { it1 -> Misc.binToUuid(it1).toString() },
                USER.PASSWORD to it[UserTable.Password],
                USER.CONFIRMED to it[UserTable.Confirmed].toString(),
            )
        }


    fun fetchUsersWithOffsetAndLimit(offset: Int, limit: Int): List<UserData> =
        databaseService.dsl
            .select()
            .from(UserTable)
            .join(RoleTable).onKey()
            .orderBy(UserTable.Registered.desc())
            .offset(offset)
            .limit(limit)
            .fetch()
            .map {
                UserData(
                    id = Misc.binToUuid(it[UserTable.Id]!!).toString(),
                    name = it[UserTable.Name],
                    surname = it[UserTable.Surname],
                    email = it[UserTable.Email]!!,
                    role = it[RoleTable.Name]!!,
                    registered =  it[UserTable.Registered]!!,
                    lastActive =  it[UserTable.LastActive],
                    confirmed =  it[UserTable.Confirmed]!! == "1".toByte(),
                    subscribed =  it[UserTable.Subscribed]!! == "1".toByte(),
                    storageSize =  it[UserTable.StorageSize]!!
                )
            }
            .toList()

    fun fetchUsersCount(): Int = databaseService.dsl
        .selectCount()
        .from(UserTable)
        .fetchOne()?.value1() ?: 0
}