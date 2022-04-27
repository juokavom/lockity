package lockity.repositories

import database.schema.tables.records.ConfirmationLinkRecord
import database.schema.tables.references.ConfirmationLinkTable
import database.schema.tables.references.FileTable
import database.schema.tables.references.UserTable
import lockity.models.ConfirmationLinkAndUser
import lockity.services.DatabaseService

class ConfirmationLinkRepository(
    private val databaseService: DatabaseService
) {
    fun insertLink(confirmationLinkRecord: ConfirmationLinkRecord) = databaseService.dsl
        .batchInsert(confirmationLinkRecord)
        .execute()

    fun delete(linkId: ByteArray) = databaseService.dsl
        .deleteFrom(ConfirmationLinkTable)
        .where(ConfirmationLinkTable.Id.eq(linkId))
        .execute()

    fun fetchConfirmationLinkAndUserRecordMapByLink(link: String): ConfirmationLinkAndUser? = databaseService.dsl
        .select()
        .from(ConfirmationLinkTable)
        .join(UserTable).onKey()
        .where(ConfirmationLinkTable.Link.eq(link))
        .fetchOne()?.map {
            ConfirmationLinkAndUser(
                confirmationLink = it.into(ConfirmationLinkTable),
                user = it.into(UserTable)
            )
        }
}