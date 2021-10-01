val ktor_version: String by project
val kotlin_version: String by project
val logback_version: String by project

plugins {
    application
    kotlin("jvm") version "1.5.30" apply true
    id("org.jetbrains.kotlin.plugin.serialization") version "1.5.30"
    id("db-plugins")
    id("com.github.johnrengelman.shadow") version "7.0.0"
}

dependencies {
    implementation(kotlin("stdlib"))
    implementation("io.ktor:ktor-server-core:$ktor_version")
    implementation("io.ktor:ktor-serialization:$ktor_version")
    implementation("io.ktor:ktor-server-netty:$ktor_version")
    implementation("io.ktor:ktor-locations:$ktor_version")
    implementation("ch.qos.logback:logback-classic:$logback_version")
    testImplementation("io.ktor:ktor-server-tests:$ktor_version")
    testImplementation("org.jetbrains.kotlin:kotlin-test:$kotlin_version")
    implementation("mysql:mysql-connector-java:8.0.22")
    implementation("org.jooq:jooq-codegen:3.14.3")
    implementation("io.github.classgraph:classgraph:4.8.87")
}

application {
    mainClass.set("lockity.ApplicationKt")
}

tasks {
    shadowJar {
        manifest {
            attributes(Pair("Main-Class", "lockity.ApplicationKt"))
        }
        archiveFileName.set("server.jar")
    }
    withType<org.jetbrains.kotlin.gradle.tasks.KotlinCompile>().all {
        kotlinOptions {
            jvmTarget = "1.8"
        }
    }
}

repositories {
    gradlePluginPortal()
}