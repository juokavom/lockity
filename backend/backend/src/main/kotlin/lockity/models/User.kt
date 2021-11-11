@file:UseSerializers(JsonLocalDateTimeSerializer::class)

package lockity.models

import database.schema.tables.records.UserRecord
import io.ktor.features.*
import kotlinx.serialization.Serializable
import kotlinx.serialization.UseSerializers
import lockity.plugins.JsonLocalDateTimeSerializer
import lockity.utils.ROLE
import java.time.LocalDateTime

@Serializable
data class SignInAbleUser(
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
    val email: String,
    val role: String
)

@Serializable
data class CreatableUser(
    var name: String?,
    var surname: String?,
    var email: String,
    var password: String,
    var role: String,
    var registered: LocalDateTime?,
    var lastActive: LocalDateTime?,
    var confirmed: Boolean,
    var subscribed: Boolean,
    var storageSize: Long
)


fun CreatableUser.isValuesValid() {
    if (email == "" || password == "" || (role != ROLE.REGISTERED && role != ROLE.ADMIN))
        throw BadRequestException("Email, password and role failed validation.")
}

@Serializable
data class EditableUser(
    var name: String?,
    var surname: String?,
    var email: String,
    var password: String,
    var role: String,
    var registered: LocalDateTime?,
    var lastActive: LocalDateTime?,
    var confirmed: Boolean,
    var subscribed: Boolean,
    var storageSize: Long
)


fun EditableUser.isValuesValid() {
    if (email == "" || (role != ROLE.REGISTERED && role != ROLE.ADMIN))
        throw BadRequestException("Email, password and role failed validation.")
}

@Serializable
data class FullUser(
    var id: String,
    var name: String?,
    var surname: String?,
    var email: String,
    var password: String,
    var role: String,
    var registered: LocalDateTime?,
    var lastActive: LocalDateTime?,
    var confirmed: Boolean,
    var subscribed: Boolean,
    var storageSize: Long
)

fun fullUserFromUserRecordAndRole(userId: String, userRecord: UserRecord, role: String) = FullUser(
    id = userId,
    name = userRecord.name,
    surname = userRecord.surname,
    email = userRecord.email!!,
    password = "",
    role = role,
    registered = userRecord.registered,
    lastActive = userRecord.lastActive,
    confirmed = userRecord.confirmed == "1".toByte(),
    subscribed = userRecord.subscribed == "1".toByte(),
    storageSize = userRecord.storageSize!!
)

