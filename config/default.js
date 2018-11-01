module.exports = {

    "DB": {
        "Type":"postgres",
        "User":"",
        "Password":"",
        "Port":5432,
        "Host":"",
        "Database":""
    },

    "Redis":
        {
            "mode":"sentinel",//instance, cluster, sentinel
            "ip": "",
            "port": 6389,
            "user": "",
            "password": "",
            "sentinels":{
                "hosts": "",
                "port":16389,
                "name":"redis-cluster"
            }

        },

    "Security":
        {

            "ip" : "",
            "port": 6389,
            "user": "",
            "password": "",
            "mode":"sentinel",//instance, cluster, sentinel
            "sentinels":{
                "hosts": "",
                "port":16389,
                "name":"redis-cluster"
            }
        },

    "RabbitMQ":
        {
            "ip": "",
            "port": 5672,
            "user": "",
            "password": "",
            "vhost":'/'
        },

    "Mongo":
        {
            "ip":"",
            "port":"27017",
            "dbname":"",
            "password":"",
            "user":"",
            "replicaset" :""
        },

    "Services":
        {

            "fileServiceHost": "",
            "fileServicePort": 5649,
            "fileServiceVersion":"1.0.0.0"

        },

    "Host":{
        "Ip":"0.0.0.0",
        "Port":9093,
        "Version":"1.0.0.0"
    },
    "AbandonCallThreshold": 5,
    "SaveRawCDRMongo": "true",
    "Token":""
};