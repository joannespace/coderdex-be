var express = require("express");
var router = express.Router();
const fs = require("fs");
const pokemonRouter = require("./pokemons");

/* GET home page. */
router.get("/", function (req, res, next) {
  try {
    let { page, limit, ...otherQueries } = req.query;
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 20;

    const filterKeys = Object.keys(otherQueries);
    filterKeys.forEach((key) => {
      if (!allowedQuery.includes(key)) {
        const error = {
          message: `Query ${key} is not allowed`,
          statusCode: 500,
        };

        throw error;
      }
      if (!otherQueries[key]) delete otherQueries[key];
    });

    const { data } = JSON.parse(fs.readFileSync("./db.json", "utf-8"));

    const sliceValue = limit * (page - 1);
    let result = [];
    if (filterKeys.length) {
      filterKeys.forEach((condition) => {
        result = result.length
          ? result.filter((book) => book[condition] === otherQueries[condition])
          : books.filter((book) => book[condition] === otherQueries[condition]);
      });
    } else {
      result = data;
    }

    result = result.slice(sliceValue, sliceValue + limit);

    res.status(200).send(result);
  } catch (error) {
    next(error);
  }
});

router.use("/pokemons", pokemonRouter);

module.exports = router;
