package lockity.models

import database.schema.tables.records.ConfirmationLinkRecord
import database.schema.tables.records.UserRecord
import io.ktor.features.*
import kotlinx.serialization.Serializable

@Serializable
data class ConfirmableLink(
    val link: String
)

fun ConfirmableLink.isValuesValid() {
    if(link == "") throw BadRequestException("Link cannot be empty.")
}

data class ConfirmationLinkAndUser(
    val confirmationLink: ConfirmationLinkRecord,
    val user: UserRecord
)