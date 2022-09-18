const express = require("express");
const app = express();
const MongoClient = require("mongodb").MongoClient;
const mongodb = require("mongodb");
const mongoose = require("mongoose");
const multer = require("multer");
const GridFsStorage = require("multer-gridfs-storage");
const GridFsStream = require("gridfs-stream");
const Schema = mongoose.Schema;

//Post Schema
let PostSchema = new Schema({
  tag: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
});

let Post = (module.exports = mongoose.model("Post", PostSchema));

const port = 5000;
let gfs;
const mongoConnectionString =
  "mongodb+srv://anrubisse:iE87YVnGPIxFKTwl@cluster0.oga3fu7.mongodb.net/GifList?retryWrites=true&w=majority";

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.json());

app.listen(port, () => {
  console.log(`listening on port ${port}`);
});

const connection = mongoose.createConnection(mongoConnectionString);

connection.once("open", () => {
  gfs = GridFsStream(connection.db, mongoose.mongo);
  gfs.collection("gifs");
});

const storage = new GridFsStorage({
  url: mongoConnectionString,
  file: (req, file) => {
    console.log("file_" + Date.now());
    return "file_" + Date.now();
  },
});
const upload = multer({ storage });

// @route GET
// @desc Loads all
app.get("/", (req, res) => {
  res.render("index.ejs", { gifs: res });
});

// @route POST /uploadGif
// @desc uploads gif by one to collection
app.post("/uploadGif", upload.single("file"), (req, res) => {
  // res.redirect("/");
  console.log(req.body);
  // const newPost = new Post({
  //   tag: req.body.tag,
  //   gif: req.file.filename,
  // });
  // newPost
  //   .save()
  //   .then((post) => res.json("Posted"))
  //   .catch((err) => console.log(err));
});

// @route GET /gifs
// @desc display all files in the collection
app.get("/gifs", (req, res) => {
  gfs.files.find().toArray((err, files) => {
    if (!files || files.length === 0) {
      return res.status(404).json({
        err: "There are no files on the database yet",
      });
    }
    return res.json(files);
  });
});

// @route GET /gifs/:gifname
// @desc display single file
app.get("/gif", (req, res) => {
  gfs.files.findOne({ filename: req.params.filename }),
    (err, file) => {
      if (!file) {
        return res.status(404).json({
          err: "The file you are trying to access doesn't exist",
        });
      }
      return res.json(file);
    };
});

// @route GET /gifs/:gifname
// @desc display gif name
app.get("/image/:filename", (req, res) => {
  gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
    if (!file) {
      return res.status(404).json({
        err: "No file exists",
      });
    }
    if (file.contentType === "image/jpeg" || file.contentType === "image/png") {
      const readstream = gfs.createReadStream(file.filename);
      readstream.pipe(res);
    } else {
      res.status(404).json({
        err: "This image does not exist",
      });
    }
  });
});

// @route DELETE /gifs/:id
// @desc  Delete gif if no longer pertinent for the collection
app.delete("/gifs/:id", (req, res) => {
  gfs.remove({ _id: req.params.id, root: "uploads" }, (err, gridStore) => {
    if (err) {
      return res.status(404).json({ err: err });
    }

    res.redirect("/");
  });
});

// MongoClient.connect(mongoConnectionString)
//   .then((client) => {
//     console.log("Database successful connection");
//     const db = client.db("GifList");
//     const gifCollection = db.collection("gifs");

//     app.use(express.urlencoded({ extended: true }));

//     app.get("/", (req, res) => {
//       gifCollection
//         .find()
//         .toArray()
//         .then((results) => {
//           res.render("index.ejs", { gifs: results });
//         })
//         .catch((err) => console.error(err));
//     });

//     app.post("/gifs", (req, res) => {
//       gifCollection
//         .insertOne(req.body)
//         .then((result) => {
//           res.redirect("/");
//         })
//         .catch((err) => console.error(err));
//     });

//     app.delete("/deleteGifs/:id", (req, res) => {
//       gifCollection
//         .deleteOne({ _id: mongodb.ObjectId(req.params.id) })
//         .then((result) => {
//           if (result.deletedCount === 0) {
//             return res.json("GIF not found");
//           }
//           res.json("Deleted GIF");
//         })
//         .catch((err) => console.error(err));
//     });
//   })
//   .catch((err) => console.error(err));

// anrubisse;
// iE87YVnGPIxFKTwl;
