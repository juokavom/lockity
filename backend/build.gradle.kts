repositories {
    mavenCentral()
}

val detekt by configurations.creating

val detektTask = tasks.register<JavaExec>("deteKtScan") {
    group = "Static analysis"
    main = "io.gitlab.arturbosch.detekt.cli.Main"
    classpath = detekt

    val input = "$projectDir/backend/src/main/kotlin/lockity"
    val config = "$projectDir/conf/detekt.yml"
    val exclude = ".*/build/.*,.*/resources/.*"
    val params = listOf("-i", input, "-c", config, "-ex", exclude)

    args(params)
}

val detektTaskCustomRule = tasks.register<JavaExec>("deteKtScanCustomRule") {
    group = "Static analysis"
    main = "io.gitlab.arturbosch.detekt.cli.Main"
    classpath = detekt

    dependsOn(":detekt-custom-rule:assemble")

    val input = "$projectDir/backend/src/main/kotlin/lockity"
    val config = "$projectDir/conf/detektOnlyMyRule.yml"
    val exclude = ".*/build/.*,.*/resources/.*"
    val myRuleCompiledJar = "$projectDir/detekt-custom-rule/build/libs/detekt-custom-rule.jar"
    val params = listOf("-i", input, "-c", config, "-ex", exclude, "--plugins", myRuleCompiledJar)

    args(params)
}

dependencies {
    detekt("io.gitlab.arturbosch.detekt:detekt-cli:1.19.0")
}
