const mongoose = require("mongoose");
const newUser = new mongoose.Schema({
	name: {
		type: "string",
		required: true,
	},
	email: {
		type: "string",
		required: true,
	},
	password: {
		type: "string",
		required: true,
	},
	about: {
		type: "string",
		required: true,
	},
	file: {
		type: String,
		required: true,
	},
});

module.exports = mongoose.model("User", newUser);
