package lockity.models

import database.schema.tables.records.ConfirmationLinkRecord
import database.schema.tables.records.UserRecord

data class ConfirmableLink(
    val link: String
)

data class ConfirmationLinkAndUser(
    val confirmationLink: ConfirmationLinkRecord,
    val user: UserRecord
)