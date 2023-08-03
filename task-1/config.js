require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  jwtSecret: process.env.JWT_SECRET || 'yourSecretKeyHere',
  mongoURI: process.env.MONGO_URI || 'mongodb+srv://task1:task1@cluster0.dbyknkc.mongodb.net/',
};
