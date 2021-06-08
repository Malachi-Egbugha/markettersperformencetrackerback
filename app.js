const express = require("express");
const fileUpload = require("express-fileupload");
//const morgan = require("morgan");
const mongoose = require("mongoose");
let nodemailer = require("nodemailer");

const connectdb = require("./config/db");

var path = require("path");
const cors = require("cors");
const app = express();
app.use(fileUpload());
require("dotenv").config();
mongoose.Promise = global.Promise;
connectdb();

//middleware
//app.use(morgan('dev'));
app.use(cors());
//Body Parser
app.use(express.json());

//routes
app.use("/user", require("./routes/user"));
app.use("/api", require("./routes/auth"));
app.use("/", require("./routes/upload"));

//Start the server
const port = process.env.PORT || 5056;
app.listen(port);
console.log(`Server listening at ${port}`);
