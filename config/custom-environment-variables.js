/**
 * Created by dinusha on 4/22/2015.
 */

module.exports = {
  DB: {
    Type: "SYS_DATABASE_TYPE",
    User: "SYS_DATABASE_POSTGRES_USER",
    Password: "SYS_DATABASE_POSTGRES_PASSWORD",
    Port: "SYS_SQL_PORT",
    Host: "SYS_DATABASE_HOST",
    Database: "SYS_DATABASE_NAME",
  },

  Redis: {
    mode: "SYS_REDIS_MODE",
    ip: "SYS_REDIS_HOST",
    port: "SYS_REDIS_PORT",
    user: "SYS_REDIS_USER",
    password: "SYS_REDIS_PASSWORD",
    sentinels: {
      hosts: "SYS_REDIS_SENTINEL_HOSTS",
      port: "SYS_REDIS_SENTINEL_PORT",
      name: "SYS_REDIS_SENTINEL_NAME",
    },
  },

  Security: {
    ip: "SYS_REDIS_HOST",
    port: "SYS_REDIS_PORT",
    user: "SYS_REDIS_USER",
    password: "SYS_REDIS_PASSWORD",
    mode: "SYS_REDIS_MODE",
    sentinels: {
      hosts: "SYS_REDIS_SENTINEL_HOSTS",
      port: "SYS_REDIS_SENTINEL_PORT",
      name: "SYS_REDIS_SENTINEL_NAME",
    },
  },

  Services: {
    fileServiceHost: "SYS_FILESERVICE_HOST",
    fileServicePort: "SYS_FILESERVICE_PORT",
    fileServiceVersion: "SYS_FILESERVICE_VERSION",

    interactionurl: "SYS_INTERACTIONS_HOST",
    interactionport: "SYS_INTERACTIONS_PORT",
    interactionversion:"SYS_INTERACTIONS_VERSION",


    cronurl: "SYS_SCHEDULEWORKER_HOST",
    cronport: "SYS_SCHEDULEWORKER_PORT",
    cronversion:"SYS_SCHEDULEWORKER_VERSION",


    ticketServiceHost: "SYS_LITETICKET_HOST",
    ticketServicePort:  "SYS_LITETICKET_PORT",
    ticketServiceVersion:  "SYS_LITETICKET_VERSION"
  },

  Mongo: {
    ip: "SYS_MONGO_HOST",
    port: "SYS_MONGO_PORT",
    dbname: "SYS_MONGO_DB",
    password: "SYS_MONGO_PASSWORD",
    user: "SYS_MONGO_USER",
    replicaset: "SYS_MONGO_REPLICASETNAME",
    type: "SYS_MONGO_TYPE",
  },

  RabbitMQ: {
    ip: "SYS_RABBITMQ_HOST",
    port: "SYS_RABBITMQ_PORT",
    user: "SYS_RABBITMQ_USER",
    password: "SYS_RABBITMQ_PASSWORD",
    vhost: "SYS_RABBITMQ_VHOST",
  },

  Host: {
    Port: "HOST_CDRPROCESSOR_PORT",
    Version: "HOST_VERSION",
    emailQueueName:"SYS_EMAIL_QUEUE_NAME",
    smsQueueName: "SYS_SMS_QUEUE_NAME",
    defaultMailHost: "SYS_DEFAULT_MAIL_HOST",
  },

  Token: "HOST_TOKEN",
  SaveRawCDRMongo: "HOST_SAVE_CDR_MONGO",
};
