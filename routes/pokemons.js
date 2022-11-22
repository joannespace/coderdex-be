const express = require("express");
const router = express.Router();
const fs = require("fs");
const { send } = require("process");

//GET
router.get("/:id", (req, res, next) => {
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
      previousPokemon: data[pokeIndex - 1 > 720 ? 0 : pokeIndex - 1],
      nextPokemon: data[pokeIndex + 1 > 720 ? 0 : pokeIndex + 1],
    };
    res.status(200).send(result);
  } catch (err) {
    next(err);
  }
});

//POST
router.post("/:id", (req, res, next) => {
  const jsonFile = JSON.parse(fs.readFileSync("./db.json", "utf-8"));
  const data = jsonFile.data;
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

  const allowedField = ["name", "id", "types", "url"];

  let inputField = Object.keys(req.body);
  try {
    inputField.forEach((field) => {
      if (!allowedField.includes(field)) {
        const error = new Error(`Field ${field} is not allowed`);
        error.statusCode = 404;
        throw error;
      }

      if (!req.body[field]) delete req.body[field];

      //Check validtion of 4 fields without null cvalue
      let newReqSet = new Map(Object.entries(req.body));
      let validResult = {};
      allowedField.forEach((field) => {
        if (newReqSet.has(field)) {
          validResult[field] = req.body[field];
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
        }
      });

      //Check duplication of ID & name
      data.forEach((item) => {
        if (
          item.id.toString() === validResult.id.toString() &&
          item.name === validResult.name
        ) {
          const error = new Error("Duplicated pokemon's ID or name");
          error.statusCode = 401;
          throw error;
        }
      });

      //Save to database
      data = [...data, validResult];
      jsonFile.totalNumbers = data.length;
      fs.writeFileSync("db.json", JSON.stringify(jsonFile));

      //Response
      res.status(200).send(validResult);
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
