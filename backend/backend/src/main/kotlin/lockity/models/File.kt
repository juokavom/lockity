package lockity.models

import io.ktor.features.*

data class AnonymousFileMetadata(
    val fileId: String,
    val fileKey: String
)

fun AnonymousFileMetadata.isValuesValid() {
    if (fileId == "" || fileKey == "") throw BadRequestException("Email and password cannot be empty.")
}