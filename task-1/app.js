const express = require('express');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const itemSchema = new mongoose.Schema({
  customId: {type: Number, required:true, unique: true},
  name: String,
  description: String
});

const Item = mongoose.model('Item', itemSchema);

app.get("/", (req, res) => {
  res.json({
    message:"a sample api"
  })
})

const secretKey = 'your-secret-key';

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.sendStatus(401);
  
  jwt.verify(token, secretKey, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

function errorHandler(err, req, res, next) {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
}

app.post('/api/login', (req, res) => {
  const user = { username: req.body.username };
  const token = jwt.sign(user, secretKey);
  res.json({ token: token });
});

app.get('/api/items', authenticateToken, async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sortField = req.query.sortField || 'customId';
    const sortOrder = req.query.sortOrder || 'asc';

    const skip = (page - 1) * limit;

    const sortOptions = {};
    sortOptions[sortField] = sortOrder === 'desc' ? -1 : 1;

    const items = await Item.find()
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .exec();

    res.json(items);
  } catch (err) {
    next(err);
  }
});

app.post('/api/items', authenticateToken, async (req, res, next) => {
  try {
    const { customId, name, description } = req.body;

    const existingItem = await Item.findOne({ customId });
    if (existingItem) {
      return res.status(400).json({ error: 'customId must be present and unique' });
    }

    const newItem = new Item({
      customId,
      name,
      description
    });

    const savedItem = await newItem.save();
    res.json(savedItem);
  } catch (err) {
    next(err);
  }
});

app.put('/api/items/:customId', authenticateToken, async (req, res, next) => {
  try {
    const customId = req.params.customId;
    const updatedItem = await Item.findOneAndUpdate({ customId }, req.body, { new: true });

    if (!updatedItem) {
      return res.status(404).send('Item not found');
    }

    res.json(updatedItem);
  } catch (err) {
    next(err);
  }
});

app.delete('/api/items/:customId', authenticateToken, async (req, res, next) => {
  try {
    const customId = req.params.customId;

    const deletedItem = await Item.findOneAndDelete({ customId });

    if (!deletedItem) {
      return res.status(404).json({ error: 'Item not found' });
    }

    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
});


app.use(errorHandler);

module.exports =app;