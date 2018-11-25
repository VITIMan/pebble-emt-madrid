/**
 * EMT Pebble app
 *
 * This is where you write your app.
 */
////////////////////////////////////// UTIL FUNCTIONS
////////////////////////////////////// END UTIL FUNCTIONS

var UI = require('ui');
var Vector2 = require('vector2');
var safe = require('safe');

// project imports
var Api = require('api');


console.log("Starting BUS Madrid");
var main = new UI.Window({ 
    fullscreen: true,
});
var splash_image = new UI.Image({
    position: new Vector2(8, 8),
    size: new Vector2(28, 28),
    image: 'IMAGE_MENU_ICON'
});
var arrow_central = new UI.Image({
    position: new Vector2(123, 79),
    size: new Vector2(7, 11),
    image: 'IMAGE_ARROW'
});
var arrow_down = new UI.Image({
    position: new Vector2(123, 130),
    size: new Vector2(7, 11),
    image: 'IMAGE_ARROW'
});
var close_stops = new UI.Text({
    position: new Vector2(0, 60),
    size: new Vector2(110, 30),
    font: 'gothic-18-bold',
    text: 'Paradas cercanas a ti',
    textAlign: 'center',
    color: 'black'
});
var search_stops = new UI.Text({
    position: new Vector2(0, 115),
    size: new Vector2(110, 50),
    font: 'gothic-18-bold',
    text: 'Por número de parada',
    textAlign: 'center',
    color: 'black'
});
var textfield = new UI.Text({
    position: new Vector2(43, 6),
    size: new Vector2(95, 13),
    font: 'gothic-24-bold',
    text: 'BUS MADRID',
    textAlign: 'left',
    color: '#0052a5'
});
var full_screen = new UI.Rect({ size: new Vector2(144, 168) });
var highlight = new UI.Rect({ 
    position: new Vector2(67, 36), 
    size: new Vector2(37, 1),
    backgroundColor: '#0052a5'});

main.add(full_screen);
main.add(close_stops);
main.add(search_stops);
main.add(highlight);
main.add(splash_image);
main.add(arrow_central);
main.add(arrow_down);
main.add(textfield);

main.show();

main.on('click', 'up', function(e) {
});

main.on('click', 'select', function(e) {
    var wind = new UI.Window({
        fullscreen: true,
    });
    var textfield = new UI.Text({
        position: new Vector2(0, 50),
        size: new Vector2(144, 50),
        font: 'gothic-24-bold',
        text: 'Obteniendo paradas cercanas a ti',
        textAlign: 'center'
    });
    var busText = new UI.Text({
        position: new Vector2(0, 50),
        size: new Vector2(144, 50),
        font: 'gothic-24-bold',
        text: 'El próximo bus llega...',
        textAlign: 'center'
    });
    wind.add(textfield);
    wind.show();


    var printBuses = function(menuItems, idStop){
        var resultsMenu = new UI.Menu();
        var section = {
            title: "Parada " + idStop,
            items: menuItems,
        };
        resultsMenu.selection(0, 0);
        resultsMenu.section(0, section);
        resultsMenu.on('select', function(e) {
            console.log('item:' + e.itemIndex + ',section:' + e.sectionIndex + ',title:' + e.item.title);
        });
        resultsMenu.show();
        wind.hide();
    };

    var printStops = function(menuItems){
        /* 
         * Print items, need the above context
         */
        var resultsMenu = new UI.Menu();
        var section = {
            title: "Paradas cercanas a ti",
            items: menuItems
        };
        resultsMenu.selection(0, 0);
        resultsMenu.section(0, section);
        resultsMenu.on('select', function(e) {
            
            wind.remove(textfield);
            wind.add(busText);
            wind.show();
            console.log('item:' + e.itemIndex + ',section:' + e.sectionIndex + ',title:' + e.item.title);
            // in this event we need the printBuses
            Api.getBuses(e.item.subtitle.match(/\(Parada: (\d+)\)/)[1], printBuses, errorConnection);
        });
        resultsMenu.show();
        wind.hide();
    };

    var errorConnection = function(err){
        /*
         * Error connection server, card removed
         */
        if (!err){
            // Do something with some_variable
            console.log("Cannot connect to server");
        } else {
            var errorCode = err.hasOwnProperty(name) ? err[name] : "UNKNOWN"; 
            console.log('location error (' + errorCode + '): ' + err.message);
        }
        textfield.text("Error al conectar con servidor");
    };

    console.log("receiving location...");
    navigator.geolocation.getCurrentPosition(
        function(pos){
            // Oficina Qindel
            // pos.coords.latitude = 40.449493;
            // pos.coords.longitude = -3.677787;
            // N. Ministerios
            // pos.coords.latitude = 40.446201;
            // pos.coords.longitude = -3.691317;
            // Murcia
            // pos.coords.latitude = 37.983;
            // pos.coords.longitude = -1.133;
            Api.locationSuccess(pos, printStops, errorConnection);
        }, 
        function(err){
            if (!err){
                console.log('unknown error when retrieving location');
            }else{
                console.log('location error (' + err.code + '): ' + err.message);
                // TODO Return a window saying the problem
            }
            textfield.text("No ha sido posible localizar");
            
        }, Api.locationOptions);
});

var createDigitNumbers = function(numDigits){
    var digits = [];
    var separation = 24;
    var position = 30;
    for(var i = 0; i < numDigits; i++) {
        var digit = new UI.Text({
            position: new Vector2(position + i * separation, 70),
            size: new Vector2(16, 32),
            text: 0,
            font: 'GOTHIC_28_BOLD',
            color: 'indigo',
            textOverflow: 'wrap',
            textAlign: 'left',
            backgroundColor: 'white'
        });
        digits.push(digit);
    }
    return digits;
};


main.on('click', 'down', function(e) {
    var titleText = new UI.Text({
        position: new Vector2(0, 10),
        size: new Vector2(144, 50),
        font: 'gothic-24-bold',
        text: 'Introduce número de parada',
        color: 'white',
        textAlign: 'center'
    });
    // splash window during getting data
    var wind = new UI.Window();
    var resultsMenu = new UI.Menu();

    var status = 0;

    // Text element to inform user
    var digits = createDigitNumbers(4);
    // TODO Mix together
    var values = [0, 0, 0, 0];
    var finalNumber = "";
    var COLOR_SELECTED = 'yellow';

    wind.add(titleText);
    for(var i = 0; i < digits.length; i++){
        // console.log(digits[i].text);
        finalNumber += digits[i].text();
        wind.add(digits[i]);
    }
    console.log(finalNumber);
    wind.show();

    var windLoad = new UI.Window({
        fullscreen: true,
    });
    var textBus = new UI.Text({
        position: new Vector2(0, 50),
        size: new Vector2(144, 50),
        font: 'gothic-24-bold',
        text: 'El próximo bus llega...',
        textAlign: 'center'
    });
    windLoad.add(textBus);

    var printBuses = function(menuItems, idStop){
        // TODO It's the same REFACTOR!!!
        console.log(menuItems);
        var section = {
            title: "Parada " + idStop,
            items: menuItems,
        };
        resultsMenu.section(0, section);
        resultsMenu.on('select', function(e) {
            console.log('item:' + e.itemIndex + ',section:' + e.sectionIndex + ',title:' + e.item.title);
        });
        resultsMenu.show();
        windLoad.hide();
    };

    var errorConnection = function(err){
        /*
         * Error connection server, card removed
         */
        if (!err){
            // Do something with some_variable
            console.log("Cannot connect to server");
        } else {
            var errorCode = err.hasOwnProperty(name) ? err[name] : "UNKNOWN"; 
            console.log('location error (' + errorCode + '): ' + err.message);
        }
        var windError = new UI.Window();
        windError.add(titleText.text("Error al conectar con servidor"));
        windError.show();
        windLoad.hide();
    };

    // Initial digit
    digits[status].backgroundColor(COLOR_SELECTED);

    wind.on('click', 'select', function(e){
        if(status == digits.length - 1){
            // get the final value and invoke getBuses
            var idStop = "";
            for(var i = 0; i < digits.length; i++){
                // console.log(digits[i].text);
                idStop += digits[i].text();
            }
            console.log("request stop:" + idStop);
            // TODO Show loading screenma
            wind.hide();
            windLoad.show();
            Api.getBuses(idStop, printBuses, errorConnection);
        }else{
            console.log("selected digit:" + status + ",value:" + digits[status].text());
            status++;

            digits[status].backgroundColor(COLOR_SELECTED);
            digits[status-1].backgroundColor('white');
        }
    });

    wind.on('click', 'up', function(e){
        ++values[status];
        if(values[status] % 10 === 0){
            values[status] = 0;
        }
        digits[status].text(values[status]);
    });

    wind.on('click', 'down', function(e){
        // Think about it
        --values[status];
        if(values[status] < 0){
            values[status] = 9;
        }else if(values[status] % 10 === 0){
            values[status] = 0;
        }
        digits[status].text(values[status]);
    });
});
