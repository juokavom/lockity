package lockity.repositories

import com.mysql.cj.jdbc.MysqlDataSource
import com.typesafe.config.ConfigFactory
import io.ktor.config.*
import io.ktor.server.testing.*
import io.mockk.every
import io.mockk.mockk
import lockity.utils.CONFIG
import lockity.utils.DatabaseService
import org.jooq.SQLDialect
import org.jooq.impl.DSL
import org.junit.jupiter.api.Test

internal class UserRepositoryTest {
    private val databaseService = mockk<DatabaseService>(relaxed = true)
    private val roleRepository = RoleRepository(mockk(relaxed=true))

    private val testEnv = createTestEnvironment {
        config = HoconApplicationConfig(ConfigFactory.load("application.conf"))
    }

//    private fun testDsl(config: ApplicationConfig) = DSL.using(
//        MysqlDataSource().apply {
//            setURL(config.property(CONFIG.TEST_DATABASE_URL).getString())
//            user = config.property(CONFIG.TEST_DATABASE_USER).getString()
//            password = config.property(CONFIG.TEST_DATABASE_PASSWORD).getString()
//        }, SQLDialect.MARIADB
//    )

    @Test
    fun userExist() = withApplication(testEnv) {
    }

    @Test
    fun isEmailUnique() {
    }

    @Test
    fun isAnyoneElseEmailUnique() {
    }

    @Test
    fun insertUser() {
    }

    @Test
    fun delete() {
    }

    @Test
    fun updateUser() {
    }

    @Test
    fun fetch() {
    }

    @Test
    fun fetchWithEmailLike() {
    }

    @Test
    fun updateLastActive() {
    }

    @Test
    fun fetchLoginUserMap() {
    }

    @Test
    fun fetchUsersWithOffsetAndLimit() {
    }

    @Test
    fun fetchUsersCount() {
    }
}