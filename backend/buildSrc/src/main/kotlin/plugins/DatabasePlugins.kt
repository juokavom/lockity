package plugins

import org.gradle.api.Plugin
import org.gradle.api.Project
import org.gradle.kotlin.dsl.apply
import org.gradle.kotlin.dsl.invoke
import org.flywaydb.gradle.FlywayPlugin
import org.flywaydb.gradle.task.FlywayCleanTask
import org.flywaydb.gradle.task.FlywayMigrateTask
import org.gradle.kotlin.dsl.register
import java.io.File
import java.time.Instant
import java.time.ZoneOffset
import java.time.format.DateTimeFormatter

class DatabasePlugins : Plugin<Project> {
    override fun apply(project: Project) = project.run {
        val databaseConfig = groovy.util.ConfigSlurper().parse(
            File("$rootDir/backend/src/main/resources/application.conf").toURI().toURL()
        )["database"] as groovy.util.ConfigObject
        val migrationPackage = "$rootDir/migrations"
        val migrations = listOf(
            "filesystem:$migrationPackage"
        )
        apply<FlywayPlugin>()
        gradle.projectsEvaluated {
            tasks {
                register<FlywayCleanTask>("DatabaseClean") {
                    setGroup("database")
                    applyConfig(databaseConfig, migrations)
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
//                        generateJooq()
                    }
                }
            }
        }
    }

    private fun migrationTime(): String = DateTimeFormatter.ofPattern("yyyyMMddHHmmss")
        .withZone(ZoneOffset.UTC)
        .format(Instant.now())


    private fun org.flywaydb.gradle.task.AbstractFlywayTask.applyConfig(
        databaseConfig: groovy.util.ConfigObject,
        locs: List<String>
    ) {
        url = databaseConfig["url"].toString()
        user = databaseConfig["user"].toString()
        password = databaseConfig["password"].toString()
        locations = locs.toTypedArray()
    }
}
