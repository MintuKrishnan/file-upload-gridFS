const express = require("express");
const app = express();
const PORT = 8080;
require("./db");

// BodyParser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// app.set("views", __dirname + "/views");
// app.set("view engine", "html");
// import route
const register = require("./router/Register");
app.use(register);

app.listen(PORT, () => {
	console.log(`server runing at ${PORT}`);
});
