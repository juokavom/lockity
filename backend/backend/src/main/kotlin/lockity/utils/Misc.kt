package lockity.utils

import at.favre.lib.crypto.bcrypt.BCrypt
import com.google.gson.JsonSyntaxException
import io.ktor.application.*
import io.ktor.features.*
import io.ktor.http.*
import io.ktor.response.*
import kotlinx.serialization.SerializationException
import javax.naming.NoPermissionException

suspend fun ApplicationCall.withErrorHandler(block: suspend () -> Unit) {
    try {
        block()
    } catch (e: JsonSyntaxException) {
        this.respondJSON("Bad body parameters", HttpStatusCode.BadRequest)
    } catch (e: SerializationException) {
        this.respondJSON("Bad body parameters", HttpStatusCode.BadRequest)
    } catch (e: IllegalStateException) {
        this.respondJSON("Illegal parameters", HttpStatusCode.BadRequest)
    } catch (e: NullPointerException) {
        this.respondJSON("Bad parameters", HttpStatusCode.BadRequest)
    } catch (e: java.lang.IllegalArgumentException) {
        this.respondJSON("Bad parameters", HttpStatusCode.BadRequest)
    } catch (e: java.lang.NumberFormatException) {
        this.respondJSON("Bad parameters", HttpStatusCode.BadRequest)
    } catch (e: java.time.format.DateTimeParseException) {
        this.respondJSON("Bad parameters", HttpStatusCode.BadRequest)
    } catch (e: java.io.IOException) {
        this.respondJSON("File not attached correctly", HttpStatusCode.BadRequest)
    } catch (e: BadRequestException) {
        this.respondJSON(e.message.toString(), HttpStatusCode.BadRequest)
    } catch (e: NotFoundException) {
        this.respondJSON(e.message.toString(), HttpStatusCode.NotFound)
    } catch (e: NoPermissionException) {
        this.respondJSON(e.message.toString(), HttpStatusCode.Forbidden)
    }
}

suspend fun ApplicationCall.respondJSON(message: String, httpStatusCode: HttpStatusCode, title: String? = "message") {
    this.respondText("{\"$title\":\"$message\"}", ContentType.Application.Json, httpStatusCode)
}

fun Application.bcryptPassword(password: String) = BCrypt.withDefaults().hashToString(12, password.toCharArray())

fun Application.passwordIsCorrect(input: String, hash: String): Boolean =
    BCrypt.verifyer().verify(input.toCharArray(), hash).verified
