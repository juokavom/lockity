package lockity.models

import database.schema.tables.records.UserRecord
import io.ktor.features.*
import kotlinx.serialization.Serializable

@Serializable
data class SignInableUser(
    val email: String,
    val password: String
)

@Serializable
data class RegistrableUser(
    val name: String?,
    val surname: String?,
    val email: String,
    val password: String,
    val subscribed: Boolean
)

fun RegistrableUser.isValuesValid() {
    if (email == "" || password == "") throw BadRequestException("Email and password cannot be empty.")
}

@Serializable
data class FrontendUser(
    val name: String?,
    val surname: String?,
    val email: String,
    val password: String,
    val subscribed: Boolean,
    val role: String
)

fun frontendUserFromUserRecordAndRole(userRecord: UserRecord, role: String) = FrontendUser(
    name = userRecord.name,
    surname = userRecord.surname,
    email = userRecord.email!!,
    password = "",
    subscribed = userRecord.subscribed == "1".toByte(),
    role = role
)