package lockity.repositories

import database.schema.tables.records.APIRecord
import database.schema.tables.references.APITable
import lockity.models.APIPermissions
import lockity.models.TokenData
import lockity.services.DatabaseService
import lockity.utils.Misc
import java.util.*

class APIRepository(
    private val databaseService: DatabaseService
) {
    fun insertToken(apiRecord: APIRecord) = databaseService.dsl
        .batchInsert(apiRecord)
        .execute()

    fun fetch(uuid: UUID): APIRecord? = databaseService.dsl
        .selectFrom(APITable)
        .where(APITable.Id.eq(Misc.uuidToBin(uuid)))
        .fetchOne()

    fun fetchByToken(token: String): APIRecord? = databaseService.dsl
        .selectFrom(APITable)
        .where(APITable.Token.eq(token))
        .fetchOne()

    fun delete(apiId: ByteArray) = databaseService.dsl
        .deleteFrom(APITable)
        .where(APITable.Id.eq(apiId))
        .execute()

    fun fetchTokensWithOffsetAndLimit(userBinId: ByteArray, offset: Int, limit: Int): List<TokenData> =
        databaseService.dsl
            .select()
            .from(APITable)
            .where(APITable.User.eq(userBinId))
            .orderBy(APITable.Created.desc())
            .offset(offset)
            .limit(limit)
            .fetch()
            .map {
                val permissions = mutableListOf<String>()
                if (it[APITable.CanCreate] == "1".toByte()) permissions.add(APIPermissions.CREATE.name)
                if (it[APITable.CanRead] == "1".toByte()) permissions.add(APIPermissions.READ.name)
                if (it[APITable.CanUpdate] == "1".toByte()) permissions.add(APIPermissions.UPDATE.name)
                if (it[APITable.CanDelete] == "1".toByte()) permissions.add(APIPermissions.DELETE.name)
                TokenData(
                    id = Misc.binToUuid(it[APITable.Id]!!).toString(),
                    title = it[APITable.Title]!!,
                    token = it[APITable.Token]!!.substring(0, 4),
                    permissions = permissions.toList(),
                    validFrom = it[APITable.ValidFrom]!!,
                    validTo = it[APITable.ValidTo]!!
                )
            }
            .toList()

    fun fetchAPICount(userBinId: ByteArray): Int = databaseService.dsl
        .selectCount()
        .from(APITable)
        .where(APITable.User.eq(userBinId))
        .fetchOne()?.value1() ?: 0
}