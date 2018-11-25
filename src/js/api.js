// Pebblejs imports
var ajax = require('ajax');

// project imports
var Parsers = require('parsers');
var Utils = require('utils');

// Constants
var URL = "https://openbus.emtmadrid.es:9443/emt-proxy-server/last/";
var URL = "http://128.199.44.46/";
// Config related to EMT connection
var PEBBLE_TOKEN = "PEBBLE::" + Pebble.getAccountToken();

var locationOptions = {
  enableHighAccuracy: true, 
  maximumAge: 10000, 
  timeout: 10000,
};

function locationSuccess(pos, printItems, errorConnection){
    /*
     * Callback from success location retrieved
     */
    console.log('Got coords: lat=' + pos.coords.latitude + ',lon=' + pos.coords.longitude);
    var uri = 'geo/GetStopsFromXY.php';
    var menuItems = [];

    var final_uri = URL + uri + '?' + Utils.serialize(Utils.merge_options(
        {"id_user": PEBBLE_TOKEN,
         "latitude": pos.coords.latitude,
         "longitude": pos.coords.longitude,
         "Radius": 100,
         "raw": 1}));
    console.log(final_uri);
    ajax({
        url: final_uri,
        headers: {"Content-Type": "application/x-www-form-urlencoded"},
        type: undefined
        // probably add cache argument in milisseconds... check docs
        // https://developer.getpebble.com/docs/pebblejs/#ajax
    }, function(data){
        // console.log(data);
        parsed_data = JSON.parse(data);
        printItems(Parsers.parseStops(parsed_data, 10));
    }, function(err){
        errorConnection(err);
    });
}
var locationError = function(err) {
    if (!err){
        console.log('unknown error when retrieving location');
    }else{
        console.log('location error (' + err.code + '): ' + err.message);
    }
};

///////////////////////////
function getBuses(idStop, printItems, errorConnection){
    /*
     * Refactor with locationSuccess
     */
    console.log(idStop);
    var uri = 'geo/GetArriveStop.php';
    
    var final_uri = URL + uri + '?' + Utils.serialize(Utils.merge_options(
        {"id_user": PEBBLE_TOKEN,
         "raw": 1,
         "idStop": idStop}));
    console.log(final_uri);
    // If you wish to send form encoded data and parse json, leave type undefined and use JSON.decode to parse the response data.
    ajax({
        url: final_uri, 
        // headers: {"Content-Type": "application/x-www-form-urlencoded"}
        type: undefined, 
        // probably add cache argument in milisseconds... check docs
        // https://developer.getpebble.com/docs/pebblejs/#ajax
    },
    function(data) {
        // console.log(data);
        parsed_data = JSON.parse(data);
        printItems(Parsers.parseRealTime(parsed_data, 10), idStop);
    },
    function(error) {
        errorConnection(error);
    });
}

module.exports = {
    locationSuccess: locationSuccess,
    locationError: locationError,
    getBuses: getBuses,
    locationOptions: locationOptions
};
