const express = require("express");
const app = express();
const dotenv = require("dotenv");
dotenv.config();
const bodyParser = require("body-parser");
const PORT = process.env.PORT;
const connection = require("./src/connection/connection");

const DATABASE_URL = process.env.DATABASE_URL;
connection(DATABASE_URL);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const routes = require("./src/routes/user.routes");
app.use('/user', routes)

app.listen(PORT, function () {
  console.log(`Server listening on port http://localhost:${PORT}`);
});
