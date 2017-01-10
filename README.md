#Node.js NHL Scrapr
This is a basic RESTful API which fetches event data and shift tables from the NHL's HTM tables and returns them as a handy-dandy JSON. The JSON is stored in the database, and every future GET request will simply fetch it from the db.

##End Points
```javascript
// fetch all game ids
$.JSON("/ids", function (data) {
  // do stuff
});

// fetch event JSON for game ID XXXXXX
$.JSON("/events/:id", function (data) {
  // do stuff
});

//fetch shift JSON for gameID (TH|TV)XXXXXX
$.JSON("/shifts/:id", function (data) {
  //do stuff
});
```

##Example
Here, I get the game IDs for Philadelphia for the 2016-2017 season using the /id endpoint. To specify a team, add the team's abbreviation in query form.
```javascript
// fetch all game ids for Philadelphia (PHI)
var idList;
$.JSON("/ids?team=PHI", function (data) {
  idList = data.map(function (game) {
    //game id comes in form YYYYXXXXXXX (integer)
    return {
      home: game.h === "PHI",
      id: ("0" + game.id % 1000000).slice(-6) // will give us last 6 digits including leading 0
    }
  })
});
```

Great! We now have a list of 6 digit ids stored for PHI, along with whether the game is home or away. Now, say we want to fetch the event data for their 7th game of the season...

```javascript
// 6th index is 7th entry
var idObject = idList[6];
var id = idObject.id;

$.JSON("/events/" + id, function (data) {
  // do something with the data;
});
```

Now, let's get the shift data for the same game. It's important to note that a prefix of either TH (home) or TV (visitor) is needed, along with the id, to get that data.

```javascript
var prefix = (idObject.home) ? "TH" : "TV";

$.JSON("/shifts/" + prefix + id, function (data) {
  // do something with shift data
});
```

### Example Shift Data
Actual shift data includes all players.
```json
"docs": [
    {
      "player": "9 PROVOROV, IVAN",
      "data": {
        "shifts": [
          {
            "shift": 1,
            "per": 1,
            "start": "0:27 / 19:33",
            "end": "1:00 / 19:00",
            "duration": "00:33",
            "event": " "
          },
          {
            "shift": 2,
            "per": 1,
            "start": "2:45 / 17:15",
            "end": "3:13 / 16:47",
            "duration": "00:28",
            "event": " "
          },
          {
            "shift": 3,
            "per": 1,
            "start": "5:44 / 14:16",
            "end": "6:33 / 13:27",
            "duration": "00:49",
            "event": " "
          },
        ]
      }
    }
  ]
```
