package lockity.services

import database.schema.tables.records.FileRecord
import database.schema.tables.records.SharedAccessRecord
import database.schema.tables.records.UserRecord
import io.ktor.features.*
import io.ktor.http.*
import io.ktor.http.content.*
import io.ktor.utils.io.streams.*
import io.mockk.*
import lockity.models.FileMetadataInfo
import lockity.models.StorageData
import lockity.repositories.FileRepository
import lockity.repositories.SharedAccessRepository
import lockity.utils.GUEST_MAX_STORAGE_BYTES
import lockity.utils.Misc
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.TestInstance
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.Arguments
import org.junit.jupiter.params.provider.MethodSource
import java.io.ByteArrayOutputStream
import java.io.File
import java.util.*
import javax.naming.NoPermissionException
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith
import kotlin.test.assertTrue
import kotlin.test.fail

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
internal class FileServiceTest {
    private lateinit var databaseService: DatabaseService
    private lateinit var fileRepository: FileRepository
    private lateinit var sharedAccessRepository: SharedAccessRepository
    private lateinit var emptyFileId: ByteArray
    private lateinit var fileService: FileService

    @BeforeEach
    fun setUp() {
        databaseService = mockk(relaxed = true)
        fileRepository = mockk(relaxed = true)
        sharedAccessRepository = mockk(relaxed = true)
        emptyFileId = "".toByteArray()
        fileService = spyk(
            FileService(
                mockk(relaxed = true),
                fileRepository,
                sharedAccessRepository,
                mockk(relaxed = true)
            )
        )
    }

    @AfterEach
    fun tearDown() {
        unmockkAll()
    }

    @Test
    fun `it must copy streams`() {
        val value = "test"
        val inputStream = value.byteInputStream()
        val outputStream = ByteArrayOutputStream()

        fileService.copyTo(inputStream, outputStream).toString()
        assertEquals(
            actual = outputStream.toString(),
            expected = value
        )
    }

    companion object {
        @JvmStatic
        fun deleteUserFilesParamsProvider(): List<Arguments> {
            return listOf<Arguments>(
                Arguments.of(true),
                Arguments.of(false)
            )
        }

        @JvmStatic
        fun getUserFileParamsProvider(): List<Arguments> {
            val randomUser = UserRecord()
            randomUser.id = Misc.uuidToBin(UUID.randomUUID())
            val file = FileRecord()
            file.user = Misc.uuidToBin(UUID.randomUUID())
            file.location = "location"
            file.title = "title"
            val fileUser = UserRecord()
            fileUser.id = file.user
            return listOf<Arguments>(
                Arguments.of(null, randomUser, true),
                Arguments.of(file, randomUser, true),
                Arguments.of(file, fileUser, false)
            )
        }

        @JvmStatic
        fun getUserReceivedFileParamsProvider(): List<Arguments> {
            val randomUser = UserRecord()
            randomUser.id = Misc.uuidToBin(UUID.randomUUID())
            val sharedAccess = SharedAccessRecord()
            sharedAccess.fileId = Misc.uuidToBin(UUID.randomUUID())
            sharedAccess.recipientId = Misc.uuidToBin(UUID.randomUUID())
            val sharedAccessUser = UserRecord()
            sharedAccessUser.id = sharedAccess.recipientId
            val file = FileRecord()
            file.location = "location"
            file.title = "title"
            return listOf<Arguments>(
                Arguments.of(null, randomUser, null, true),
                Arguments.of(sharedAccess, randomUser, null, true),
                Arguments.of(sharedAccess, sharedAccessUser, null, true),
                Arguments.of(sharedAccess, sharedAccessUser, file, false)
            )
        }

        @JvmStatic
        fun getDynamicLinkFileParamsProvider(): List<Arguments> {
            val fileWithDynLink = mockk<FileRecord>(relaxed = true)
            fileWithDynLink.link = "link"
            return listOf<Arguments>(
                Arguments.of(null, true),
                Arguments.of(FileRecord(), true),
                Arguments.of(fileWithDynLink, false)
            )
        }

        @JvmStatic
        fun getUserFilesMetadataWithOffsetAndLimitParamsProvider(): List<Arguments> {
            return listOf<Arguments>(
                Arguments.of(null, 100, true),
                Arguments.of(
                    listOf(
                        FileRecord(
                            id = Misc.uuidToBin(UUID.randomUUID()),
                            title = "test",
                            size = 205L,
                            link = UUID.randomUUID().toString()
                        )
                    ),
                    15,
                    false
                )
            )
        }
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

        assertTrue(
            actual = matches
        )
    }


    @ParameterizedTest
    @MethodSource("getUserFileParamsProvider")
    fun `it must get user file`(fileRecord: FileRecord?, userRecord: UserRecord, shouldFail: Boolean) {
        every { fileRepository.fetch(any()) } returns fileRecord
        if (shouldFail) assertFailsWith<Exception> {
            fileService.getUserFile(UUID.randomUUID().toString(), userRecord)
        } else {
            val gottenFile = fileService.getUserFile(UUID.randomUUID().toString(), userRecord)
            assert(
                gottenFile.path.contains(fileRecord!!.location!!) &&
                        gottenFile.path.contains(fileRecord.title!!)
            )
        }
    }

    @ParameterizedTest
    @MethodSource("getUserReceivedFileParamsProvider")
    fun `it must get user received file`(
        sharedAccessRecord: SharedAccessRecord?, userRecord: UserRecord,
        fileRecord: FileRecord?, shouldFail: Boolean
    ) {
        every { sharedAccessRepository.fetch(any()) } returns sharedAccessRecord
        every { fileRepository.fetch(any()) } returns fileRecord
        fun test() = fileService.getUserReceivedFile(UUID.randomUUID().toString(), userRecord)
        if (shouldFail) assertFailsWith<Exception> {
            test()
        } else {
            val gottenFile = test()
            assert(
                gottenFile.path.contains(fileRecord!!.location!!) &&
                        gottenFile.path.contains(fileRecord.title!!)
            )
        }
    }

    @ParameterizedTest
    @MethodSource("getDynamicLinkFileParamsProvider")
    fun `it must get dynamic link file`(
        fileRecord: FileRecord?, shouldFail: Boolean
    ) {
        every { fileRepository.fetchWithDynlink(any()) } returns fileRecord
        fun test() = fileService.getDynamicLinkFile(UUID.randomUUID().toString())
        if (shouldFail) assertFailsWith<Exception> {
            test()
        } else {
            val gottenFile = test()
            assert(
                gottenFile.path.contains(fileRecord!!.location!!) &&
                        gottenFile.path.contains(fileRecord.title!!)
            )
        }
    }

    @ParameterizedTest
    @MethodSource("getUserFilesMetadataWithOffsetAndLimitParamsProvider")
    fun `it must get user files metadata with offset and limit`(
        fileRecordList: List<FileRecord>?, limit: Int, shouldFail: Boolean
    ) {
        fileRecordList?.let {
            every {
                fileRepository.fetchUserFilesWithOffsetAndLimit(any(), any(), any())
            } returns it
        }
        fun test() = fileService.getUserFilesMetadata(mockk(relaxed = true), 0, limit)
        if (shouldFail) assertFailsWith<Exception> {
            test()
        } else {
            val gottenMetadata = test()
            for (i in gottenMetadata.indices) {
                fileRecordList!!
                assert(
                    gottenMetadata[i].title == fileRecordList[i].title!! &&
                            gottenMetadata[i].size == fileRecordList[i].size!! &&
                            gottenMetadata[i].link == fileRecordList[i].link!!
                )
            }
        }
    }

    @Test
    fun `it must get user files metadata with title like`() {
        val fileRecordList = listOf(
            FileRecord(
                id = Misc.uuidToBin(UUID.randomUUID()),
                title = "test",
            )
        )
        every { fileRepository.fetchUserFilesWithTitleLike(any(), any()) } returns fileRecordList
        val gottenMetadata = fileService.getUserFilesMetadata(mockk(relaxed = true), "test")
        for (i in gottenMetadata.indices) {
            assertEquals(
                actual = gottenMetadata[i].title,
                expected = fileRecordList[i].title!!
            )
        }
    }

    @Test
    fun `it must get user files metadata info`() {
        val userFileSizeSum = 145L
        val userRecord = mockk<UserRecord>(relaxed = true)
        userRecord.storageSize = 2000L
        every { fileRepository.userFileSizeSum(any()) } returns userFileSizeSum
        every { fileRepository.fetchUserFilesCount(any()) } returns null
        assertEquals(
            actual = fileService.getUserFilesMetadataInfo(userRecord),
            expected = FileMetadataInfo(
                storageData = StorageData(
                    totalSize = userRecord.storageSize!!,
                    usedSize = userFileSizeSum
                ),
                fileCount = 0
            )
        )
    }

//    @Test
//    fun getUserReceivedFilesMetadata() {
//        fail("Not yet implemented")
//    }
//
//    @Test
//    fun getUserReceivedFilesMetadataCount() {
//        fail("Not yet implemented")
//    }
//
//    @Test
//    fun getDynamicLinkFileTitleLink() {
//        fail("Not yet implemented")
//    }
//
//    @Test
//    fun updateUserFile() {
//        fail("Not yet implemented")
//    }
//
//    @Test
//    fun modifyUserFileSharing() {
//        fail("Not yet implemented")
//    }
//
//    @Test
//    fun deleteFile() {
//        fail("Not yet implemented")
//    }
}