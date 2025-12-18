// IMPORTS
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const serverless = require("serverless-http");

// IMPORTS : ROUTES
const categorieRouter =require("./routes/categorie.route")
const scategorieRouter =require("./routes/scategorie.route")
const articleRouter =require("./routes/article.route")




//config dotenv
dotenv.config()

const app = express();

//Les cors : activer CORS
app.use(cors())

//BodyParser Middleware
app.use(express.json());

//ROUTES
app.use('/api/categories', categorieRouter);
app.use('/api/scategories', scategorieRouter);
app.use('/api/articles', articleRouter);

// Connexion à la base données
mongoose.connect(process.env.DATABASECLOUD)
.then(() => {console.log("DataBase Successfully Connected");})
.catch(err => { console.log("Unable to connect to database", err);
process.exit(); });

// requête
app.get("/",(req,res)=>{
res.send("bonjour"); });

app.listen(process.env.PORT, () => {
console.log(`Server is listening on port ${process.env.PORT}`); });


module.exports = app;
module.exports.handler = serverless(app);