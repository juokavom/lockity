package lockity.services

import database.schema.tables.records.APIRecord
import database.schema.tables.records.UserRecord
import io.ktor.features.*
import lockity.models.*
import lockity.repositories.APIRepository
import lockity.utils.Misc
import java.time.LocalDateTime
import java.util.*
import javax.naming.NoPermissionException
import javax.security.auth.login.AccountLockedException

class APIService(
    private val apiRepository: APIRepository,
) {
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
}