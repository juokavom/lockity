package lockity.repositories

import database.schema.tables.records.ForgotPasswordLinkRecord
import database.schema.tables.references.ConfirmationLinkTable
import database.schema.tables.references.ForgotPasswordLinkTable
import database.schema.tables.references.UserTable
import lockity.models.ForgotPasswordLinkAndUser
import lockity.services.DatabaseService

class ForgotLinkRepository(
    private val databaseService: DatabaseService
) {
    fun insertLink(forgotLinkRecord: ForgotPasswordLinkRecord) = databaseService.dsl
        .batchInsert(forgotLinkRecord)
        .execute()

    fun delete(linkId: ByteArray) = databaseService.dsl
        .deleteFrom(ForgotPasswordLinkTable)
        .where(ForgotPasswordLinkTable.Id.eq(linkId))
        .execute()

    fun fetchForgotPasswordLinkAndUserRecordMapByLink(link: String): ForgotPasswordLinkAndUser? = databaseService.dsl
        .select()
        .from(ForgotPasswordLinkTable)
        .join(UserTable).onKey()
        .where(ForgotPasswordLinkTable.Link.eq(link))
        .fetchOne()?.map {
            ForgotPasswordLinkAndUser(
                forgotPasswordLink = it.into(ForgotPasswordLinkTable),
                user = it.into(UserTable)
            )
        }
}