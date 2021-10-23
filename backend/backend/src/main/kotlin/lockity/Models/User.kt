package lockity.Models

data class RegistrableUser(
    val name: String?,
    val surname: String?,
    val email: String,
    val password: String
)