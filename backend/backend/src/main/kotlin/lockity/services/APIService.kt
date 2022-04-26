package lockity.services

import database.schema.tables.records.APIRecord
import database.schema.tables.records.UserRecord
import io.ktor.features.*
import io.ktor.http.content.*
import lockity.models.*
import lockity.repositories.APIRepository
import lockity.repositories.UserRepository
import lockity.utils.Misc
import java.io.File
import java.time.LocalDateTime
import java.util.*
import javax.naming.NoPermissionException

class APIService(
    private val apiRepository: APIRepository,
    private val fileService: FileService,
    private val userRepository: UserRepository
) {
    fun validateToken(fetchedToken: APIRecord, permission: APIPermissions) {
        if (fetchedToken.validFrom!! > LocalDateTime.now() || fetchedToken.validTo!! < LocalDateTime.now()) {
            throw NoPermissionException("Token is not valid")
        }
        val isAuthorized = when (permission) {
            APIPermissions.CREATE -> fetchedToken.canCreate
            APIPermissions.READ -> fetchedToken.canRead
            APIPermissions.UPDATE -> fetchedToken.canUpdate
            APIPermissions.DELETE -> fetchedToken.canDelete
        } == "1".toByte()
        if (!isAuthorized) {
            throw  NoPermissionException("Token has no authorized ${permission.name} action")
        }
    }

    fun createToken(creatableToken: CreatableToken, user: UserRecord): String {
        creatableToken.isValuesValid()
        val apiRecord = APIRecord(
            id = Misc.uuidToBin(UUID.randomUUID()),
            title = creatableToken.title,
            token = UUID.randomUUID().toString().replace("-", ""),
            canRead = (if (creatableToken.permissions.contains(APIPermissions.READ.name)) "1" else "0").toByte(),
            canCreate = (if (creatableToken.permissions.contains(APIPermissions.CREATE.name)) "1" else "0").toByte(),
            canUpdate = (if (creatableToken.permissions.contains(APIPermissions.UPDATE.name)) "1" else "0").toByte(),
            canDelete = (if (creatableToken.permissions.contains(APIPermissions.DELETE.name)) "1" else "0").toByte(),
            validFrom = creatableToken.validFrom,
            validTo = creatableToken.validTo,
            created = LocalDateTime.now(),
            user = user.id
        )
        apiRepository.insertToken(apiRecord)
        return apiRecord.token!!
    }

    fun getTokens(user: UserRecord, offset: Int, limit: Int): List<TokenData> {
        if (limit > 20) throw BadRequestException("Maximum limit(20) is exceeded.")
        return apiRepository.fetchTokensWithOffsetAndLimit(
            userBinId = user.id!!,
            offset = offset,
            limit = limit
        )
    }

    fun getAPICount(userBinId: ByteArray) = APICount(
        apiCount = apiRepository.fetchAPICount(userBinId)
    )

    fun deleteAPI(user: UserRecord, apiId: String) {
        val apiRecord = apiRepository.fetch(UUID.fromString(apiId))
            ?: throw NotFoundException("API token was not found")
        if (!apiRecord.user.contentEquals(user.id))
            throw NoPermissionException("User do not have permission to delete this api metadata")
        apiRepository.delete(apiRecord.id!!)
    }

    fun getTokenFilesMetadata(sendableToken: SendableToken, offset: Int, limit: Int): List<FileMetadata> {
        val fetchedToken = apiRepository.fetchByToken(sendableToken.token)
            ?: throw NotFoundException("Token was not found")
        validateToken(fetchedToken, APIPermissions.READ)
        return fileService.getUserFilesMetadata(fetchedToken.user!!, offset, limit)
    }

    fun getTokenFilesMetadataInfo(sendableToken: SendableToken): FileMetadataInfo {
        val fetchedToken = apiRepository.fetchByToken(sendableToken.token)
            ?: throw NotFoundException("Token was not found")
        validateToken(fetchedToken, APIPermissions.READ)
        val fetchedUser = userRepository.fetch(Misc.binToUuid(fetchedToken.user!!))
            ?: throw NotFoundException("User was not found")
        return fileService.getUserFilesMetadataInfo(fetchedUser)
    }

    fun getTokenFile(fileId: String, sendableToken: SendableToken): File {
        val fetchedToken = apiRepository.fetchByToken(sendableToken.token)
            ?: throw NotFoundException("Token was not found")
        validateToken(fetchedToken, APIPermissions.READ)
        return fileService.getUserFile(fileId, fetchedToken.user!!)
    }

    fun uploadTokenFile(token: String, part: PartData.FileItem, fileSize: Long) {
        val fetchedToken = apiRepository.fetchByToken(token)
            ?: throw NotFoundException("Token was not found")
        validateToken(fetchedToken, APIPermissions.CREATE)
        val fetchedUser = userRepository.fetch(Misc.binToUuid(fetchedToken.user!!))
            ?: throw NotFoundException("User was not found")
        fileService.uploadUserFile(fetchedUser, part, fileSize)
    }

    fun replaceTokenFile(fileId: String, token: String, part: PartData.FileItem, fileSize: Long) {
        val fetchedToken = apiRepository.fetchByToken(token)
            ?: throw NotFoundException("Token was not found")
        validateToken(fetchedToken, APIPermissions.UPDATE)
        val fetchedUser = userRepository.fetch(Misc.binToUuid(fetchedToken.user!!))
            ?: throw NotFoundException("User was not found")
        fileService.editUserFile(fileId, fetchedUser, part, fileSize)
    }

    fun deleteTokenFile(sendableToken: SendableToken, fileId: String) {
        val fetchedToken = apiRepository.fetchByToken(sendableToken.token)
            ?: throw NotFoundException("Token was not found")
        validateToken(fetchedToken, APIPermissions.DELETE)
        fileService.deleteFile(fetchedToken.user!!, fileId)
    }
}