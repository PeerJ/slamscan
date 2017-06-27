var AWS = require('aws-sdk');
var sns = new AWS.SNS();

module.exports =
  function(topicArn, message, callback) {
    sns
      .publish(
        {
          TopicArn: topicArn,
          Message: message
        },
        callback
      );
  };
