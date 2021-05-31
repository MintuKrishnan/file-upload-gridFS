const router = require("express").Router();
const User = require("../model/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
var sessions = require("express-session");
var methodoverride = require("method-override");
const cookieParser = require("cookie-parser");
const path = require("path");
const multer = require("multer");
router.use(methodoverride("overriding"));
router.use(cookieParser());
router.use(
	sessions({
		name: "xyz",
		secret: "SomeSecret",
		resave: false,
		saveUninitialized: true,
		cookie: {
			httpOnly: true,
			sameSite: "strict",
			maxAge: 60000,
			secure: false,
		},
	}),
);
const storage = multer.diskStorage({
	destination: "upload",
	// By default, multer removes file extensions so let's add them back
	filename: function (req, file, cb) {
		cb(
			null,
			file.fieldname + "-" + Date.now() + path.extname(file.originalname),
		);
	},
});
let upload = multer({
	storage: storage,
}).single("file");

router.get("/", function (req, res) {
	res.send(`
	<div style="margin-left: 30rem">
    <h1>Welcome to somewhere</h1> 
    <button style="margin-left: 5rem"><a href = "/Register" style="text-decoration: none;">Register</a></button>
    <button style="margin-left: 4rem"><a href = "/login" style="text-decoration: none;">Login</a></button>
    <div/>
    `);
});
router.get("/Register", async (req, res) => {
	res.send(`
	<a href = "/">Home</a></br>
	<div style="margin-left: 35rem">
    <h1>Register Yourself </h1>
    <form  method="POST" action="/Register" enctype="multipart/form-data">
    <input required type="text" name="name" placeholder="Enter your name"></br></br>
    <input required type="email" name="email" placeholder="Enter your E-mail id"></br></br>
    <input required type="password" name="password" placeholder="Enter a password"></br></br>
    <input required type="text" name="about" placeholder="Enter about yourself"></br></br>
    <input type="file" name="file"/>
    <input type="submit">
    </form>
    <p>Already have a account login <a href = "/login">here</a></p>
	</div>`);
});
router.post("/Register", upload, async (req, res) => {
	// Check existing user
	const emailexist = await User.findOne({ email: req.body.email });
	if (emailexist)
		return res
			.status(403)
			.send(`<h1 style="color:red;margin-left:35rem">Email already exist<h1/>`);
	// hash password
	const hashed = await bcrypt.genSalt(10);
	const hashedPassword = await bcrypt.hash(req.body.password, hashed);
	// Creating a new USER
	const user = new User({
		name: req.body.name,
		email: req.body.email,
		password: hashedPassword,
		about: req.body.about,
		file:req.file.filename,
	});
	try {
		const AllUser = await user.save();
		req.session.user = AllUser;
		// res.send(AllUser);
		res.redirect("/profile");
	} catch (err) {
		res.status(400).send(err.message);
	}
});
router.get("/login", function (req, res) {
	const log = `
    <a href = "/">Home</a></br>
	<div style="margin-left: 35rem">
    <h1>Log in </h1>
    <form action='/login' method='POST' ">
    <input required type="email" name="email" placeholder="enter your email"></br></br>
    <input required type="password" name="password" placeholder="Enter your password"></br></br>
    <input type="submit" value="login"/>
    </form>
    <p>Don't have account register <a href = "/Register">here</a></p>
    </div>
    `;
	res.send(log);
});
router.post("/login", async (req, res) => {
	const user = await User.findOne({ email: req.body.email });
	if (!user) return res.status(400).send("Email not found");
	// check password
	const validpassword = await bcrypt.compare(req.body.password, user.password);
	if (!validpassword) return res.status(400).send("Invalid password");

	// create token
	const token = jwt.sign({ _id: user._id }, "Secret_Key");
	// res.json({message:"Login Success",token,alluser});
	req.session.user = user;
	res.redirect("/profile");
});
router.get("/profile", async (req, res) => {
	console.log(req.session.user);
	if (!req.session.user) {
		res.redirect("/login");
	}
	var dashboard = `
	<div>
	<form  method='POST' action='/logout?overriding=DELETE'> 
    <input style="margin-left: 70rem" type="submit" value="logout"/>
    </form>
	</div>
    <a href = "/">Home</a></br>
	<div style="margin-left: 25rem;color:#3fbeef">
    <h1>Hi <span style="color:#0dad8f">${req.session.user.name}</span>, Welcome to your profile. </h1>
	<img src=${req.session.user.file} height="100px" width="100" alt="">
	<h2 style="margin-left: 7rem;color:green">Your Email is : ${req.session.user.email} </h2>
	<h2 style="margin-left: 7rem;color:green">About: ${req.session.user.about}</h2>
	</div>
    `;

	res.send(dashboard);
});
router.delete("/logout", function (req, res) {
	req.session.destroy();
	return res.redirect("/login");
});

module.exports = router;
