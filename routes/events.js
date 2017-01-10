var express = require('express');
var router = express.Router();

var request = require("request");
var jsdom = require("node-jsdom");

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/:id', function (req, res, next) {
  var id = req.params.id,
    db = req.db;

  var collection = db.get("eventtables");
  console.log("checking db...");
  collection.find({"game_id": id}, {}, function (err, docs) {
    if (docs.length > 0) {
      console.log("fetched from db");
      res.json(docs[0]);
    }
    else {
      loadShotResource(id, function (data) {
        if (collection) {
          console.log("inserting " + data.game_id + "...");
          var resp = collection.insert(data).success(function (resp) {
            console.log("successfully inserted");
          }).error(function (err) {
            console.log("error inserting", err);
          });
        }
        res.json(data);
      });
    }
  });

});

function loadShotResource (game_id, callback) {
  var url = "http://www.nhl.com/scores/htmlreports/20162017/PL" + game_id + ".HTM";
  request(url, (error, response, body) => {
    if (!error && response.statusCode == 200) {
      parse_shots(body, game_id, function (data) {
        callback(data);
      });
    }
    else {console.log("error loading");}
  });

}

function parse_shots (html, game_id, callback) {

  console.log("retrieved html");
  jsdom.env(html, function (err, window){
    var document = window.document;

    var headings = [].map.call([].slice.call(document.body.querySelectorAll("td.heading"), 0, 8), function (td) {
      return td.textContent.replace(/\s.*/g, "")
        .replace(/:.*/g, "")
        .replace(/\./g, "");
    });

    console.log(headings);

    var data = [],
      tempObj;
    [].forEach.call(document.body.querySelectorAll(".evenColor"), function (tr) {
      tempObj = {};
      var tdArray = tr.querySelectorAll("td.bborder");
      for (var x = 0; x < headings.length; x++) {
        // on ice table
        if (x === 6 || x === 7) {
          var cells = tdArray[x].querySelectorAll("table table tr td"),
            onIce = [];
          for (var i = 0; 2*i < cells.length; i++) {
            onIce.push(parseInt(cells[2*i].textContent.replace(/\n/g, "")));
          }
          tempObj[headings[x]] = onIce;
        }
        else if (x === 3) {
          tempObj[headings[x]] = tdArray[x].innerHTML.replace(/<br>.*/g, "");
        }
        else {
          tempObj[headings[x]] = tdArray[x].textContent.replace(/<br>.*/g, "");
        }
      }
      data.push(tempObj);
    });

    if (callback) {
      callback({game_id: game_id, data: data});
    }
  });
}

module.exports = router;
