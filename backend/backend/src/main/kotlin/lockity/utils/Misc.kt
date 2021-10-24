package lockity.utils

import at.favre.lib.crypto.bcrypt.BCrypt
import io.ktor.application.*
import io.ktor.features.*
import io.ktor.http.*
import io.ktor.response.*
import java.util.*

suspend fun Application.withErrorHandler(call: ApplicationCall, block: suspend (ApplicationCall) -> Unit) {
    try {
        block(call)
    } catch (e: BadRequestException) {
        call.respondJSON(e.message.toString(), HttpStatusCode.BadRequest)
    } catch (e: NotFoundException) {
        call.respondJSON(e.message.toString(), HttpStatusCode.NotFound)
    }
}

suspend fun ApplicationCall.respondJSON(message: String, httpStatusCode: HttpStatusCode) {
    this.respondText("{\"message\":\"$message\"}", ContentType.Application.Json, httpStatusCode)
}

fun Application.bcryptPassword(password: String) = BCrypt.withDefaults().hashToString(12, password.toCharArray())

fun Application.passwordIsCorrect(input: String, hash: String): Boolean =
    BCrypt.verifyer().verify(input.toCharArray(), hash).verified
