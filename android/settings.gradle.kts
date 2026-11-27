pluginManagement {
    repositories {
        google()
        // Google-hosted Maven Central mirror reduces failures from Maven Central rate limits.
        maven { url = uri("https://maven-central.storage-download.googleapis.com/maven2/") }
        mavenCentral()
        gradlePluginPortal()
    }
}

dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        // Use the mirror first, then the canonical repository as fallback.
        maven { url = uri("https://maven-central.storage-download.googleapis.com/maven2/") }
        mavenCentral()
    }
}

rootProject.name = "GLASYPAY"
include(":app")
