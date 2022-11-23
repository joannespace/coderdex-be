var express = require("express");
var router = express.Router();
const fs = require("fs");
// const pokemonRouter = require("./pokemons");

//GET HOMEPAGE
router.get("/pokemons", function (req, res, next) {
  try {
    let { page, limit, ...otherQueries } = req.query;
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 20;

    const allowedQuery = ["page", "limit", "search", "type"];

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

    //Check filter by type
    let result = [];
    if (req.query.type) {
      result = data.filter((poke) => poke.types.includes(req.query.type));
    } else {
      result = result.length ? result : data;
    }

    //Search by name
    if (req.query.search) {
      result = data.filter((poke) =>
        poke.name.startsWith(req.query.search.toLowerCase())
      );
    } else {
      result = result.length ? result : data;
    }

    // //Shorten with page and limit
    const sliceValue = limit * (page - 1);

    result = result.slice(sliceValue, sliceValue + limit);

    res.status(200).send({ data: result });
  } catch (error) {
    next(error);
  }
});

//GET POKEMON BY ID
router.get("/pokemons/:id", (req, res, next) => {
  const { id } = req.params;
  let result;
  const jsonFile = JSON.parse(fs.readFileSync("./db.json", "utf-8"));
  const data = jsonFile.data;

  try {
    let pokeIndex = data.findIndex(
      (item) => item.id.toString() === id.toString()
    );

    result = {
      pokemon: data[pokeIndex],
      previousPokemon:
        pokeIndex === data.length - 1
          ? data[pokeIndex - 1]
          : data[data.length - 1],
      nextPokemon:
        pokeIndex === data.length - 1 ? data[0] : data[pokeIndex + 1],
    };

    res.status(200).send({ data: result });
  } catch (err) {
    next(err);
  }
});

//POST A POKEMON
router.post("/pokemons/:id", (req, res, next) => {
  console.log(req.query, req.body);
  const jsonFile = JSON.parse(fs.readFileSync("./db.json", "utf-8"));
  let data = jsonFile.data;
  const allowedPokeTypes = [
    "bug",
    "dragon",
    "fairy",
    "fire",
    "ghost",
    "ground",
    "normal",
    "psychic",
    "steel",
    "dark",
    "electric",
    "fighting",
    "flyingText",
    "grass",
    "ice",
    "poison",
    "rock",
    "water",
  ];

  const allowedField = ["id", "name", "types", "url"];

  let inputField = Object.keys(req.body);

  try {
    inputField.forEach((field) => {
      if (!allowedField.includes(field)) {
        const error = new Error(`Field ${field} is not allowed`);
        error.statusCode = 404;
        throw error;
      }

      if (!req.body[field]) delete req.body[field];
    });

    //Check validation of 4 fields without null value
    let newReqSet = new Map(Object.entries(req.body));
    let validResult = {};
    allowedField.forEach((field) => {
      if (newReqSet.has(field)) {
        if (newReqSet.get(field) === null || undefined) {
          const error = new Error(`Field ${field} value is invalid`);
          error.statusCode = 401;
          throw error;
        } else {
          validResult[field] = req.body[field];
        }
      } else {
        const error = new Error(`Field ${field} is required`);
        error.statusCode = 401;
        throw error;
      }
    });

    //Check valid Type
    validResult.types.forEach((type) => {
      if (allowedPokeTypes.includes(type)) {
        if (0 < validResult.types.length < 3) {
          return validResult;
        } else {
          const error = new Error(
            "Types can not be blank and the maximum selections are 2"
          );
          error.statusCode = 401;
          throw error;
        }
      } else {
        const error = new Error(`Type ${type} is not valid`);
        error.statusCode = 401;
        throw error;
      }
    });

    //Check duplication of ID & name
    data.forEach((item) => {
      if (
        item.id.toString() === validResult.id.toString() ||
        item.id.toString() === req.params.toString() ||
        item.name === validResult.name.toLowerCase()
      ) {
        const error = new Error(
          `Duplicated pokemon's ID or name with ${JSON.stringify(item)}`
        );
        error.statusCode = 401;
        throw error;
      }
    });

    //Save to database
    data.push(validResult);
    jsonFile.totalNumbers = data.length;
    fs.writeFileSync("db.json", JSON.stringify(jsonFile));

    //Response
    res.status(200).send(validResult);
  } catch (error) {
    next(error);
  }
});

//PUT A POKEMON
router.put("/pokemons/:id", (req, res, next) => {
  const jsonFile = JSON.parse(fs.readFileSync("./db.json", "utf-8"));
  let data = jsonFile.data;
  const allowedPokeTypes = [
    "bug",
    "dragon",
    "fairy",
    "fire",
    "ghost",
    "ground",
    "normal",
    "psychic",
    "steel",
    "dark",
    "electric",
    "fighting",
    "flyingText",
    "grass",
    "ice",
    "poison",
    "rock",
    "water",
  ];

  const allowedField = ["id", "name", "types", "url"];
  let inputField = Object.keys(req.body);

  try {
    inputField.forEach((field) => {
      if (!allowedField.includes(field)) {
        const error = new Error(`Field ${field} is not allowed`);
        error.statusCode = 404;
        throw error;
      }

      if (!req.body[field]) delete req.body[field];

      //Check validation of 4 fields without null value
      let newReqSet = new Map(Object.entries(req.body));
      let validResult = {};
      allowedField.forEach((field) => {
        if (newReqSet.has(field)) {
          if (newReqSet.get(field) === null || undefined) {
            const error = new Error(`Field ${field} value is invalid`);
            error.statusCode = 401;
            throw error;
          } else {
            validResult[field] = req.body[field];
          }
        } else {
          const error = new Error(`Field ${field} is required`);
          error.statusCode = 401;
          throw error;
        }
      });

      //Check valid Type
      validResult.types.forEach((type) => {
        if (allowedPokeTypes.includes(type)) {
          if (0 < validResult.types.length < 3) {
            return validResult;
          } else {
            const error = new Error(
              "Type can not be blank and the maximum selections are 2"
            );
            error.statusCode = 401;
            throw error;
          }
        } else {
          const error = new Error(`Type ${type} is not valid`);
          error.statusCode = 401;
          throw error;
        }
      });

      //Check valid id
      if (validResult.id.toString() !== req.params.id.toString()) {
        const error = new Error("The provided ID does not match");
        error.statusCode = 401;
        throw error;
      }

      let matchIndex = data.findIndex(
        (poke) => poke.id.toString() === req.params.id.toString()
      );

      if (matchIndex === -1) {
        const error = new Error("The provided ID does not exist");
        error.statusCode = 401;
        throw error;
      }

      //Save to database
      data[matchIndex] = { ...data[matchIndex], ...validResult };
      jsonFile.totalNumbers = data.length;
      fs.writeFileSync("db.json", JSON.stringify(jsonFile));

      //Response
      res.status(200).send(validResult);
    });
  } catch (error) {
    next(error);
  }
});

//DELETE
router.delete("/pokemons/:id", (req, res, next) => {
  const { id } = req.params;
  const jsonFile = JSON.parse(fs.readFileSync("./db.json", "utf-8"));

  //Check error
  let deleteIndex = jsonFile.data.findIndex(
    (poke) => poke.id.toString() === id.toString()
  );

  if (deleteIndex === -1) {
    const error = new Error("The provided ID does not exist");
    error.statusCode = 401;
    throw error;
  }

  //Save to database
  let filteredList = jsonFile.data.filter(
    (poke) => poke.id.toString() !== id.toString()
  );

  jsonFile.data = filteredList;
  jsonFile.totalNumbers = jsonFile.data.length;

  fs.writeFileSync("./db.json", JSON.stringify(jsonFile));

  res.status(200).send(jsonFile.data);
});

module.exports = router;
