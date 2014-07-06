var AWS = require('aws-sdk'),
    nodefn = require('when/node');

function Storage() {}

var TABLE_NAME = 'scores';

function createTable(db) {
  var params = {
    TableName: TABLE_NAME,
    AttributeDefinitions: [
      {
        AttributeName: 'id',
        AttributeType: 'N'
      }
    ],
    KeySchema: [
      {
        AttributeName: 'id',
        KeyType: 'HASH'
      }
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 1,
      WriteCapacityUnits: 1
    }
  };
  return nodefn.call(db.createTable.bind(db), params).then(function() {
    return nodefn.call(db.waitFor.bind(db), 'tableExists', {TableName: TABLE_NAME});
  });
}

Storage.prototype.setup = function() {
  AWS.config.loadFromPath('./aws.json');
  var db = new AWS.DynamoDB();
  this.dynamodb = db;
  return nodefn.call(db.listTables.bind(db)).then(function(data) {
    if (data.TableNames.indexOf(TABLE_NAME) === -1) {
      return createTable(db);
    }
  });
}

Storage.prototype.populate = function(score) {
  var params = {
    TableName: TABLE_NAME,
    Item: {
      id: {
        N: '1'
      },
      score: {
        N: String(score)
      }
    }
  };
  return nodefn.call(this.dynamodb.putItem.bind(this.dynamodb), params);
}

Storage.prototype.score = function() {
  var params = {
    ConsistentRead: true,
    TableName: TABLE_NAME,
    Key: {
      id: {
        N: '1'
      }
    }
  };
  return nodefn.call(this.dynamodb.getItem.bind(this.dynamodb), params).then(function(data) {
    return Number(data.Item.score.N);
  });
}

module.exports = Storage;
