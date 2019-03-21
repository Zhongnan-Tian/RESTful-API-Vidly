const mongoose = require('mongoose');
const winston = require('winston');
const keys = require('../config/keys');

module.exports = function() {
  const db = keys.db;
  // const db = process.env.DB_URL;
  mongoose.connect(db).then(() => {
    //console.log("Connnected to MongoDB...");
    winston.info(`Connnected to MongoDB ${db}...`);
  });
  //.catch(error => console.error("Could not connect to MongoDB..."));
};
