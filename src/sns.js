module.exports =
  function(sns, topicArn, bucket, key, result, details, callback) {
    sns.publish({
      TopicArn: topicArn,
      Message: JSON.stringify({
        Bucket: bucket,
        Key: key,
        Result: result,
        Details: details
      })
    }, function(err, data) {
      if (err) {
        console.log(err);
      }
      callback(err, data);
    });
  };
