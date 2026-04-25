const express = require('express');
const cors = require('cors');
require('dotenv').config();

const postsRoutes = require('./routes/posts');
const issuesRoutes = require('./routes/issues');
const eventsRoutes = require('./routes/Events');
const recommendationsRoutes = require('./routes/Recommendations');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/posts', postsRoutes);
app.use('/issues', issuesRoutes);
app.use('/events', eventsRoutes);
app.use('/recommendations', recommendationsRoutes);

app.get('/', (req, res) => {
  res.send('LocalConnect API is running...');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});