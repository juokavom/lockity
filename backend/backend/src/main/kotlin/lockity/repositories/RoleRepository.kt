package lockity.repositories

import database.schema.tables.records.RoleRecord
import database.schema.tables.references.RoleTable
import lockity.services.DatabaseService
import java.util.*

class RoleRepository(
    private val databaseService: DatabaseService
) {
    fun roleUUID(role: String): ByteArray? = databaseService.dsl.select(RoleTable.Id)
        .from(RoleTable).where(RoleTable.Name.eq(role)).fetchOne()?.value1()
    fun fetch(uuidBin: ByteArray): RoleRecord? = databaseService.dsl.selectFrom(RoleTable)
        .where(RoleTable.Id.eq(uuidBin)).fetchOne()
}