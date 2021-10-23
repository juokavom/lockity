package lockity.repository

import database.schema.tables.records.UserRecord
import database.schema.tables.references.RoleTable
import database.schema.tables.references.UserTable
import lockity.utils.DatabaseService
import lockity.utils.ROLE
import java.util.*

class RoleRepository(
    private val databaseService: DatabaseService
) {
    fun roleUUID(role: String): ByteArray? = databaseService.dsl.select(RoleTable.Id)
        .from(RoleTable).where(RoleTable.Name.eq(role)).fetchOne()?.value1()
}