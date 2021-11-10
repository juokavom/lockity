package lockity.repositories

import database.schema.tables.records.RoleRecord
import database.schema.tables.references.RoleTable
import lockity.utils.DatabaseService
import java.util.*

class RoleRepository(
    private val databaseService: DatabaseService
) {
    fun roleUUID(role: String): ByteArray? = databaseService.dsl.select(RoleTable.Id)
        .from(RoleTable).where(RoleTable.Name.eq(role)).fetchOne()?.value1()
    fun fetch(uuid: UUID): RoleRecord? = databaseService.dsl.selectFrom(RoleTable)
        .where(RoleTable.Id.eq(databaseService.uuidToBin(uuid))).fetchOne()
}