// $.getJSON( '/ids?team=PHI', function( data ) {
//   var ids = data.map(function (game) {
//     var prefix = game.h === "PHI" ? "TH" : "TV";
//     return prefix + ("0" + game.id % 1000000).slice(-6);
//   });
//   getGameShifts( ids[8] );
// });
//
//
// function getGameShifts(id) {
//   var gameObj;
//   var start = new Date()*1;
//
//   $.getJSON('/shifts/'+id, function (data) {
//     console.log( new Date() * 1 - start);
//     gameObj = data;
//   });
// }
