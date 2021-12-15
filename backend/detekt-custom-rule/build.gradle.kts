import org.jetbrains.kotlin.gradle.tasks.KotlinCompile

plugins {
    kotlin("jvm") version "1.5.30"
    `maven-publish`
}

repositories {
    mavenCentral()
}

dependencies {
    compileOnly("io.gitlab.arturbosch.detekt:detekt-api:1.19.0")
    implementation("org.junit.jupiter:junit-jupiter:5.7.0")

    testImplementation("io.gitlab.arturbosch.detekt:detekt-test:1.19.0")
    testImplementation("com.google.truth:truth:1.1.3")
    testImplementation("io.insert-koin:koin-test:3.1.2")
    testImplementation("io.mockk:mockk:1.12.0")
}

tasks.withType<KotlinCompile> {
    kotlinOptions.jvmTarget = "1.8"
}

tasks.withType<Test>().configureEach {
    val compileSnippetText: Boolean = if (project.hasProperty("compile-test-snippets")) {
        (project.property("compile-test-snippets") as String).toBoolean()
    } else {
        false
    }
    systemProperty("compile-snippet-tests", compileSnippetText)
}
