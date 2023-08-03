const mongoose = require('mongoose');
const app = require('./app');
const config = require('./config');

mongoose
  .connect(config.mongoURI)
  .then(() => {
    console.log('Connected to MongoDB');
    const port = config.port;
    app.listen(port, () => {
      console.log(`Server started on port ${port}`);
    });
  })
  .catch((err) => console.error('Error connecting to MongoDB:', err));
