/**
 * Created by dinusha on 11/23/2016.
 */

var format = require("stringformat");
var config = require("config");
var amqp = require("amqp");
var logger = require("dvp-common-lite/LogHandler/CommonLogHandler.js").logger;

if (config.RabbitMQ.ip) {
  config.RabbitMQ.ip = config.RabbitMQ.ip.split(",");
}

var queueConnection = amqp.createConnection(
  {
    //url: queueHost,
    host: config.RabbitMQ.ip,
    port: config.RabbitMQ.port,
    login: config.RabbitMQ.user,
    password: config.RabbitMQ.password,
    vhost: config.RabbitMQ.vhost,
    noDelay: true,
    heartbeat: 10
  },
  {
    reconnect: true,
    reconnectBackoffStrategy: "linear",
    reconnectExponentialLimit: 120000,
    reconnectBackoffTime: 1000
  }
);

queueConnection.on("ready", function() {
  logger.info("Conection with the queue is OK");
});

queueConnection.on("error", function(error) {
  logger.info("There is an error" + error);
});

queueConnection.on("heartbeat", function() {
  logger.debug("RabbitMQ HeartBeat");
});

module.exports.PublishToQueue = function(messageType, sendObj) {
  logger.info("Email Send : " + JSON.stringify(sendObj));

  try {
    if (sendObj) {
      queueConnection.publish(messageType, sendObj, {
        contentType: "application/json"
      });
    }
  } catch (exp) {
    console.log(exp);
  }
};
