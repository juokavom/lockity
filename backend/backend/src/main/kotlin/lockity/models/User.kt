package lockity.models

import io.ktor.features.*

data class RegistrableUser(
    val name: String?,
    val surname: String?,
    val email: String,
    val password: String,
    val subscribed: Boolean
)

fun RegistrableUser.isValuesValid() {
    if(email == "" || password == "") throw BadRequestException("Email and password cannot be empty.")
}

data class SignInableUser(
    val email: String,
    val password: String
)

fun SignInableUser.isValuesValid() {
    if(email == "" || password == "") throw BadRequestException("Email and password cannot be empty.")
}