const express = require("express");
const router = express.Router();
const { validateGenre, Genre } = require("../models/genre");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const validateObjectId = require("../middleware/validateObjectId");

router.get("/", async (req, res) => {
  //throw new Error("cannot get the genres.");
  const genres = await Genre.find().sort("name");
  if (!genres) {
    res.status(404).send("No genres found.");
  }
  res.send(genres);
});

router.get("/:id", validateObjectId, async (req, res) => {
  const foundGenre = await Genre.findById(req.params.id);

  if (!foundGenre) {
    return res.status(404).send("Not Found");
  }

  res.send(foundGenre);
});

router.post("/", auth, async (req, res) => {
  const result = validateGenre(req.body);
  if (result.error) {
    return res.status(400).send(result.error.details[0].message);
  }

  let genre = new Genre({ name: req.body.name });
  genre = await genre.save();
  res.send(genre);
});

router.put("/:id", auth, validateObjectId, async (req, res) => {
  const result = validateGenre(req.body);
  if (result.error) {
    return res.status(400).send(result.error.details[0].message);
  }

  const genre = await Genre.findByIdAndUpdate(
    req.params.id,
    { name: req.body.name },
    { new: true }
  );

  if (!genre) {
    return res.status(404).send("The genre with the given ID was not found.");
  }

  res.send(genre);
});

router.delete("/:id", [auth, admin, validateObjectId], async (req, res) => {
  const foundGenre = await Genre.findByIdAndRemove(req.params.id);

  if (!foundGenre) {
    return res.status(404).send("ID Not Found");
  }

  res.send(foundGenre);
});

module.exports = router;
