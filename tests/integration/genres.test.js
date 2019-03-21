const request = require("supertest");
const { Genre } = require("../../models/genre");
const { User } = require("../../models/user");

describe("This is just for testing", () => {
  it("should pass", () => {
    result = 1;
    expect(result).toBe(1);
  });
});

module.exports = server => {
  afterAll(async () => await server.close());

  describe("/api/genres", () => {
    beforeEach(async () => {
      await Genre.remove();
    });

    describe("GET /", () => {
      it("should return all genres", async () => {
        await Genre.collection.insertMany([
          { name: "genre1" },
          { name: "genre2" }
        ]);

        const res = await request(server).get("/api/genres");

        expect(res.status).toBe(200);
        expect(res.body.length).toBe(2);
        expect(res.body.some(g => g.name === "genre1")).toBeTruthy();
        expect(res.body.some(g => g.name === "genre2")).toBeTruthy();
      });
    });

    describe("GET /:id", () => {
      it("should return 404 if given id is not valid", async () => {
        const res = await request(server).get("/api/genres/1");

        expect(res.status).toBe(404);
      });

      it("should return the genre with given valid id", async () => {
        const genre = new Genre({ name: "genre1" });
        await genre.save();

        const res = await request(server).get("/api/genres/" + genre._id);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("name", genre.name);
      });
    });

    describe("POST /", () => {
      let token;
      let name;

      const exec = async () => {
        return await request(server)
          .post("/api/genres/")
          .set("x-auth-token", token)
          .send({ name: name });
      };

      beforeEach(() => {
        token = new User().generateAuthToken();
        name = "genre1";
      });

      it("should return 401 if not logged in", async () => {
        token = "";

        const res = await exec();

        expect(res.status).toBe(401);
      });

      it("should return 400 if token is invalid", async () => {
        token = "a";

        const res = await exec();

        expect(res.status).toBe(400);
      });

      it("should return 400 if input is less than 3 characters", async () => {
        name = "ab";

        const res = await exec();

        expect(res.status).toBe(400);
      });

      it("should return 400 if input is greater than 50 characters", async () => {
        name = new Array(52).join("a");

        const res = await exec();

        expect(res.status).toBe(400);
      });

      it("should save genre if the input is valid", async () => {
        await exec();

        const genre = await Genre.find({ name: "genre1" });
        expect(genre).not.toBeNull();
      });

      it("should return the saved genre back if the input is valid", async () => {
        const res = await exec();

        expect(res.body).toHaveProperty("_id");
        expect(res.body).toHaveProperty("name", "genre1");
      });
    });

    describe("PUT /:id", () => {
      let token;
      let name;
      let id;

      const exec = async () => {
        return await request(server)
          .put("/api/genres/" + id)
          .set("x-auth-token", token)
          .send({ name: name });
      };

      beforeEach(async () => {
        const genre1 = new Genre({ name: "genre1" });
        await genre1.save();

        id = genre1._id;
        token = new User().generateAuthToken();
        name = "genre1_updated";
      });

      it("should return 401 if not logged in", async () => {
        token = "";

        const res = await exec();

        expect(res.status).toBe(401);
      });

      it("should return 400 if input is less than 3 characters", async () => {
        name = "ab";

        const res = await exec();

        expect(res.status).toBe(400);
      });

      it("should return 400 if input is greater than 50 characters", async () => {
        name = new Array(52).join("a");

        const res = await exec();

        expect(res.status).toBe(400);
      });

      it("should return 404 if given id is not valid", async () => {
        id = 1;

        const res = await exec();

        expect(res.status).toBe(404);
      });

      it("should return 404 if genre with the given ID was not found", async () => {
        id = id + 1;

        const res = await exec();

        expect(res.status).toBe(404);
      });

      it("should update genre and return it if the input is valid", async () => {
        const res = await exec();
        expect(res.body).toHaveProperty("_id");
        expect(res.body).toHaveProperty("name", "genre1_updated");

        const genre = await Genre.findById(id);
        expect(genre).toHaveProperty("name", "genre1_updated");
      });
    });

    describe("DELETE /:id", () => {
      let token;
      let id;

      const exec = async () => {
        return await request(server)
          .delete("/api/genres/" + id)
          .set("x-auth-token", token);
      };

      beforeEach(async () => {
        const genre1 = new Genre({ name: "genre1" });
        await genre1.save();

        id = genre1._id;
        token = new User({ isAdmin: true }).generateAuthToken();
      });

      it("should return 401 if not logged in", async () => {
        token = "";

        const res = await exec();

        expect(res.status).toBe(401);
      });

      it("should return 403 if user is not admin", async () => {
        token = new User().generateAuthToken();

        const res = await exec();

        expect(res.status).toBe(403);
      });

      it("should return 404 if given id is not valid", async () => {
        id = 1;

        const res = await exec();

        expect(res.status).toBe(404);
      });

      it("should return 404 if genre with the given ID was not found", async () => {
        id = id + 1;

        const res = await exec();

        expect(res.status).toBe(404);
      });

      it("should delete genre with given valid id", async () => {
        const res = await exec();

        const genreInDb = await Genre.findById(id);

        expect(genreInDb).toBeNull();
        expect(res.body).toHaveProperty("_id");
        expect(res.body).toHaveProperty("name", "genre1");
      });
    });
  });
};
