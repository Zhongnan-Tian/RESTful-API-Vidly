const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { Rental } = require('../models/rental');
const { Movie } = require('../models/movie');

router.post('/', auth, async (req, res) => {
  if (!req.body.customerId) {
    return res.status(400).send('customerId is missing.');
  }
  if (!req.body.movieId) {
    return res.status(400).send('movieId is missing.');
  }

  const rental = await Rental.lookup(req.body.customerId, req.body.movieId);
  if (!rental) return res.status(404).send('Rental not found.');

  if (rental.dateReturned) {
    return res.status(400).send('Return is already processed. ');
  }

  rental.return();
  await rental.save();

  await Movie.update({ _id: rental.movie._id }, { $inc: { numberInStock: 1 } });

  res.status(200).send(rental);
});

module.exports = router;
