const dotenv = require("dotenv");
const path = require("path");

const express = require("express");
const mongodb = require("mongodb");
const mongoose = require("mongoose");

const multer = require("multer");
const GridFsStorage = require("multer-gridfs-storage");
const GridFsStream = require("gridfs-stream");

const methodOverride = require("method-override");

const app = express();
dotenv.config();

//@helper
//@desc sets tags from filename to quickly find gif
app.locals.setTag = (filename) => {
  const tag = filename.split("|");
  return tag[0];
};

//@helper
//@desc sets gif url from filename for image src
app.locals.setImgUrl = (filename) => {
  return `http://localhost:5000/gifs/${filename}`;
};

//mongoDB creds ===>
//add the mongo uri from ATLAS in the ENV FILE
const mongoURI = process.env.MONGO_URI;

//setting general server data
const port = process.env.PORT;
let gfs;

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname + "/public")));
app.use(express.json());
app.use(methodOverride("_method"));

app.listen(port, () => {
  console.log(`listening on port ${port}`);
});

//connecting to mngoDB instance
const connection = mongoose.createConnection(
  mongoURI,
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

//initializing GridFs storage to serve to multer middleware
const storage = new GridFsStorage({
  db: connection,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      const fileInfo = {
        filename: req.body.tag + "|" + Date.now(),
        bucketName: "gifs",
      };
      resolve(fileInfo);
    });
  },
});

const upload = multer({ storage });

//CRUD API ====>

// @route GET
// @desc Loads all
app.get("/", (req, res) => {
  gfs
    .collection("gifs")
    .find()
    .toArray()
    .then((results) => {
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
// @desc display gif name, this is useful to allow individual gif visualization
app.get("/gifs/:filename", (req, res) => {
  gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
    if (!file) {
      return res.status(404).json({
        err: "No file exists",
      });
    }
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
  gfs.remove(
    { _id: mongodb.ObjectId(req.params.id), root: "gifs" },
    (err, gridStore) => {
      if (err) {
        return res.status(404).json({ err: err });
      }
      res.redirect("/");
    }
  );
});
