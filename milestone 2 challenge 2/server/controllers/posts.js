let posts = [];

exports.getPosts = (req, res) => {
  res.json(posts);
};

exports.createPost = (req, res) => {
  const { content } = req.body;
  const post = { id: Date.now(), content, createdAt: new Date() };
  posts.unshift(post);
  res.status(201).json(post);
};