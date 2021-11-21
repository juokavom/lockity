package lockity.services

import com.sun.xml.internal.messaging.saaj.util.ByteOutputStream
import database.schema.tables.records.FileRecord
import database.schema.tables.records.UserRecord
import io.ktor.features.*
import io.ktor.http.*
import io.ktor.http.content.*
import io.ktor.utils.io.streams.*
import io.mockk.every
import io.mockk.mockk
import io.mockk.spyk
import io.mockk.verify
import lockity.repositories.FileRepository
import lockity.utils.GUEST_MAX_STORAGE_BYTES
import org.junit.jupiter.api.Test
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.Arguments
import org.junit.jupiter.params.provider.MethodSource
import java.io.File
import java.util.*
import javax.naming.NoPermissionException
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith
import kotlin.test.assertTrue

internal class FileServiceTest {
    private val databaseService = mockk<DatabaseService>(relaxed = true)
    private val fileRepository = mockk<FileRepository>(relaxed = true)
    private val emptyFileId = "".toByteArray()

    private val fileService = spyk(
        FileService(
            mockk(relaxed = true),
            fileRepository,
            mockk(relaxed = true),
            mockk(relaxed = true)
        )
    )

    companion object {
        @JvmStatic
        fun deleteUserFilesParamsProvider(): List<Arguments> {
            return listOf<Arguments>(
                Arguments.of(true),
                Arguments.of(false)
            )
        }
    }

    @Test
    fun `it must copy streams`() {
        val value = "test"
        val inputStream = value.byteInputStream()
        val outputStream = ByteOutputStream()

        fileService.copyTo(inputStream, outputStream).toString()
        assertEquals(
            actual = outputStream.toString(),
            expected = value
        )
    }

    @ParameterizedTest
    @MethodSource("deleteUserFilesParamsProvider")
    fun `it must successfully delete user files`(success: Boolean) {
        every { fileRepository.fetchUserFiles(any()) } returns listOf(
            FileRecord(id = emptyFileId),
            FileRecord(id = emptyFileId)
        )
        every { fileService.deletePhysicalFile(any()) } returns success
        assertEquals(
            actual = fileService.deletePhysicalUserFiles(mockk()),
            expected = success
        )
    }

    @Test
    fun `it must delete physical file`() {
        val dirName = "test"
        File(dirName).mkdir()
        File("$dirName/test.txt").createNewFile()
        every { fileService.uploadsLocation(any()) } returns dirName
        assertTrue(
            actual = fileService.deletePhysicalFile("".toByteArray())
        )
    }

    @Test
    fun `it must upload guest file`() {
        every { fileService.uploadFile(any(), any()) } returns FileRecord()
        fileService.uploadGuestFile(mockk(relaxed = true), GUEST_MAX_STORAGE_BYTES - 10L)
        verify { fileRepository.insert(any()) }
    }

    @Test
    fun `it must not let upload guest file if it is too big`() {
        assertFailsWith<BadRequestException> {
            fileService.uploadGuestFile(mockk(relaxed = true), GUEST_MAX_STORAGE_BYTES + 10L)
        }
    }

    @Test
    fun `it must upload user file`() {
        val userRecord = UserRecord()
        userRecord.id = databaseService.uuidToBin(UUID.randomUUID())
        userRecord.storageSize = 100L
        every { fileRepository.userFileSizeSum(any()) } returns 10L
        every { fileService.uploadFile(any(), any()) } returns FileRecord()
        fileService.uploadUserFile(userRecord, mockk(), 10L)
        verify { fileRepository.insert(any()) }
    }

    @Test
    fun `it must not let upload user file if user storage space is exceeded`() {
        val userRecord = UserRecord()
        userRecord.id = databaseService.uuidToBin(UUID.randomUUID())
        userRecord.storageSize = 10L
        every { fileRepository.userFileSizeSum(any()) } returns 10L
        every { fileService.uploadFile(any(), any()) } returns FileRecord()
        assertFailsWith<NoPermissionException> {
            fileService.uploadUserFile(userRecord, mockk(), 10L)
        }
    }

    @Test
    fun `it must upload file`() {
        val fileName = "testFile.mp4"
        val fileSize = 200L
        val part = PartData.FileItem(
            { "".byteInputStream().asInput() },
            {}, headersOf(
                HttpHeaders.ContentDisposition,
                ContentDisposition.File.withParameter(
                    ContentDisposition.Parameters.FileName, fileName
                ).toString()
            )
        )
        val uploaded = fileService.uploadFile(part, fileSize)
        val matches = (uploaded.title == fileName &&
                uploaded.user == null &&
                uploaded.key == null &&
                uploaded.link == null &&
                uploaded.lastAccessed == null &&
                uploaded.size == fileSize)

        assertTrue (
            actual = matches
        )
    }

    @Test
    fun getUserFile() {
    }

    @Test
    fun getUserReceivedFile() {
    }

    @Test
    fun getDynamicLinkFile() {
    }

    @Test
    fun getUserFilesMetadata() {
    }

    @Test
    fun testGetUserFilesMetadata() {
    }

    @Test
    fun getUserFilesMetadataInfo() {
    }

    @Test
    fun getUserReceivedFilesMetadata() {
    }

    @Test
    fun getUserReceivedFilesMetadataCount() {
    }

    @Test
    fun getDynamicLinkFileTitleLink() {
    }

    @Test
    fun updateUserFile() {
    }

    @Test
    fun modifyUserFileSharing() {
    }

    @Test
    fun deleteFile() {
    }
}