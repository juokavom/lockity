package lockity.utils

const val AUTHENTICATED = "Authenticated"

object ROLE {
    const val ADMIN = "Administrator"
    const val REGISTERED = "Registered"
    const val VIP = "Vip"
}

const val JWT_COOKIE_NAME = "jwt"

object CONFIG {
    const val ENV = "environment"

    const val JWT_SECRET = "jwt.secret"
    const val JWT_SESSION_TIME_MILLIS = "jwt.sessionTimeMillis"

    const val DATABASE_URL = "database.url"
    const val DATABASE_USER = "database.user"
    const val DATABASE_PASSWORD = "database.password"

    const val FILEPATH_STORAGE = "filePath.storage"
    const val FILEPATH_UPLOADS = "filePath.uploads"

    const val EMAIL_HOST = "email.host"
    const val EMAIL_PORT = "email.port"
    const val EMAIL_USER = "email.user"
    const val EMAIL_PASSWORD = "email.password"

    const val CORS_HOST = "cors.host"
    const val CORS_SCHEME = "cors.scheme"
    const val CORS_SUBDOMAIN = "cors.subDomain"

    const val LINK_EXPIRY_MINUTES = "link.expiryMinutes"

    const val CRON_INTERVAL_TIME_MINUTES = "cron.intervalTimeMinutes"
    const val CRON_ANONYMOUS_EXPIRY_DAYS = "cron.anonymousExpiryDays"
}

object USER {
    const val ID = "user.id"
    const val PASSWORD = "user.password"
    const val CONFIRMED = "user.confirmed"
}

const val DEFAULT_STORAGE_BYTES = 1_073_741_824L // 1GB
const val GUEST_MAX_STORAGE_BYTES = 1_073_741_824L // 1GB
const val MAX_STORAGE_BYTES = 16_106_127_360 // 15GB