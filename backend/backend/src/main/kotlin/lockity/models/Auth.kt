package lockity.models

import database.schema.tables.records.ConfirmationLinkRecord
import database.schema.tables.records.ForgotPasswordLinkRecord
import database.schema.tables.records.UserRecord
import io.ktor.features.*
import kotlinx.serialization.Serializable
import lockity.utils.inputValid

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

@Serializable
data class Email(
    val email: String
)

fun Email.isValuesValid() {
    if(email == "" || !email.inputValid())
        throw BadRequestException("Email failed validation.")
}

data class ForgotPasswordLinkAndUser(
    val forgotPasswordLink: ForgotPasswordLinkRecord,
    val user: UserRecord
)

@Serializable
data class ResetedPassword(
    val link: String,
    val password: String
)

fun ResetedPassword.isValuesValid() {
    if(link == "" || password == "" || !password.inputValid())
        throw BadRequestException("Link and password failed validation.")
}
