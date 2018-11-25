var parseBusArrive = function(arrives){
    // Always upper case the description string
    console.log(arrives.lineId + ' ' + arrives.destination + ' ' + arrives.busTimeLeft);
    var lineId = arrives.lineId;
    var destination = arrives.destination;

    // Get date/time substring
    var busTimeLeft = arrives.busTimeLeft;
    if(busTimeLeft == 999999){
        busTimeLeft = 20;  
    }else{
        busTimeLeft = Math.round(busTimeLeft / 60); 
    }
    // Add to menu items array
    return {
      title: lineId + ' \u2192 ' + busTimeLeft.toString() + "min." ,
      subtitle: destination,
      icon: 'IMAGE_RESULTS'
    };
};

var parseRealTime = function(data, size){
    var items = [];
    if(!('arrives' in data)){
        items.push({
            title: "No encontrada"
        });
        return items;
    }
    // TODO When only one result in arrives, the field is a object instead
    // an array
    if( Object.prototype.toString.call(data.arrives) === '[object Array]' ) {
        if(size > data.arrives.length){
            size = data.arrives.length;
        }
        for(var i = 0; i < size; i++) {
            items.push(parseBusArrive(data.arrives[i]));
        }
    }else{
        items.push(parseBusArrive(data.arrives));
    }
    return items;
};

var parseStop = function(stop){
    // returns object title subtitle
    var lines = "";
    if( Object.prototype.toString.call(stop.line) === '[object Array]' ) {
        for(var i = 0; i < stop.line.length; i++) {
            if(i === 0){
                lines += stop.line[i].line;
            }else{
                lines += ", " + stop.line[i].line;
            }
        }
    } else {
        //
        lines += stop.line.line;
    }
    console.log(stop.stopId + "  " + stop.name + " " + lines);
    return {
        title: stop.name,
        subtitle: lines + "  (Parada: " + stop.stopId + ")"
        // stopId: stop.stopId
    };
};

var parseStops = function(data, size){
    var items = [];
    if(!('stop' in data)){
        items.push({
            title: "No encontrada"
        });
        return items;
    }
    // We need to know if its an object or a list
    if( Object.prototype.toString.call(data.stop) === '[object Array]' ) {
        if(size > data.stop.length){
            size = data.stop.length;
        }
        for(var i = 0; i < size; i++) {
            items.push(parseStop(data.stop[i]));
        }
    } else { 
        items.push(parseStop(data.stop));
    }
    return items;
};


module.exports = {
    parseStops: parseStops,
    parseRealTime: parseRealTime
};
