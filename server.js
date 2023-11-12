const express = require("express");
const cors = require("cors");
const bodyparser = require("body-parser");
const dotenv = require('dotenv');
dotenv.config();

const app = express();
app.use(express.static("public"));
app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());
app.use(cors());

const stripe = require("stripe")(process.env.STRIPE_TEST_KEY);

app.get('/', (req, res, next) => {
  return res.status(200).json({message: '🗿 Yes...'})
})


app.post("/checkout", async (req, res, next) => {
  return res.status(200).json('testing connection');
});

app.listen(4242, () => console.log('app is running on port 4242'));