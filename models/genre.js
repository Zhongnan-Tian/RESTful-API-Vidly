const mongoose = require("mongoose");
const Joi = require("joi");

const genreSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 50
  }
});

const Genre = mongoose.model("Genre", genreSchema);

function validateGenre(genre) {
  const schema = {
    name: Joi.string()
      .min(3)
      .max(50)
      .required()
  };

  return Joi.validate(genre, schema);
}

module.exports.validateGenre = validateGenre;
module.exports.Genre = Genre;
module.exports.genreSchema = genreSchema;
