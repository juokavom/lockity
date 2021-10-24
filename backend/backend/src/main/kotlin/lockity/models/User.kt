package lockity.models

data class RegistrableUser(
    val name: String?,
    val surname: String?,
    val email: String,
    val password: String
)

data class SignInableUser(
    val email: String,
    val password: String
)