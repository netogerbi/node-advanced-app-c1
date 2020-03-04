const mongoose = require('mongoose');

const exec = mongoose.Query.prototype.exec;

mongoose.Query.prototype.exec = function() {
    console.log('Executando uma query');

    console.log(this.getQuery());
    console.log(this.mongooseCollection.name);

    return exec.apply(this, arguments);
}
/*
client.get = util.promisify(client.get);
    const cachedBlogs = await client.get(req.user.id);
    console.time('requisistion');    
    if (cachedBlogs) {
      console.timeEnd('requisistion');
      console.log('SERVING FROM CACHE');
      return res.send(JSON.parse(cachedBlogs));
    }
    console.timeEnd('requisistion');
    console.log('SERVING FROM MONGO');
    const blogs = await Blog.find({ _user: req.user.id });

    res.send(blogs);

    client.set(req.user.id, JSON.stringify(blogs));*/