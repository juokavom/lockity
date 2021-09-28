import java.io.File
import java.time.Instant
import java.time.ZoneOffset
import java.time.format.DateTimeFormatter

val ktor_version: String by project
val kotlin_version: String by project
val logback_version: String by project

plugins {
    application
    kotlin("jvm") version "1.5.30"
    id("org.jetbrains.kotlin.plugin.serialization") version "1.5.30"
    id("com.github.johnrengelman.shadow") version "7.0.0"
    id("org.flywaydb.flyway") version "7.15.0"
}

dependencies {
    implementation("io.ktor:ktor-server-core:$ktor_version")
    implementation("io.ktor:ktor-serialization:$ktor_version")
    implementation("io.ktor:ktor-server-host-common:$ktor_version")
    implementation("io.ktor:ktor-auth:$ktor_version")
    implementation("io.ktor:ktor-locations:$ktor_version")
    implementation("io.ktor:ktor-client-core:$ktor_version")
    implementation("io.ktor:ktor-client-core-jvm:$ktor_version")
    implementation("io.ktor:ktor-client-apache:$ktor_version")
    implementation("io.ktor:ktor-auth-jwt:$ktor_version")
    implementation("io.ktor:ktor-server-netty:$ktor_version")
    implementation("ch.qos.logback:logback-classic:$logback_version")
    testImplementation("io.ktor:ktor-server-tests:$ktor_version")
    testImplementation("org.jetbrains.kotlin:kotlin-test:$kotlin_version")
    implementation("mysql:mysql-connector-java:8.0.21")
}


application {
    mainClass.set("com.akramas.lockity.ApplicationKt")
}

repositories {
    mavenCentral()
}

tasks {
    shadowJar {
        manifest {
            attributes(Pair("Main-Class", "com.akramas.lockity.ApplicationKt"))
        }
        archiveFileName.set("server.jar")
    }
    withType<org.jetbrains.kotlin.gradle.tasks.KotlinCompile>().all {
        kotlinOptions {
            jvmTarget = "11"
        }
    }
}

class DatabasePlugins : Plugin<Project> {
    override fun apply(project: Project) = project.run {
        val databaseConfig = groovy.util.ConfigSlurper().parse(
            File("$rootDir/src/main/resources/application.conf").toURI().toURL()
        )["database"] as groovy.util.ConfigObject
        val migrationPackage = "$rootDir/migrations"
        val migrations = listOf(
            "filesystem:$migrationPackage"
        )
        apply<org.flywaydb.gradle.FlywayPlugin>()
        gradle.projectsEvaluated {
            tasks {
                register<org.flywaydb.gradle.task.FlywayCleanTask>("DatabaseClean") {
                    setGroup("database")
                    applyConfig(databaseConfig, migrations)
                }
                register<org.flywaydb.gradle.task.FlywayMigrateTask>("DatabaseMigrate") {
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

apply<DatabasePlugins>()