// server.js

// where your node app starts

// init project
const express = require('express');
const fs = require('fs')
const sql = require("sqlite3").verbose();
const FormData = require("form-data");


const app = express();
const assets = require('./assets');

app.use(express.json());

// Send a fixed file for now
let filename = '/images/bridge.jpg';

//======================== BUILDING DATABASE ===============================
// This creates an interface to the file if it already exists, and makes the 
// file if it does not. 
const PostcardTable = new sql.Database("postcards.db");

// Actual table creation; only runs if "postcards.db" is not found or empty
// Does the database table exist?
let cmd = " SELECT name FROM sqlite_master WHERE type='table' AND name='postcardTable' ";
PostcardTable.get(cmd, function (err, val) {
    console.log(err, val);
    if (val == undefined) {
        console.log("No database file - creating one");
        createPostcardTable();
    } else {
        console.log("Database file found");
    }
});

function createPostcardTable() {
  // explicitly declaring the rowIdNum protects rowids from changing if the 
  // table is compacted; not an issue here, but good practice
  const cmd = 'CREATE TABLE postcardTable ( id TEXT PRIMARY KEY UNIQUE, message TEXT, font TEXT, color TEXT, photo TEXT)';
  PostcardTable.run(cmd, function(err, val) {
    if (err) {
      console.log("Database creation failure",err.message);
    } else {
      console.log("Created database");
    }
  });
}
//===========================================================================
const getRandomQueryString= () => {
  return Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
}


// Multer is a module to read and handle FormData objects, on the server side
const multer = require('multer');

// Make a "storage" object that explains to multer where to store the images...in /images
let storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, __dirname+'/images')    
  },
  // keep the file's original name
  // the default behavior is to make up a random string
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})

// Use that storage object we just made to make a multer object that knows how to 
// parse FormData objects and store the files they contain
let uploadMulter = multer({storage: storage});

// First, server any static file requests
app.use(express.static('public'));

// Next, serve any images out of the /images directory
app.use("/images",express.static('images'));

// Next, serve images out of /assets (we don't need this, but we might in the future)
app.use("/assets", assets);

// Next, if no path is given, assume we will look at the postcard creation page
app.get("/", function (request, response) {
  response.sendFile(__dirname + '/public/index.html');
});

app.get("/", function (request, response) {
  response.sendFile(__dirname + '/public/index.html');
});

// // fire off the file upload if we get this "GET"
// app.get("/sendUploadToAPI", function(request, response){
//   console.log("ERROR hERE: filename is bridge? -> " + filename)
//   sendMediaStore(filename, request, response);
// });



// Next, handle post request to upload an image
// by calling the "single" method of the object uploadMulter that we made above
app.post('/upload', uploadMulter.single('newImage'), function (request, response) {
  // file is automatically stored in /images
  // WARNING!  Even though Glitch is storing the file, it won't show up 
  // when you look at the /images directory when browsing your project
  // until later (or unless you open the console (Tools->Terminal) and type "refresh").  
  // So sorry. 
    filename = request.file.originalname;
   let filepath = "/images/" + request.file.originalname;
  console.log("Recieved",request.file.originalname,request.file.size,"bytes")
  // the file object "request.file" is truthy if the file exists
  if(request.file) {
    sendMediaStore(filepath, request, response);
    // Always send HTTP response back to the browser.  In this case it's just a quick note. 
    // response.end("Server recieved "+request.file.originalname);
  }
  else throw 'error';
})
 
app.post('/sharePostcard', function(request, response){
  // fs.writeFile('postcardData.json', JSON.stringify(request.body), function(err){
  //     if(err) throw err;
  //     console.log("Wrote to postcardData: " + JSON.stringify(request.body));
  // })
  const url = getRandomQueryString();
  const message = request.body.message;
  const font = request.body.font;
  const color = request.body.color;
  const photo = filename;

  // put new item into database
  cmd = "INSERT INTO postcardTable ( id, message, font, color, photo) VALUES (?,?,?,?,?) ";
  PostcardTable.run(cmd, url, message, font, color, photo, function(err) {
    if (err) {
      console.log("DB insert error", err.message);
      //next();
    } else {
      console.log("Inserted new postcard to db with id: " + url);
      response.send(url);
    }
  });
  // response.end("Server received: " + response.body);
});


app.get("/sharePostcard", function(request, response){
  
  PostcardTable.get('SELECT * from postcardTable WHERE id= ?', request.query.id, function (err, rowData) {
    if(err){
      console.log('error: ', err.message);
    } else {
      console.log('got: ', rowData);
      response.send(rowData);
    }
  });
});

// function called when the button is pushed
// handles the upload to the media storage API
  function sendMediaStore(filename, serverRequest, serverResponse) {
    console.log('filename is ' + filename)
  console.log("Inside sendMediaStore()")
  let apiKey = process.env.ECS162KEY;
  if (apiKey === undefined) {
    serverResponse.status(400);
    serverResponse.send("No API key provided");
  } else {
    console.log("HERE")
    // we'll send the image from the server in a FormData object
    let form = new FormData();
    
    // we can stick other stuff in there too, like the apiKey
    form.append("apiKey", apiKey);
    // stick the image into the formdata object
    form.append("storeImage", fs.createReadStream(__dirname + filename));
    // and send it off to this URL
    
    form.submit("http://ecs162.org:3000/fileUploadToAPI", function(err, APIres) {
      // did we get a response from the API server at all?
      console.log(1)
      if (APIres) {
        console.log(2)
        // OK we did
        console.log("API response status", APIres.statusCode);
        // the body arrives in chunks - how gruesome!
        // this is the kind stream handling that the body-parser 
        // module handles for us in Express.  
        let body = "";
        APIres.on("data", chunk => {
          body += chunk;
        });
        APIres.on("end", () => {
          // now we have the whole body
          if (APIres.statusCode != 200) {
            serverResponse.status(400); // bad request
            serverResponse.send(" Media server says: " + body);
          } else {
            serverResponse.status(200);
            console.log(4)
            console.log(body)
            serverResponse.send(body);
          }
        });
      } else { // didn't get APIres at all
        console.log(3)
        serverResponse.status(500); // internal server error
        serverResponse.send("Media server seems to be down.");
      }
    });
  }
}


// listen for HTTP requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});


