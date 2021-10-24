package lockity.repositories

import database.schema.tables.references.RoleTable
import lockity.utils.DatabaseService

class RoleRepository(
    private val databaseService: DatabaseService
) {
    fun roleUUID(role: String): ByteArray? = databaseService.dsl.select(RoleTable.Id)
        .from(RoleTable).where(RoleTable.Name.eq(role)).fetchOne()?.value1()
}