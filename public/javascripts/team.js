var Team = (function ( args ) {
  var asynchFlag = {
    events: false,
    shifts: false
  };

  var meta = {
    abbr: args.abbr,
    name: args.name,
    city: args.city,
  };

  var game_temp = {};

  var funcs = {
    getShifts: function (gameNum, callback) {
      var gameObj = meta.gameIDs[gameNum];
      console.log("/shifts/"+gameObj.prefix + gameObj.id);
      $.getJSON("/shifts/"+gameObj.prefix + gameObj.id, function (data) {
        console.log("shifts");
        game_temp.shifts = data;
        asynchFlag.shifts = true;
        if (asynchFlag.events && callback) {
          callback(game_temp);
        }
      });
    },
    getEvents: function (gameNum, callback) {
      var gameObj = meta.gameIDs[gameNum];
      console.log("/events/" + gameObj.id);

      $.getJSON("/events/" + gameObj.id, function (data) {
        console.log("events");
        game_temp.events = data;
        asynchFlag.events = true;
        if (asynchFlag.shifts && callback) {
          callback(game_temp);
        }
      });
    },
  };

  var init = function () {

  };

  return {
    retrieveIDs: function (callback) {
      if (meta.abbr) {
        $.getJSON("/ids?team="+meta.abbr, function (data) {
          // will return {prefix: "TH" or "TV", id: YYYYXXXXXXX}
          meta.gameIDs = data.map(function (game) {
            var prefix = game.h === "PHI" ? "TH" : "TV";
            return {prefix: prefix, id: ("0" + game.id % 1000000).slice(-6), year: ~~(game.id/1000000) };
          });

          if (callback) callback();
        });
      }
      return this;
    },
    // get a shot and shift data for game
    getData: function (gameNum, callback) {
      funcs.getEvents(gameNum, callback);
      funcs.getShifts(gameNum, callback);
    },
    loadRange: function (lo, hi, callback) {
      var counter = 0;

      for (var x = lo; x <= hi; x++) {
        this.getData(x, anonymousFunc);
      }

    }
  };
});

var phi = new Team({
  "abbr": "PHI",
  "name": "Flyers",
  "city": "Philadelphia"
});

phi.retrieveIDs( function () {
  phi.getData(41, function (data) {
    console.log(data);
  });
});
