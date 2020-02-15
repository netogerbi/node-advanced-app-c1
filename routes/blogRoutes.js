const mongoose = require('mongoose');
const requireLogin = require('../middlewares/requireLogin');
const util = require('util');
const redis = require('redis');
const client = redis.createClient('redis://redis:6379');

const Blog = mongoose.model('Blog');

module.exports = app => {
  app.get('/api/blogs/:id', requireLogin, async (req, res) => {
    const blog = await Blog.findOne({
      _user: req.user.id,
      _id: req.params.id
    });

    res.send(blog);
  });



  app.get('/api/blogs', requireLogin, async (req, res) => {
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

    client.set(req.user.id, JSON.stringify(blogs));
  });



  app.post('/api/blogs', requireLogin, async (req, res) => {
    const { title, content } = req.body;

    const blog = new Blog({
      title,
      content,
      _user: req.user.id
    });

    try {
      await blog.save();
      res.send(blog);
    } catch (err) {
      res.send(400, err);
    }
  });
};
