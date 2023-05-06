const fs = require("fs");
const path = require("path");
const filename = path.join(__dirname, "../..", "ipfsData", "backup.txt");

const writeToFile = (data) => {
  fs.writeFileSync(filename, data);
};

const readFromFile = () => {
  return fs.readFileSync(filename, "utf8");
};

module.exports = { writeToFile, readFromFile };
