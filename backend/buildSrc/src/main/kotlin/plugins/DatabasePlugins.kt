package plugins

import org.flywaydb.gradle.FlywayPlugin
import org.flywaydb.gradle.task.FlywayCleanTask
import org.flywaydb.gradle.task.FlywayMigrateTask
import org.gradle.api.Plugin
import org.gradle.api.Project
import org.gradle.kotlin.dsl.apply
import org.gradle.kotlin.dsl.invoke
import org.gradle.kotlin.dsl.register
import java.io.File
import java.time.Instant
import java.time.ZoneOffset
import java.time.format.DateTimeFormatter

class DatabasePlugins : Plugin<Project> {
    override fun apply(project: Project): Unit = project.run {
        val databaseConfig = DatabaseConfig(groovy.util.ConfigSlurper().parse(
            File("$rootDir/backend/src/main/resources/application.conf").toURI().toURL()
        )["database"] as groovy.util.ConfigObject)
        val migrationPackage = "$rootDir/migrations"
        val migrations = listOf(
            "filesystem:$migrationPackage"
        )
        val jooqDir = "$rootDir/backend/src/main/java"
        apply<FlywayPlugin>()
        gradle.projectsEvaluated {
            tasks {
                register<FlywayCleanTask>("DatabaseClean") {
                    setGroup("database")
                    applyConfig(databaseConfig, migrations)
                    doLast {
                        delete(jooqDir)
                    }
                }
                register<FlywayMigrateTask>("DatabaseMigrate") {
                    setGroup("database")
                    applyConfig(databaseConfig, migrations)
                }
                register("GenerateMigration") {
                    group = "database"
                    doLast {
                        val fileName = "V${migrationTime()}__migration.sql"
                        val file = File(migrationPackage, fileName)
                        if (!file.parentFile.exists()) file.parentFile.mkdirs()
                        file.writeText("")
                    }
                }
                register("GenerateJooq") {
                    group = "database"
                    dependsOn("DatabaseMigrate")

                    doLast {
                        generateJooq(jooqDir, databaseConfig)
                    }
                }
            }
        }
    }

    private fun migrationTime(): String = DateTimeFormatter.ofPattern("yyyyMMddHHmmss")
        .withZone(ZoneOffset.UTC)
        .format(Instant.now())


    private fun org.flywaydb.gradle.task.AbstractFlywayTask.applyConfig(
        databaseConfig: DatabaseConfig,
        locs: List<String>
    ) {
        url = databaseConfig.url
        user = databaseConfig.user
        password = databaseConfig.password
        locations = locs.toTypedArray()
    }

    data class DatabaseConfig(
        val url: String,
        val user: String,
        val password: String
    ) {
        constructor(serialized: groovy.util.ConfigObject) : this(
            url = serialized["url"].toString(),
            user = serialized["user"].toString(),
            password = serialized["password"].toString()
        )
    }
}
