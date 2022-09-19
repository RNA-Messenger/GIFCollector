const express = require("express");
const app = express();
const MongoClient = require("mongodb").MongoClient;
const mongodb = require("mongodb");
const mongoose = require("mongoose");
const multer = require("multer");
const GridFsStorage = require("multer-gridfs-storage");
const GridFsStream = require("gridfs-stream");
const crypto = require("crypto");
const path = require("path");

const port = 5000;
let gfs;
const mongoConnectionString =
  "mongodb+srv://anrubisse:iE87YVnGPIxFKTwl@cluster0.oga3fu7.mongodb.net/GifList";

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.json());

app.listen(port, () => {
  console.log(`listening on port ${port}`);
});

const connection = mongoose.createConnection(
  mongoConnectionString,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  (err) => {
    if (err) console.log(err);
    else console.log("mongdb is connected");
  }
);

connection.once("open", () => {
  gfs = GridFsStream(connection.db, mongoose.mongo);
  gfs.collection("gifs");
});

const storage = new GridFsStorage({
  db: connection,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      const fileInfo = {
        filename: req.body.tag + "|" + Date.now(),
        // tag: req.body.tag,
        bucketName: "gifs",
      };
      console.log(fileInfo);
      resolve(fileInfo);
    });
  },
});
const upload = multer({ storage });

// @route GET
// @desc Loads all
app.get("/", (req, res) => {
  gfs
    .collection("gifs")
    .find()
    .toArray()
    .then((results) => {
      console.log(results);
      res.render("index.ejs", { gifs: results });
    })
    .catch((err) => console.error(err));
});

// @route POST /uploadGif
// @desc uploads gif by one to collection
app.post("/uploadGif", upload.single("file"), (req, res) => {
  res.redirect("/");
});

// @route GET /gifs/:gifname
// @desc display gif name
app.get("/gifs/:filename", (req, res) => {
  gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
    if (!file) {
      return res.status(404).json({
        err: "No file exists",
      });
    }
    // console.log(contentType);
    if (file.contentType === "image/gif") {
      const readstream = gfs.createReadStream(file.filename);
      readstream.pipe(res);
    } else {
      res.status(404).json({
        err: "This gif doesn't exist",
      });
    }
  });
});

// @route DELETE /gifs/:id
// @desc  Delete gif if no longer pertinent for the collection
app.delete("/deleteGifs/:id", (req, res) => {
  console.log(req.params.id);
  gfs.remove(
    { _id: mongodb.ObjectId(req.params.id), root: "gifs" },
    (err, gridStore) => {
      if (err) {
        return res.status(404).json({ err: err });
      }
      // res.redirect("/");
    }
  );
});
