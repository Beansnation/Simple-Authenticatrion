require("dotenv").config();
const express = require("express");
const ejs = require("ejs");
const mongoose = require("mongoose");
const bodyparser = require("body-parser");
const bcrypt = require("bcrypt");
const { response } = require("express");
const saltRounds = 10;
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose =require("passport-local-mongoose");

const app = express();

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: "Our little secret",
  resave: false,
  saveUnitialised: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/userDB", { useNewUrlParser: true });
mongoose.set('useCreateIndex', true);

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
});

const User = new mongoose.model("User", userSchema);

app.get("/", (req, res) => res.render("secrets"));

app.get("/register", (req, res) => res.render("register"));

app.get("/login", (req, res) => res.render("login"));

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  User.findOne({ email: username }, (err, foundUser) => {
    if (err) {
      console.log(err);
    } else {
      if (foundUser) {
        bcrypt.compare(password, foundUser.password, function (err, result) {
          if (result) {
            console.log("Welcome back user ");
            res.render("secrets");
          }
        });
      }
    }
  });
});

app.post("/register", (req, res) => {
  bcrypt.hash(req.body.password, saltRounds, function (err, hash) {
    const newUser = new User({
      email: req.body.username,
      password: hash,
    });

    User.findOne({ email: req.body.username }, (err, foundUser) => {
      if (err) {
        console.log(err);
      } else {
        if (foundUser) {
          console.log("user exists, try using another email");
        } else {
          newUser.save((err) => {
            if (err) {
              res.render("/login");
              console.log(err);
            } else {
              res.render("secrets");
            }
          });
        }
      }
    });
  });
});

app.get("/secrets", (req, res) => res.render("secrets"));
app.get("/logout", (req, res) => res.render("home"));

app.listen(3000, () => console.log("server is running on port 3000"));
