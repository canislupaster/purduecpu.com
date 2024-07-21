plugins {
    kotlin("jvm") version "2.0.0"
    kotlin("plugin.serialization") version "1.9.22"
    application
}

group = "com.purduecpu"
version = "1.0-SNAPSHOT"

repositories {
    mavenCentral()
}

val exposedVersion = "0.52.0"

dependencies {
    implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.6.3")

    implementation("io.jooby:jooby:3.2.3")
    implementation("io.jooby:jooby-kotlin:3.2.3")
    implementation("io.jooby:jooby-netty:3.2.3")

    implementation("org.slf4j:slf4j-simple:2.0.12")
    implementation("org.slf4j:slf4j-api:2.0.12")

//    implementation("org.jetbrains.exposed:exposed-core:$exposedVersion")
//    implementation("org.jetbrains.exposed:exposed-jdbc:$exposedVersion")
//    implementation("org.jetbrains.exposed:exposed-json:$exposedVersion")
//    implementation("org.jetbrains.exposed:exposed-java-time:$exposedVersion")

//    implementation("io.ktor:ktor-client-core:2.3.9")
//    implementation("io.ktor:ktor-client-cio:2.3.9")
//    implementation("io.ktor:ktor-client-content-negotiation:2.3.9")
//    implementation("io.ktor:ktor-serialization-kotlinx-json:2.3.9")

//    implementation("org.zeromq:jeromq:0.6.0")
//    implementation("org.xerial:sqlite-jdbc:3.46.0.0")
}

kotlin {
    jvmToolchain(21)
}

application {
    mainClass="com.purduecpu.MainKt"
}

tasks.processResources {
    from("../dist") {
        into("client")
    }
}