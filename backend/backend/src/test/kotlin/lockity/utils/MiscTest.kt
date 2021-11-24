package lockity.utils

import org.junit.jupiter.api.Test
import java.util.*
import kotlin.test.assertEquals

class MiscTest {
    private val uuid = UUID.fromString("f9ed1924-be8c-447b-8d42-a9afaea20e27")
    private val binaryArray = byteArrayOf(-7, -19, 25, 36, -66, -116, 68, 123, -115, 66, -87, -81, -82, -94, 14, 39)

    @Test
    fun uuidToBin() {
        assertEquals(
            actual = Misc.uuidToBin(uuid).contentToString(),
            expected = binaryArray.contentToString()
        )
    }

    @Test
    fun binToUuid() {
        assertEquals(
            actual = Misc.binToUuid(binaryArray),
            expected = uuid
        )
    }
}