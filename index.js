const express = require('express');

const app = express();

require('./startup/logging')();
require('./startup/db')();
require('./startup/routes')(app);
require('./startup/validation')();
require('./startup/prod')(app);

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  // res.json({ msg: 'This is homepage.' });
  res.render('index');
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () =>
  console.log(`Server is running on port ${PORT}`)
);

module.exports = server;
