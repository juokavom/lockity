package lockity.repositories

import database.schema.tables.records.ConfirmationLinkRecord
import database.schema.tables.references.ConfirmationLinkTable
import database.schema.tables.references.UserTable
import lockity.models.ConfirmationLinkAndUser
import lockity.utils.DatabaseService

class ConfirmationLinkRepository(
    private val databaseService: DatabaseService
) {
    fun insertLink(confirmationLinkRecord: ConfirmationLinkRecord) = databaseService.dsl
        .batchInsert(confirmationLinkRecord)
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