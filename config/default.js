module.exports = {
  DB: {
    Type: "postgres",
    User: "duo",
    Password: "DuoS123",
    Port: 5432,
    Host: "104.236.231.11",
    Database: "duo",
  },

  Redis: {
    mode: "instance", //instance, cluster, sentinel
    ip: "",
    port: 6379,
    user: "",
    password: "",
    sentinels: {
      hosts: "",
      port: 16389,
      name: "redis-cluster",
    },
  },

  Security: {
    ip: "",
    port: 6379,
    user: "",
    password: "",
    mode: "instance", //instance, cluster, sentinel
    sentinels: {
      hosts: "",
      port: 16389,
      name: "redis-cluster",
    },
  },

  RabbitMQ: {
    ip: "45.55.142.207",
    port: 5672,
    user: "admin",
    password: "admin",
    vhost: "/",
  },

  Mongo: {
    ip: "",
    port: "",
    dbname: "",
    password: "",
    user: "",
    type: "mongodb",
  },

  Services: {
    fileServiceHost: "fileservice.app.veery.cloud",
    fileServicePort: 5649,
    fileServiceVersion: "1.0.0.0",
    dynamicPort: true,
  },

  Host: {
    Ip: "0.0.0.0",
    Port: 9093,
    Version: "1.0.0.0",
  },
  AbandonCallThreshold: 5,
  SaveRawCDRMongo: "true",
  Token:
    "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdWtpdGhhIiwianRpIjoiYWEzOGRmZWYtNDFhOC00MWUyLTgwMzktOTJjZTY0YjM4ZDFmIiwic3ViIjoiNTZhOWU3NTlmYjA3MTkwN2EwMDAwMDAxMjVkOWU4MGI1YzdjNGY5ODQ2NmY5MjExNzk2ZWJmNDMiLCJleHAiOjE5MDIzODExMTgsInRlbmFudCI6LTEsImNvbXBhbnkiOi0xLCJzY29wZSI6W3sicmVzb3VyY2UiOiJhbGwiLCJhY3Rpb25zIjoiYWxsIn1dLCJpYXQiOjE0NzAzODExMTh9.Gmlu00Uj66Fzts-w6qEwNUz46XYGzE8wHUhAJOFtiRo",
};
