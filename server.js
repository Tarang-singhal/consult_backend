require("dotenv").config();
const express = require('express');
const bodyParser = require("body-parser");
const cors = require('cors');
const app = express();


var authRoute = require("./routes/authRoutes");
require('./DB/connection')


app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.use('/api/auth',authRoute);



app.get("/", (req, res) => {
    res.send("API working!");
});




//SERVER LISTENING ROUTE

var PORT = process.env.PORT || 3000;

app.listen(PORT, (req, res) => {
    console.log("server started at: " + PORT);
});