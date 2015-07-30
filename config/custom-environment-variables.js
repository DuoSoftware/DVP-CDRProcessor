/**
 * Created by dinusha on 4/22/2015.
 */

module.exports = {

    "DB": {
        "Type":"SYS_DATABASE_TYPE",
        "User":"SYS_DATABASE_POSTGRES_USER",
        "Password":"SYS_DATABASE_POSTGRES_PASSWORD",
        "Port":"SYS_SQL_PORT",
        "Host":"SYS_DATABASE_HOST",
        "Database":"SYS_DATABASE_POSTGRES_USER"
    },

    "Redis":
    {
        "IpAddress": "SYS_REDIS_HOST",
        "Port": "SYS_REDIS_PORT"

    },

    "Host":{
        "Port":"HOST_CDRPROCESSOR_PORT",
        "Version":"HOST_VERSION"
    }
};