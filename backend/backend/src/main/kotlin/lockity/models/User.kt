@file:UseSerializers(JsonLocalDateTimeSerializer::class)

package lockity.models

import io.ktor.features.*
import kotlinx.serialization.Serializable
import kotlinx.serialization.UseSerializers
import lockity.plugins.JsonLocalDateTimeSerializer
import lockity.utils.MAX_STORAGE_BYTES
import lockity.utils.ROLE
import lockity.utils.inputValid
import java.time.LocalDateTime

@Serializable
data class SignInAbleUser(
    val email: String,
    val password: String
)

@Serializable
data class RegistrableUser(
    val username: String,
    val name: String?,
    val surname: String?,
    val email: String,
    val password: String
)

fun RegistrableUser.isValuesValid() {
    if (username == "" || email == "" || password == ""
        || !username.inputValid() || !name.inputValid() || !surname.inputValid()
        || !email.inputValid()
    ) throw BadRequestException("Username, email, name, surname or password failed validation.")
}

@Serializable
data class FrontendUser(
    val id: String,
    val email: String,
    val username: String,
    val publicName: String,
    val role: String
)

@Serializable
data class UserForSharing(
    val id: String,
    val publicName: String
)

@Serializable
data class UserCount(
    val userCount: Int
)

@Serializable
data class UserData(
    val id: String,
    val name: String?,
    val username: String,
    val surname: String?,
    val email: String,
    val role: String,
    val registered: LocalDateTime,
    val lastActive: LocalDateTime?,
    val confirmed: Boolean,
    val subscribed: Boolean,
    val storageSize: Long,
    val publicName: String
)

@Serializable
data class User(
    var username: String,
    var name: String?,
    var surname: String?,
    var email: String,
    var password: String,
    var role: String,
    var registered: LocalDateTime,
    var lastActive: LocalDateTime?,
    var confirmed: Boolean,
    var subscribed: Boolean,
    var storageSize: Long
)

fun User.isCreateValuesValid() {
    if (password == "") throw BadRequestException("Password failed validation.")
    isEditValuesValid()
}

fun User.isEditValuesValid() {
    if (username == "" || email == "" ||
        (role != ROLE.REGISTERED && role != ROLE.ADMIN)
        || storageSize > MAX_STORAGE_BYTES
        || !username.inputValid() || !name.inputValid() || !surname.inputValid()
        || !email.inputValid() || !role.inputValid()
    )
        throw BadRequestException("Username, name, surname, email, role or storage size failed validation.")
}

@Serializable
data class EditableUserSelf(
    var username: String,
    var name: String?,
    var surname: String?,
    var email: String,
    var password: String,
    var subscribed: Boolean
)

fun EditableUserSelf.isValuesValid() {
    if (username == "" || email == "" || !username.inputValid()
        || !name.inputValid() || !surname.inputValid() || !email.inputValid()
    ) throw BadRequestException("Email, username, name or surname failed validation.")
}