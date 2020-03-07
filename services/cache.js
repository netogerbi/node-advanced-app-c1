const mongoose = require('mongoose');
const util = require('util');
const redis = require('redis');
const client = redis.createClient('redis://redis:6379');

client.get = util.promisify(client.get);

const exec = mongoose.Query.prototype.exec;

mongoose.Query.prototype.exec = async function() {
    
    const key = JSON.stringify(Object.assign({}, this.getQuery(), { 
      collection: this.mongooseCollection.name 
    }));

    const cacheValue = await client.get(key);

    if (cacheValue) {
      const docs = JSON.parse(cacheValue);

      // the exe function must return the mongo document instance
      return Array.isArray(docs) ? docs.map(d => new this.model(d)) : new this.model(docs);

    }

    // mongoose exec returns a function (mongo document instance)
    const result = await exec.apply(this, arguments);

    // redis must handle json
    client.set(key, JSON.stringify(result))

    return result;
}