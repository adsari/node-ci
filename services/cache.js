const mongoose = require('mongoose');
const redis = require('redis');
const util = require('util');
const keys = require('../config/keys')

const client = redis.createClient(keys.redisURL);
client.hget = util.promisify(client.hget);
const exec = mongoose.Query.prototype.exec;

mongoose.Query.prototype.cache = function(options = {}){
    this.useCache = true;
    console.log(options.key)
    this.hashKey = JSON.stringify(options.key || "");
    return this;
}

mongoose.Query.prototype.exec = async function() {
    if (!this.useCache) {
        return exec.apply(this, arguments);
    }
    const key = JSON.stringify(Object.assign({}, this.getQuery(), {
        "collection": this.mongooseCollection.name
    }));;
    let cacheValue = await client.hget(this.hashKey, key);
    if(cacheValue) {
        const doc = JSON.parse(cacheValue);
        console.log("FROM CACHE ");
        return Array.isArray(doc) 
        ? doc.map(d => new this.model(d))
        : new this.model(doc) 
    } else {
        const result = await exec.apply(this, arguments);
        console.log("FROM MONGO ");
        debugger;
        client.hset(this.hashKey, key, JSON.stringify(result), 'EX', 1);
        debugger;
        return result;
    }
        
}

module.exports = {
    clearHash(hashKey) {
        client.del(JSON.stringify(hashKey));
    }
}