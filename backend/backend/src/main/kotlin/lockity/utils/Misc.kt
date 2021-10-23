package lockity.utils

import at.favre.lib.crypto.bcrypt.BCrypt
import io.ktor.application.*
import io.ktor.features.*
import io.ktor.http.*
import io.ktor.response.*
import java.nio.ByteBuffer
import java.util.*


fun Application.generateBinaryUUID(uuid: UUID = UUID.randomUUID()): ByteArray {
    val bb = ByteBuffer.wrap(ByteArray(16))
    bb.putLong(uuid.mostSignificantBits)
    bb.putLong(uuid.leastSignificantBits)
    return bb.array()
}

suspend fun Application.withErrorHandler(call: ApplicationCall, block: suspend (ApplicationCall) -> Unit) {
    try {
        block(call)
    } catch (e: BadRequestException) {
        call.respondJSON(e.message.toString(), HttpStatusCode.BadRequest)
    }
}

suspend fun ApplicationCall.respondJSON(message: String, httpStatusCode: HttpStatusCode) {
    this.respondText("{\"message\":\"$message\"}", ContentType.Application.Json, httpStatusCode)
}

fun Application.bcryptPassword(password: String) = BCrypt.withDefaults().hashToString(12, password.toCharArray())

fun Application.verifyPassword(input: String, hash: String) = BCrypt.verifyer().verify(input.toCharArray(), hash)