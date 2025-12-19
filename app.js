// IMPORTS
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

// ROUTES
const categorieRouter = require("./routes/categorie.route");
const scategorieRouter = require("./routes/scategorie.route");
const articleRouter = require("./routes/article.route");
const userRouter =require("./routes/user.route")

// CONFIG DOTENV
dotenv.config();

// INITIALISATION EXPRESS
const app = express();

// CORS
app.use(cors());

// Body parser
app.use(express.json());

app.use(express.static(__dirname + '/'));

// ROUTES
app.use("/api/categories", categorieRouter);
app.use("/api/scategories", scategorieRouter);
app.use("/api/articles", articleRouter);
app.use('/api/users', userRouter);

// CONNEXION MONGODB
mongoose.connect(process.env.DATABASECLOUD)
  .then(() => console.log("DataBase Successfully Connected"))
  .catch((err) => {
    console.log("Unable to connect to database", err);
    process.exit(); // quitte si pas de DB
  });

// ROUTE TEST
app.get("/", (req, res) => {
  res.send("bonjour");
});

// LISTEN pour le local (Vercel détecte le PORT automatiquement)
app.listen(process.env.PORT || 3001, () => {
  console.log(`Server is listening on port ${process.env.PORT || 3001}`);
});

module.exports = app;
