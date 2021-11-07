package lockity.models

import database.schema.tables.records.UserRecord
import io.ktor.features.*

open class RegistrableUser(
    val name: String?,
    val surname: String?,
    val email: String,
    val password: String,
    val subscribed: Boolean
)

class FrontendUser(
    name: String?,
    surname: String?,
    email: String,
    password: String,
    subscribed: Boolean,
    val role: String
) : RegistrableUser(name, surname, email, password, subscribed) {
    companion object {
        fun fromRecordAndRole(userRecord: UserRecord, role: String) = FrontendUser(
            name = userRecord.name,
            surname = userRecord.surname,
            email = userRecord.email!!,
            password = "",
            subscribed = userRecord.subscribed == "1".toByte(),
            role = role
        )
    }
}

fun RegistrableUser.isValuesValid() {
    if (email == "" || password == "") throw BadRequestException("Email and password cannot be empty.")
}

class SignInableUser(
    val email: String,
    val password: String
)

fun SignInableUser.isValuesValid() {
    if (email == "" || password == "") throw BadRequestException("Email and password cannot be empty.")
}