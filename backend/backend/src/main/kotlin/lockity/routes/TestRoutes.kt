package lockity.routes

import io.ktor.application.*
import io.ktor.auth.*
import io.ktor.http.*
import io.ktor.http.content.*
import io.ktor.response.*
import io.ktor.routing.*
import lockity.services.FileService
import lockity.utils.AUTHENTICATED
import lockity.utils.ROLE
import lockity.utils.respondJSON
import org.koin.ktor.ext.inject
import java.io.File
import io.ktor.features.*
import io.ktor.request.*
import io.ktor.util.*

private suspend inline fun ApplicationCall.respondStaticFile(
    requestedFile: File,
    compressedTypes: List<CompressedFileType>?
) {
    val bestCompressionFit = requestedFile.bestCompressionFit(request.acceptEncodingItems(), compressedTypes)
    bestCompressionFit?.run {
        attributes.put(Compression.SuppressionAttribute, true)
    }
    val localFile = bestCompressionFit?.file(requestedFile) ?: requestedFile
    if (localFile.isFile) {
        val localFileContent = LocalFileContent(localFile, ContentType.defaultForFile(requestedFile))
        respond(PreCompressedResponse(localFileContent, bestCompressionFit?.encoding))
    }
}

private fun File.bestCompressionFit(
    acceptEncoding: List<HeaderValue>,
    compressedTypes: List<CompressedFileType>?
): CompressedFileType? {
    val acceptedEncodings = acceptEncoding.map { it.value }.toSet()
    // We respect the order in compressedTypes, not the one on Accept header
    return compressedTypes?.filter {
        it.encoding in acceptedEncodings
    }?.firstOrNull { it.file(this).isFile }
}


private class PreCompressedResponse(
    val original: ReadChannelContent,
    val encoding: String?,
) : OutgoingContent.ReadChannelContent() {
    override val contentLength get() = original.contentLength
    override val contentType get() = original.contentType
    override val status get() = original.status
    override fun readFrom() = original.readFrom()
    override fun readFrom(range: LongRange) = original.readFrom(range)
    override val headers by lazy(LazyThreadSafetyMode.NONE) {
        if (encoding != null) {
            Headers.build {
                appendFiltered(original.headers) { name, _ -> !name.equals(HttpHeaders.ContentLength, true) }
                append(HttpHeaders.ContentEncoding, encoding)
            }
        } else original.headers
    }

    override fun <T : Any> getProperty(key: AttributeKey<T>) = original.getProperty(key)
    override fun <T : Any> setProperty(key: AttributeKey<T>, value: T?) = original.setProperty(key, value)
}

public enum class ccc(val extension: String, val encoding: String = extension) {
    // https://www.theregister.co.uk/2015/10/11/googles_bro_file_format_changed_to_br_after_gender_politics_worries/
    BROTLI("br"),
    GZIP("gz", "gzip");

    public fun file(plain: File): File = File("${plain.absolutePath}.$extension")
}

fun Application.testRoutes() {
    val fileService: FileService by inject()
    routing {
        route("/test") {
            /**
             * Authorization testing routes
             */
            get("/simple") {
                call.respondJSON("Just simple!", HttpStatusCode.OK)
            }
            authenticate(AUTHENTICATED) {
                get("/authenticated") {
                    call.respondJSON("Nice authed!", HttpStatusCode.OK)
                }
            }
            authenticate(ROLE.ADMIN) {
                get("/admin") {
                    call.respondJSON("Nice authed admin!", HttpStatusCode.OK)
                }
            }
        }
    }
}