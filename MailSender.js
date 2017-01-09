/**
 * Created by dinusha on 11/23/2016.
 */

var format = require('stringformat');
var config = require('config');
var amqp = require('amqp');
var logger = require('dvp-common/LogHandler/CommonLogHandler.js').logger;

var queueHost = format('amqp://{0}:{1}@{2}:{3}', config.RabbitMQ.user, config.RabbitMQ.password, config.RabbitMQ.ip, config.RabbitMQ.port);
var queueConnection = amqp.createConnection({
    url: queueHost
});

queueConnection.on('ready', function () {

    logger.info("Conection with the queue is OK");
});

queueConnection.on('error', function (error) {

    logger.info("There is an error" + error);
});

module.exports.PublishToQueue = function(messageType,sendObj ) {

    logger.info("Email Send : " + JSON.stringify(sendObj));

    try {
        if (sendObj) {
            queueConnection.publish(messageType, sendObj, {
                contentType: 'application/json'
            });
        }
    } catch (exp) {

        console.log(exp);
    }
}
