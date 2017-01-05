var express = require('express');
var router = express.Router();

var request = require("request");



router.get('/', function(req, res, next) {
  var url = "http://live.nhl.com/GameData/SeasonSchedule-20162017.json";

  var db = req.db;
  var collection = db.get("id_list");

  console.log("checking db...");
  collection.find({},{}, function (e, docs) {
    if (docs.length === 0) {
      console.log("not found in db. fetching...");
      request({
          url: url,
          json: true
        }, (error, response, json) => {
          if (!error && response.statusCode == 200) {
            collection.insert(json);
            res.json(json);
          }
          else {res.send(error);}
        }
      );
    }
    else {
      console.log("fetched from db");
      res.json(docs);
    }
  });
});

module.exports = router;
