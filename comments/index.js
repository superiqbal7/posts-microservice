const express = require('express');
const bodyParser = require('body-parser');
const { randomBytes } = require('crypto');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());
app.use(cors());

const commentsByPostId = {};

app.get('/posts/:id/comments', (req, res) => {
  res.send(commentsByPostId[req.params.id] || []);
})

app.post('/posts/:id/comments', async (req, res) => {
  try{
    const commentId = randomBytes(4).toString('hex');
    const { content } = req.body;
    const postId = req.params.id;
  
    const comments = commentsByPostId[postId] || [];
  
    comments.push({ id: commentId, content: content, status: 'pending' });
    console.log(comments);
  
    commentsByPostId[postId] = comments;
  
    await axios.post('http://event-bus-srv:4005/events', {
      type: 'CommentCreated',
      data: {
        id: commentId,
        content,
        postId: req.params.id,
        status: 'pending'
      }
    })
  
    res.status(201).send(comments);
  }
  catch (err) {
    console.error(err);
  }
})

app.post('/events', async (req, res) => {
  try {
    console.log('Event Received:', req.body.type);

    const { type, data } = req.body;
  
    if(type === 'CommentModerated') {
      const { postId, id, status, content } = data;
      const comments = commentsByPostId[postId];
  
      const comment = comments.find(comment => {
        return comment.id = id;
      });
  
      comment.status = status;
  
      await axios.post('http://event-bus-srv:4005/events', {
        type: 'CommentUpdated',
        data: {
          id,
          status,
          postId,
          content
        }
      })
    }
  
    res.send({});
  }
  catch (err) {
    console.log(err);
  }
})

app.listen(4001, () => {
  console.log('listening to 4001');
})
