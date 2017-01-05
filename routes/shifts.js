var express = require('express');
var router = express.Router();

var request = require("request");
var jsdom = require("node-jsdom");

/* GET users listing. */
router.get('/', function(req, res, next) {

  var db = req.db;
  var collection = db.get("shifttables");

  console.log("checking db...");
  collection.find({},{}, function (e, docs) {
    res.json(docs);
  });
});

/*
* fetch JSON from nhl resource for given game id
* id must also include: TV (visitor) or TH (home)
*/
router.get('/:id', function(req, res) {
  var id = req.params.id,
    db = req.db;

  var collection = db.get("shifttables");
  console.log("checking database...");
  collection.find({"game_id": req.params.id}, {}, function (e, results) {
    if (results.length > 0) {
      console.log("fetched from db");
      res.json(results[0]);
    }
    else {
      loadResource(id, function (data) {
        if (collection) {
          collection.insert(data);
        }
        res.json(data);
      });
    }
  });

  var loadResource = function (game_id, callback) {
    var url = "http://www.nhl.com/scores/htmlreports/20162017/" + id + ".HTM";

    request(url, (error, response, body) => {
      if (!error && response.statusCode == 200) {
        var json = parse(body, id, function (data) {

          callback(data);
        });
      }
    });
  };
});


var parse = function(html, game_id, callback) {
    jsdom.env(
        html,
        function (err, window) {
            var document = window.document;

            // grab player table
            var table = document.querySelectorAll("table table")[8];

            //create array of table headers, trim after first space
            var headerRow = [].map.call(table.querySelector("tr").nextSibling.nextSibling.querySelectorAll("td"), function (td) {
              html = td.innerHTML.replace(/\s.*/g, "")
                .replace(/<br>.*/g, "")
                .toLowerCase();
              return html;
            });

            // list of all players in string "# LAST, FIRST"
            var players = [].map.call(table.querySelectorAll("td.playerheading"), function (playerCell) {
              return {
                player: playerCell.textContent,
                data: {
                  shifts: []
                }
              };
            });

            var playerIndex = 0;
            [].forEach.call(table.querySelectorAll("tr.evenColor, tr.oddColor"), function (row) {

              //grab its td children
              var tds = row.querySelectorAll("td"),
                tempObj = {};

              // to prevent using tr of period summaries which have a length 7
              if (tds.length === 6) {
                // Check is Shift # is 1 --> new player
                if (tds[0].textContent === '1') {
                  playerIndex++;
                }

                // create shift object
                for (var x = 0; x < tds.length; x++) {
                  var content = tds[x].textContent;

                  // make numeric the period & shift numbers
                  if (isNum(content)) {
                    content = +content;
                  }
                  tempObj[headerRow[x]] = content;

                }

                // push shift object to appropriate player's shift array;
                try {
                  players[playerIndex-1].data.shifts.push(tempObj);
                }
                catch(err) {
                  console.log(err, playerIndex);
                }
              }
            });

            // callback on player data;
            if (callback)
              callback({game_id: game_id, docs: players});
        }
    );
};

function isNum(str) {
  return /^\d+$/.test(str);
}

module.exports = router;
