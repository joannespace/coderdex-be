const fs = require("fs");
const csv = require("csvtojson");

const createData = async (limit) => {
  try {
    let csvData = await csv().fromFile("pokemon.csv");
    csvData = csvData
      .map((poke, index) => {
        return {
          id: index + 1,
          name: poke.Name,
          types: !poke.Type2
            ? [poke.Type1.toLowerCase()]
            : [poke.Type1.toLowerCase(), poke.Type2.toLowerCase()],
          url: `http://localhost:8000/images/${index + 1}.png`,
        };
      })
      .slice(0, limit);
    const fsFile = JSON.parse(fs.readFileSync("db.json", "utf-8"));
    fsFile.data = csvData;
    fsFile.totalNumbers = csvData.length;
    fs.writeFileSync("db.json", JSON.stringify(fsFile));
  } catch (error) {
    console.log("createData", error.messgae);
  }
};

createData(721);
