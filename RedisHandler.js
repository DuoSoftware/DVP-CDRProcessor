var redis = require("redis");
var Config = require('config');
var logger = require('dvp-common/LogHandler/CommonLogHandler.js').logger;

var redisIp = Config.Redis.ip;
var redisPort = Config.Redis.port;
var redisPassword = Config.Redis.password;

var client = redis.createClient(redisPort, redisIp);

client.auth(redisPassword, function (redisResp) {
    console.log("Redis Auth Response : " + redisResp);
});


var SetObject = function(key, value, callback)
{
    try
    {
        client.set(key, value, function(err, response)
        {
            if(err)
            {
                logger.error('[DVP-DynamicConfigurationGenerator.SetObject] - REDIS ERROR', err)
            }
            callback(err, response);
        });

    }
    catch(ex)
    {
        callback(ex, undefined);
    }

};

var DeleteObject = function(key, callback)
{
    try
    {
        client.del(key, function(err, response)
        {
            if(err)
            {
                logger.error('[DVP-DynamicConfigurationGenerator.DeleteObject] - REDIS ERROR', err)
            }
            callback(err, response);
        });

    }
    catch(ex)
    {
        callback(ex, undefined);
    }

};


client.on('error', function(msg)
{

});

module.exports.SetObject = SetObject;
module.exports.DeleteObject = DeleteObject;