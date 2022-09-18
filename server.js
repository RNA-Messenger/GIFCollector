const express = require("express");
const app = express();
const MongoClient = require("mongodb").MongoClient;
const mongodb = require("mongodb");

const mongoConnectionString =
  "mongodb+srv://anrubisse:iE87YVnGPIxFKTwl@cluster0.oga3fu7.mongodb.net/?retryWrites=true&w=majority";

app.set("view engine", "ejs");
app.use(express.static("public"));

app.listen(5000, () => {
  console.log("listening on port 5000");
});

MongoClient.connect(mongoConnectionString)
  .then((client) => {
    console.log("Database successful connection");
    const db = client.db("GifList");
    const gifCollection = db.collection("gifs");

    app.use(express.urlencoded({ extended: true }));

    app.get("/", (req, res) => {
      gifCollection
        .find()
        .toArray()
        .then((results) => {
          res.render("index.ejs", { gifs: results });
        })
        .catch((err) => console.error(err));
    });

    app.post("/uploadGif", (req, res) => {
      gifCollection
        .insertOne(req.body)
        .then((result) => {
          res.redirect("/");
        })
        .catch((err) => console.error(err));
    });

    app.delete("/deleteGifs/:id", (req, res) => {
      gifCollection
        .deleteOne({ _id: mongodb.ObjectId(req.params.id) })
        .then((result) => {
          if (result.deletedCount === 0) {
            return res.json("GIF not found");
          }
          res.json("Deleted GIF");
        })
        .catch((err) => console.error(err));
    });
  })
  .catch((err) => console.error(err));
