const mongoose = require('mongoose');
const util = require('util');
const redis = require('redis');
const client = redis.createClient('redis://redis:6379');

client.hget = util.promisify(client.hget);

const exec = mongoose.Query.prototype.exec;

/**
 * Create a new function that when called it turns on the cache
 */
mongoose.Query.prototype.cache = function(options = {}) {
  this.useCache = true;
  this.hashKey = JSON.stringify(options.key || '');

  return this; // this allow to use chain functions of mongoose
}

mongoose.Query.prototype.exec = async function() {
    if(!this.useCache){

      return exec.apply(this, arguments);

    }

    const key = JSON.stringify(Object.assign({}, this.getQuery(), { 
      collection: this.mongooseCollection.name 
    }));

    const cacheValue = await client.hget(this.hashKey, key);

    if (cacheValue) {
      const docs = JSON.parse(cacheValue);

      // the exe function must return the mongo document instance
      return Array.isArray(docs) ? docs.map(d => new this.model(d)) : new this.model(docs);

    }

    // mongoose exec returns a function (mongo document instance)
    const result = await exec.apply(this, arguments);

    // redis must handle jsonamanha 
    client.hset(this.hashKey, key, JSON.stringify(result), 'EX', 10); // 10s expiration

    return result;
}

/**
 * Used to clear specific cache. 
 * eg.: When a user create a new blog post, 
 * it need to be cleaned to recharge the cache with all blogs posts and the new inclusive.
 */
module.exports = {
  clearHash(hashKey) {
    client.del(JSON.stringify(hashKey));
  }
}