const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const session = require("express-session");
const mongoDBSession = require("connect-mongodb-session")(session);
const cookieParser = require("cookie-parser");
const app = express();
const { Todo, User } = require("./models/todo");

require('dotenv').config()

// koneksi ke database
require("./db/db");


const store = new mongoDBSession({
  uri: process.env.DB_URI,
  collection: "mySessions",
});

// middleware
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(expressLayouts);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  session({
    secret: "rahasia",
    resave: false,
    saveUninitialized: false,
    store,
  })
);
app.use("/", express.static("./node_modules/bootstrap/dist/"));

const isAuth = (req, res, next) => {
  if (req.session.isAuth) {
    next();
  } else {
    res.redirect("/login");
  }
};

// halaman home
app.get("/", isAuth, async (req, res) => {
  const todo = await Todo.find({ user: req.session.user });
  res.render("index", {
    title: "halaman home",
    layout: "layouts/main.ejs",
    todo,
  });
});

app.post("/", async (req, res) => {
  await Todo.insertMany({
    user: req.session.user,
    todo: req.body.todo,
  });
  res.redirect("/");
});

app.post("/delete", async (req, res) => {
  await Todo.deleteOne({ _id: req.body._id });
  res.redirect("/");
});

app.get("/add-todo", isAuth, (req, res) => {
  res.render("add-todo", {
    title: "halaman Add Todo",
    layout: "layouts/main.ejs",
  });
});

app.post("/add-todo/add", async (req, res) => {
  const user = req.session.user;
  await Todo.insertMany({
    user: user,
    todo: req.body.todo,
    deskripsi: req.body.deskripsi,
  });
  res.redirect("/");
});

app.get("/list-todo", isAuth, async (req, res) => {
  const todo = await Todo.find({ user: req.session.user });
  res.render("list", {
    title: "halaman Todo list",
    layout: "layouts/main.ejs",
    todo,
  });
});

app.get("/edit/:id", isAuth, async (req, res) => {
  const data = await Todo.findOne({ _id: req.params.id });
  res.render("edit", {
    title: "halaman edit Todo",
    layout: "layouts/main.ejs",
    data,
  });
});

app.post("/edit", async (req, res) => {
  const user = req.session.user;
  await Todo.updateOne(
    { _id: req.body._id },
    {
      $set: {
        user: user,
        todo: req.body.todo,
        deskripsi: req.body.deskripsi,
      },
    }
  );
  res.redirect("/list-todo");
});

app.get("/login", (req, res) => {
  res.render("login", {
    title: "halaman login",
    layout: "layouts/main.ejs",
  });
});

app.post("/login", async (req, res) => {
  const user = await User.findOne({
    username: req.body.username,
    password: req.body.password,
  });
  if (!user) {
    res.redirect("/login");
  } else {
    req.session.user = user;
    req.session.isAuth = true;
    res.redirect("/");
  }
});

app.get("/register", (req, res) => {
  res.render("register", {
    title: "halaman register",
    layout: "layouts/main.ejs",
  });
});

app.post("/register", async (req, res) => {
  const user = await User.findOne({ username: req.body.username });
  if (user) {
    return res.redirect("/register");
  } else {
    await User.insertMany(req.body);
    res.redirect("/login");
  }
});

app.post("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/login");
});

app.listen(3000, () => {
  console.log("server is running");
});
