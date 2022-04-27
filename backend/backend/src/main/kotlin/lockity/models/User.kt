@file:UseSerializers(JsonLocalDateTimeSerializer::class)

package lockity.models

import io.ktor.features.*
import kotlinx.serialization.Serializable
import kotlinx.serialization.UseSerializers
import lockity.plugins.JsonLocalDateTimeSerializer
import lockity.utils.MAX_STORAGE_BYTES
import lockity.utils.ROLE
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
    if (username == "" || email == "" || password == "") throw BadRequestException("Username, email and password cannot be empty.")
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
    val email: String
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
data class CreatableUser(
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


fun CreatableUser.isValuesValid() {
    if (username == "" || email == "" || password == "" || (role != ROLE.REGISTERED && role != ROLE.ADMIN) || storageSize > MAX_STORAGE_BYTES)
        throw BadRequestException("Username, email, password, role or storage size failed validation.")
}

@Serializable
data class EditableUser(
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


fun EditableUser.isValuesValid() {
    if (username == "" || email == "" || (role != ROLE.REGISTERED && role != ROLE.ADMIN) || storageSize > MAX_STORAGE_BYTES)
        throw BadRequestException("Username, email, role or storage size failed validation.")
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
    if (username == "" || email == "") throw BadRequestException("Email and username cannot be empty.")
}