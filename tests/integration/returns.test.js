const request = require("supertest");
const { User } = require("../../models/user");
const { Rental } = require("../../models/rental");
const { Movie } = require("../../models/movie");
const mongoose = require("mongoose");
const moment = require("moment");

describe("This is just for testing", () => {
  it("should pass", () => {
    result = 1;
    expect(result).toBe(1);
  });
});

module.exports = server => {
  afterAll(async () => await server.close());

  describe("/api/returns", () => {
    beforeEach(async () => {
      await Rental.remove();
      await Movie.remove();
    });

    describe("POST /", () => {
      let customerId;
      let movieId;
      let movie;
      let rental;
      let token;

      beforeEach(async () => {
        await Rental.remove();
        await Movie.remove();

        customerId = mongoose.Types.ObjectId();
        movieId = mongoose.Types.ObjectId();

        movie = new Movie({
          _id: movieId,
          title: "12345",
          dailyRentalRate: 2,
          genre: {
            name: "12345"
          },
          numberInStock: 1
        });
        await movie.save();

        rental = new Rental({
          customer: {
            _id: customerId,
            name: "12345",
            phone: "12345"
          },
          movie: {
            _id: movieId,
            title: "12345",
            dailyRentalRate: 2
          }
        });

        await rental.save();

        token = new User().generateAuthToken();
      });

      const exec = async () => {
        return await request(server)
          .post("/api/returns/")
          .set("x-auth-token", token)
          .send({ customerId: customerId, movieId: movieId });
      };

      it("should return 401 if not logged in", async () => {
        token = "";
        const res = await exec();
        expect(res.status).toBe(401);
      });

      it("should return 400 if customerId is not provided", async () => {
        customerId = "";
        const res = await exec();
        expect(res.status).toBe(400);
      });

      it("should return 400 if movieId is not provided", async () => {
        movieId = "";
        const res = await exec();
        expect(res.status).toBe(400);
      });

      it("should return 404 if no rental found for the customer/movie", async () => {
        await Rental.remove({});

        const res = await exec();
        expect(res.status).toBe(404);
      });

      it("should return 400 if return is already processed", async () => {
        rental.dateReturned = new Date();
        await rental.save();

        const res = await exec();

        expect(res.status).toBe(400);
      });

      it("should return 200 if we have a valid request", async () => {
        const res = await exec();

        expect(res.status).toBe(200);
      });

      it("should set the returnDate if input is valid", async () => {
        const res = await exec();

        const rentalInDb = await Rental.findById(rental._id);
        const diff = new Date() - rentalInDb.dateReturned;
        expect(diff).toBeLessThan(10 * 1000);
      });

      it("should set the rentalFee if input is valid", async () => {
        rental.dateOut = moment()
          .add(-7, "days")
          .toDate();
        await rental.save();

        const res = await exec();

        const rentalInDb = await Rental.findById(rental._id);
        expect(rentalInDb.rentalFee).toBe(14);
      });

      it("should increase the movie stock if input is valid", async () => {
        const res = await exec();

        //   expect(movie.numberInStock).toBe(2); -- wrong
        const movieInDb = await Movie.findById(movieId);
        expect(movieInDb.numberInStock).toBe(movie.numberInStock + 1);
      });

      it("should return the rental if input is valid", async () => {
        const res = await exec();

        //const rentalInDb = await Rental.findById(rental._id);

        expect(Object.keys(res.body)).toEqual(
          expect.arrayContaining([
            "dateOut",
            "dateReturned",
            "rentalFee",
            "customer",
            "movie"
          ])
        );
      });
    });
  });
};
