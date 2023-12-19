function d2r(degrees) {
    return degrees * (Math.PI / 180);
}

function r2d(radians) {
    return radians * (180 / Math.PI);
}

function getNewCoordinates(coords, heading, distance) {
    // Current coordinates
    var lat = coords.lat;
    var lng = coords.lng;


    // Calculate deviation in meters
    var dx = Math.sin(d2r(heading)) * distance;
    var dy = Math.cos(d2r(heading)) * distance;

    // Calculate deviation in degrees lat/long
    var dlng = dx / (111111.1 * Math.cos(d2r(lat)));
    var dlat = dy / 111111.1;

    // Calculate new lat/long
    lat += dlat;
    lng += dlng;

    // Return new coordinate
    return { lat: lat, lng: lng };
}

function getDifference(point1, point2) {
    var dif = point1 - point2;
    if (point1 - point2 < 0) {
        dif = point2 - point1;
    }
    if (dif > 180) {
        dif = 360 - dif;
    }
    console.log("dif", dif);

    return dif;
}
