package lockity.plugins

import kotlinx.serialization.KSerializer
import kotlinx.serialization.Serializer
import kotlinx.serialization.descriptors.SerialDescriptor
import kotlinx.serialization.descriptors.buildClassSerialDescriptor
import kotlinx.serialization.encoding.Decoder
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter

@Serializer(forClass = LocalDateTime::class)
object JsonLocalDateTimeSerializer : KSerializer<LocalDateTime> {
    override val descriptor: SerialDescriptor = buildClassSerialDescriptor("java.time.LocalDateTime")

    override fun deserialize(decoder: Decoder): LocalDateTime {
        @Suppress("MagicNumber")
        return LocalDateTime.parse(
            decoder.decodeString(),
            DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss")
        )
    }

    override fun serialize(encoder: kotlinx.serialization.encoding.Encoder, value: LocalDateTime) {
        encoder.encodeString(value.format(DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss")))
    }
}