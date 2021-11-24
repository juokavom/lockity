package lockity.services

import database.schema.tables.records.FileRecord
import database.schema.tables.records.SharedAccessRecord
import database.schema.tables.records.UserRecord
import io.ktor.features.*
import io.ktor.http.*
import io.ktor.http.content.*
import io.ktor.utils.io.streams.*
import io.mockk.*
import lockity.models.*
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

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
internal class FileServiceTest {
    private lateinit var fileRepository: FileRepository
    private lateinit var sharedAccessRepository: SharedAccessRepository
    private lateinit var fileService: FileService

    @BeforeEach
    fun setUp() {
        fileRepository = mockk(relaxed = true)
        sharedAccessRepository = mockk(relaxed = true)
        fileService = spyk(
            FileService(
                mockk(relaxed = true),
                fileRepository,
                sharedAccessRepository
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

        @JvmStatic
        fun getUserReceivedFilesMetadataWithOffsetAndLimitParamsProvider(): List<Arguments> {
            return listOf<Arguments>(
                Arguments.of(null, 100, true),
                Arguments.of(
                    listOf(
                        ReceivedFileMetadata(
                            id = UUID.randomUUID().toString(),
                            title = "test",
                            size = 205L,
                            ownerEmail = UUID.randomUUID().toString()
                        )
                    ),
                    15,
                    false
                )
            )
        }

        @JvmStatic
        fun updateUserFileParamsProvider(): List<Arguments> {
            val editedEmptyFile = EditableFile(
                title = ""
            )
            val editedFile = EditableFile(
                title = "test"
            )
            val fileRecordRandom = FileRecord(
                id = Misc.uuidToBin(UUID.randomUUID()),
                user = Misc.uuidToBin(UUID.randomUUID())
            )
            val userRecord = UserRecord(
                id = Misc.uuidToBin(UUID.randomUUID())
            )
            val fileRecordUser = FileRecord(
                id = Misc.uuidToBin(UUID.randomUUID()),
                location = "testLocation",
                title = "oldTitle",
                user = userRecord.id
            )
            return listOf<Arguments>(
                Arguments.of(null, editedEmptyFile, userRecord, true),
                Arguments.of(fileRecordRandom, editedEmptyFile, userRecord, true),
                Arguments.of(fileRecordUser, editedEmptyFile, userRecord, true),
                Arguments.of(fileRecordUser, editedFile, userRecord, false)
            )
        }

        @JvmStatic
        fun modifyUserFileSharingParamsProvider(): List<Arguments> {
            val fileRecordRandom = FileRecord(
                id = Misc.uuidToBin(UUID.randomUUID()),
                user = Misc.uuidToBin(UUID.randomUUID())
            )
            val userRecord = UserRecord(
                id = Misc.uuidToBin(UUID.randomUUID())
            )
            val fileRecordWithLink = FileRecord(
                id = Misc.uuidToBin(UUID.randomUUID()),
                link = UUID.randomUUID().toString(),
                user = userRecord.id
            )
            val fileRecordWithoutLink = FileRecord(
                id = Misc.uuidToBin(UUID.randomUUID()),
                user = userRecord.id
            )
            return listOf<Arguments>(
                Arguments.of(null, userRecord, true, true),
                Arguments.of(fileRecordRandom, userRecord, true, true),
                Arguments.of(fileRecordWithLink.copy(), userRecord, true, true),
                Arguments.of(fileRecordWithoutLink.copy(), userRecord, true, false),
                Arguments.of(fileRecordWithLink.copy(), userRecord, false, false),
                Arguments.of(fileRecordWithoutLink.copy(), userRecord, false, true)
            )
        }

        @JvmStatic
        fun deleteFileParamsProvider(): List<Arguments> {
            val fileRecordRandom = FileRecord(
                id = Misc.uuidToBin(UUID.randomUUID()),
                user = Misc.uuidToBin(UUID.randomUUID())
            )
            val userRecord = UserRecord(
                id = Misc.uuidToBin(UUID.randomUUID())
            )
            val userFileRecord = FileRecord(
                id = Misc.uuidToBin(UUID.randomUUID()),
                user = userRecord.id
            )
            return listOf<Arguments>(
                Arguments.of(null, userRecord, false, true),
                Arguments.of(fileRecordRandom, userRecord, false, true),
                Arguments.of(userFileRecord, userRecord, false, true),
                Arguments.of(userFileRecord, userRecord, true, false)
            )
        }
    }

    @Test
    fun `it must format uploads location`() {
        val fileName = "test"
        assert(
            fileService.uploadsLocation(fileName).contains(fileName)
        )
    }

    @ParameterizedTest
    @MethodSource("deleteUserFilesParamsProvider")
    fun `it must successfully delete user files`(success: Boolean) {
        val emptyByteArray = "test".toByteArray()
        every { fileRepository.fetchUserFiles(any()) } returns listOf(
            FileRecord(id = emptyByteArray),
            FileRecord(id = emptyByteArray)
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
            actual = fileService.deletePhysicalFile(UUID.randomUUID().toString().toByteArray())
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
        userRecord.id = Misc.uuidToBin(UUID.randomUUID())
        userRecord.storageSize = 100L
        every { fileRepository.userFileSizeSum(any()) } returns 10L
        every { fileService.uploadFile(any(), any()) } returns FileRecord()
        fileService.uploadUserFile(userRecord, mockk(), 10L)
        verify { fileRepository.insert(any()) }
    }

    @Test
    fun `it must not let upload user file if user storage space is exceeded`() {
        val userRecord = UserRecord()
        userRecord.id = Misc.uuidToBin(UUID.randomUUID())
        userRecord.storageSize = 10L
        every { fileRepository.userFileSizeSum(any()) } returns 10L
        every { fileService.uploadFile(any(), any()) } returns FileRecord()
        assertFailsWith<NoPermissionException> {
            fileService.uploadUserFile(userRecord, mockk(), 10L)
        }
    }

    @Test
    fun `it must upload file`() {
        val fileDir = "test"
        val fileName = "testFile.mp4"
        val fileSize = 200L
        every { fileService.uploadsLocation(any()) } returns fileDir
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

        File(fileDir).deleteRecursively()

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
        val userRecord = UserRecord()
        userRecord.id = Misc.uuidToBin(UUID.randomUUID())
        fun test() = fileService.getUserFilesMetadata(userRecord, 0, limit)
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
        userRecord.id = Misc.uuidToBin(UUID.randomUUID())
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

    @ParameterizedTest
    @MethodSource("getUserReceivedFilesMetadataWithOffsetAndLimitParamsProvider")
    fun `it must get user received files metadata with offset and limit`(
        receivedRecordList: List<ReceivedFileMetadata>?, limit: Int, shouldFail: Boolean
    ) {
        receivedRecordList?.let {
            every {
                sharedAccessRepository.fetchRecipientFilesWithOffsetAndLimit(any(), any(), any())
            } returns it
        }
        fun test() = fileService.getUserReceivedFilesMetadata(mockk(relaxed = true), 0, limit)
        if (shouldFail) assertFailsWith<Exception> {
            test()
        } else {
            val gottenMetadata = test()
            for (i in gottenMetadata.indices) {
                receivedRecordList!!
                assert(
                    gottenMetadata[i].title == receivedRecordList[i].title &&
                            gottenMetadata[i].size == receivedRecordList[i].size &&
                            gottenMetadata[i].ownerEmail == receivedRecordList[i].ownerEmail
                )
            }
        }
    }


    @Test
    fun `it must get user received files metadata count`() {
        val count = 77
        every {
            sharedAccessRepository.fetchRecipientSharedAccessCount(any())
        } returns count
        assertEquals(
            actual = fileService.getUserReceivedFilesMetadataCount(mockk(relaxed = true)),
            expected = ReceivedFileMetadataCount(
                receivedCount = count
            )
        )
    }

    @ParameterizedTest
    @MethodSource("getDynamicLinkFileParamsProvider")
    fun `it must get dynamic link file title and link`(
        fileRecord: FileRecord?, shouldFail: Boolean
    ) {
        every { fileRepository.fetchWithDynlink(any()) } returns fileRecord
        fun test() = fileService.getDynamicLinkFileTitleLink(UUID.randomUUID().toString())
        if (shouldFail) assertFailsWith<Exception> {
            test()
        } else {
            assertEquals(
                actual = test(),
                expected = FileTitleLink(
                    title = fileRecord!!.title!!,
                    link = fileRecord.link!!
                )
            )
        }
    }

    @ParameterizedTest
    @MethodSource("updateUserFileParamsProvider")
    fun `it must update user file`(
        fileRecord: FileRecord?, editedFile: EditableFile,
        userRecord: UserRecord, shouldFail: Boolean
    ) {
        every { fileRepository.fetch(any()) } returns fileRecord
        fun test() = fileService.updateUserFile(
            userRecord,
            UUID.randomUUID().toString(),
            editedFile
        )
        if (shouldFail) assertFailsWith<Exception> {
            test()
        } else {
            fileRecord!!.location = fileService.uploadsLocation(fileRecord.location!!)
            val dir = File(fileRecord.location!!)
            dir.mkdir()
            File(fileRecord.location, fileRecord.title!!).createNewFile()
            test()
            verify { fileRepository.update(any()) }
            dir.deleteRecursively()
        }
    }

    @ParameterizedTest
    @MethodSource("modifyUserFileSharingParamsProvider")
    fun `it must modify user file sharing`(
        fileRecord: FileRecord?, userRecord: UserRecord,
        shareCondition: Boolean, shouldFail: Boolean
    ) {
        every { fileRepository.fetch(any()) } returns fileRecord
        fun test() = fileService.modifyUserFileSharing(
            userRecord,
            UUID.randomUUID().toString(),
            shareCondition
        )
        if (shouldFail) assertFailsWith<Exception> {
            test()
        } else {
            test()
            verify { fileRepository.update(any()) }
        }
    }

    @ParameterizedTest
    @MethodSource("deleteFileParamsProvider")
    fun `it must delete file`(
        fileRecord: FileRecord?, userRecord: UserRecord,
        physicalDeletionStatus: Boolean, shouldFail: Boolean
    ) {
        every { fileRepository.fetch(any()) } returns fileRecord
        every {
            fileService.deletePhysicalFile(any())
        } returns physicalDeletionStatus
        fun test() = fileService.deleteFile(
            userRecord,
            UUID.randomUUID().toString()
        )
        if (shouldFail) assertFailsWith<Exception> {
            test()
        } else {
            test()
            verify { fileRepository.delete(any()) }
        }
    }
}