// Requiring necessary npm packages
const express = require("express");
const exphbs = require("express-handlebars");
const session = require("express-session");
const app = express();
const http = require("http").Server(app)
const io = require("socket.io")(http, {
  cors: {
      origin: "http://localhost:8080",
      methods: ["GET", "POST"]
  }
})

// Requiring passport as we've configured it
const passport = require("./config/passport");

// Setting up port and requiring models for syncing
const PORT = process.env.PORT || 8080;
const db = require("./models");

// Creating express app and configuring middleware needed for authentication
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));
// We need to use sessions to keep track of our user's login status
app.use(
  session({ secret: "keyboard cat", resave: true, saveUninitialized: true })
);
app.use(passport.initialize());
app.use(passport.session());

// Requiring our routes
require("./routes/html-routes.js")(app);
require("./routes/api-routes.js")(app);

//Setting up socket.io
const users = {};

io.on("connection", socket => {
  socket.on("new-user", name => {
    users[socket.id] = name
    socket.broadcast.emit("user-connected", name)
  })

  socket.on("disconnect", () => {
    socket.broadcast.emit("user-disconnect", users[socket.id])
    delete users[socket.id]
  })



  socket.on("send-chat-message", message => {
    socket.broadcast.emit("chat-message", {
      message: message,
      name: users[socket.id]
    })
  })
})


// Syncing our database and logging a message to the user upon success
db.sequelize.sync().then(() => {
  http.listen(PORT, () => {
    console.log(
      "==> 🌎  Listening on port %s. Visit http://localhost:%s/ in your browser.",
      PORT,
      PORT
    );
  });
});
