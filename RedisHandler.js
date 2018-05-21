var redis = require("ioredis");
var Config = require('config');
var logger = require('dvp-common/LogHandler/CommonLogHandler.js').logger;


var redisip = Config.Redis.ip;
var redisport = Config.Redis.port;
var redispass = Config.Redis.password;
var redismode = Config.Redis.mode;
var redisdb = Config.Redis.db;



var redisSetting =  {
    port:redisport,
    host:redisip,
    family: 4,
    password: redispass,
    db: redisdb,
    retryStrategy: function (times) {
        var delay = Math.min(times * 50, 2000);
        return delay;
    },
    reconnectOnError: function (err) {

        return true;
    }
};

if(redismode == 'sentinel'){

    if(Config.Redis.sentinels && Config.Redis.sentinels.hosts && Config.Redis.sentinels.port && Config.Redis.sentinels.name){
        var sentinelHosts = Config.Redis.sentinels.hosts.split(',');
        if(Array.isArray(sentinelHosts) && sentinelHosts.length > 2){
            var sentinelConnections = [];

            sentinelHosts.forEach(function(item){

                sentinelConnections.push({host: item, port:Config.Redis.sentinels.port})

            })

            redisSetting = {
                sentinels:sentinelConnections,
                name: Config.Redis.sentinels.name,
                password: redispass
            }

        }else{

            console.log("No enough sentinel servers found .........");
        }

    }
}

var client = undefined;

if(redismode != "cluster") {
    client = new redis(redisSetting);
}else{

    var redisHosts = redisip.split(",");
    if(Array.isArray(redisHosts)){


        redisSetting = [];
        redisHosts.forEach(function(item){
            redisSetting.push({
                host: item,
                port: redisport,
                family: 4,
                password: redispass});
        });

        var client = new redis.Cluster([redisSetting]);

    }else{

        client = new redis(redisSetting);
    }


}

var SetObject = function(key, value)
{
    try
    {
        client.set(key, value, function(err, response)
        {
            if(err)
            {
                logger.error('[DVP-CDRProcessor.SetObject] - REDIS ERROR', err)
            }
        });

    }
    catch(ex)
    {
        logger.error('[DVP-CDRProcessor.SetObject] - REDIS ERROR', ex)
    }

};

var SetObjectWithExpire = function(key, value, timeout)
{
    try
    {
        client.set(key, value, function(err, response)
        {
            if(err)
            {
                logger.error('[DVP-CDRProcessor.SetObjectWithExpire] - REDIS ERROR', err)
            }
            else
            {
                client.expire(key, timeout, function(err, reply)
                {
                    if (err)
                    {
                        logger.error('[DVP-CDRProcessor.ExpireKey] - [%s] - REDIS ERROR', err);
                    }
                });
            }
        });

    }
    catch(ex)
    {
        logger.error('[DVP-CDRProcessor.SetObjectWithExpire] - REDIS ERROR', ex)
    }

};

var AddSetWithExpire = function(setId, item, timeout)
{
    try
    {
        client.sadd(setId, item, function (err, reply)
        {
            client.expire(setId, timeout, function(err, reply)
            {
                if (err)
                {
                    logger.error('[DVP-CDRProcessor.ExpireKey] - [%s] - REDIS ERROR', err);
                }
            });
        });

    }
    catch(ex)
    {
        logger.error('[DVP-CDRProcessor.SetObjectWithExpire] - REDIS ERROR', ex)
    }

};

var GetSetMembers = function(setId, callback)
{
    try
    {
        client.smembers(setId, function (err, items)
        {
            callback(err, items);
        });

    }
    catch(ex)
    {
        logger.error('[DVP-CDRProcessor.GetSetMembers] - REDIS ERROR', ex);
        var emptyArr = [];
        callback(ex, emptyArr);
    }

};

var GetSetObject = function(key, value, callback)
{
    try
    {
        client.getset(key, value, function(err, response)
        {
            if(err)
            {
                logger.error('[DVP-CDRProcessor.SetObject] - REDIS ERROR', err)
            }
            callback(err, response);
        });

    }
    catch(ex)
    {
        logger.error('[DVP-CDRProcessor.SetObject] - REDIS ERROR', ex)
        callback(ex, null);
    }

};

var GetObject = function(key, callback)
{
    try
    {
        client.get(key, function(err, response)
        {
            if(err)
            {
                logger.error('[DVP-CDRProcessor.GetObject] - REDIS ERROR', err)
            }
            callback(err, response);
        });

    }
    catch(ex)
    {
        logger.error('[DVP-CDRProcessor.GetObject] - REDIS ERROR', ex)
        callback(ex, null);
    }

};

var DeleteObject = function(key)
{
    try
    {
        client.del(key, function(err, response)
        {
            if(err)
            {
                logger.error('[DVP-CDRProcessor.DeleteObject] - REDIS ERROR', err)
            }
        });

    }
    catch(ex)
    {
        logger.error('[DVP-CDRProcessor.DeleteObject] - REDIS ERROR', ex)
    }

};


client.on('error', function(msg)
{

});

module.exports.SetObject = SetObject;
module.exports.DeleteObject = DeleteObject;
module.exports.GetSetObject = GetSetObject;
module.exports.SetObjectWithExpire = SetObjectWithExpire;
module.exports.AddSetWithExpire = AddSetWithExpire;
module.exports.GetObject = GetObject;
module.exports.GetSetMembers = GetSetMembers;
