var keyState = {
  w: false,
  a: false,
  s: false,
  d: false,
  wDelay: false,
  sDelay: false,
};

function keydownHandler(e) {
  switch (e.key) {
    case "w":
    case "W":
      keyState.w = true;
      break;
    case "a":
    case "A":
      keyState.a = true;
      break;
    case "s":
    case "S":
      keyState.s = true;
      break;
    case "d":
    case "D":
      keyState.d = true;
      break;
  }
}

function keyupHandler(e) {
  switch (e.key) {
    case "w":
    case "W":
      keyState.w = false;
      break;
    case "a":
    case "A":
      keyState.a = false;
      break;
    case "s":
    case "S":
      keyState.s = false;
      break;
    case "d":
    case "D":
      keyState.d = false;
      break;
  }
}

//up down left right botton
document.addEventListener("DOMContentLoaded", function () {
  // Get references to the up, left, down, and right buttons
  var upButton = document.getElementById("up");
  var leftButton = document.getElementById("left");
  var downButton = document.getElementById("down");
  var rightButton = document.getElementById("right");

  // Add click event listeners to the buttons
  upButton.addEventListener("mousedown", (e) => { keyState.w = true; e.preventDefault(); });
  upButton.addEventListener("touchstart", (e) => { keyState.w = true; e.preventDefault(); });
  leftButton.addEventListener("mousedown", (e) => { keyState.d = true; e.preventDefault(); });
  leftButton.addEventListener("touchstart", (e) => { keyState.d = true; e.preventDefault(); });
  downButton.addEventListener("mousedown", (e) => { keyState.s = true; e.preventDefault(); });
  downButton.addEventListener("touchstart", (e) => { keyState.s = true; e.preventDefault(); });
  rightButton.addEventListener("mousedown", (e) => { keyState.a = true; e.preventDefault(); });
  rightButton.addEventListener("touchstart", (e) => { keyState.a = true; e.preventDefault(); });

  // Add release event listeners to the buttons
  upButton.addEventListener("mouseup", (e) => { keyState.w = false; e.preventDefault(); });
  upButton.addEventListener("touchend", (e) => { keyState.w = false; e.preventDefault(); });
  leftButton.addEventListener("mouseup", (e) => { keyState.d = false; e.preventDefault(); });
  leftButton.addEventListener("touchend", (e) => { keyState.d = false; e.preventDefault(); });
  downButton.addEventListener("mouseup", (e) => { keyState.s = false; e.preventDefault(); });
  downButton.addEventListener("touchend", (e) => { keyState.s = false; e.preventDefault(); });
  rightButton.addEventListener("mouseup", (e) => { keyState.a = false; e.preventDefault(); });
  rightButton.addEventListener("touchend", (e) => { keyState.a = false; e.preventDefault(); });
});

/*Math Function*/
// Convert degrees to radians
function d2r(degrees) {
  return degrees * (Math.PI / 180);
}

// Convert radians to degrees
function r2d(radians) {
  return radians * (180 / Math.PI);
}

// Calculate new coordinates given current coordinates, a heading, and a distance
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
  return {lat: lat, lng: lng};
}

function getPreviousCoordinates(preCoords) {
  var lat = preCoords.lat;
  var lng = preCoords.lng;
  return { lat: lat, lng: lng };
}

// coculate the difference between 2 points in a circle
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

/*Initial Entry*/
document.addEventListener("keydown", keydownHandler, { passive: true });
document.addEventListener("keyup", keyupHandler, { passive: true });

// Register main update loop
window.requestAnimationFrame(mainloop);

// References to important JS objects
var map;
var streetView;
var svService;
var marker;
// Default view direction
var pov = { heading: 90, pitch: 0 };
// Start in Paris
var coords = { lat: 40.44460773097255, lng: -79.9445135945247 };
//get foward and back links
var fowardLinkPanoID;
var backLinkPanoID;

//foward and backward status
var fowardStatus = false;
var backwardStatus = false;




function initMap() {

  // Map panel
  map = new google.maps.Map(document.getElementById('map'), {
    center: coords,
    zoom: 15, // Reasonable zoom level for our requirements
    streetViewControl: false // No pegman button
  });
  map.setOptions({
    disableDefaultUI: true,
    draggable: false,
    scrollwheel: false,
    keyboardShortcuts: false
  });
  
  // Show valid Street View locations in a blue overlay on the map
  var streetViewLayer = new google.maps.StreetViewCoverageLayer();
  streetViewLayer.setMap(map);
  
  // Street view panel
  streetView = new google.maps.StreetViewPanorama(document.getElementById("streetView"));
  streetView.setZoom(0);
  streetView.setOptions({
    disableDefaultUI: true, // Remove all controls: compass, zoom etc
    scrollwheel: false, // Disable zooming using the scroll wheel
    panControl: false,
    fullscreenControl: true,
    linksControl: true
  });

  // Hook to communicate with the street view data provider service
  svService = new google.maps.StreetViewService();

    // Set the initial Street View camera to near the starting coordinates
  svService.getPanorama({ location: coords, radius: 10 }, processSVData);
  resizeStreetView()
}

//check whether the links of data are the same as the previous links
var sortedLinks;
var checkRepeationLinks;

function processSVData(data, status) {
  return new Promise((resolve, reject) => {
  if (status === google.maps.StreetViewStatus.OK) {

    var adjacentLinks = data.links;

    checkRepeationLinks = adjacentLinks;

    console.log("processSVData");

    //print data.links
    for (var i = 0; i < adjacentLinks.length; i++) {
      console.log(i, "is", adjacentLinks[i]);
    }


    // sort links based on the difference between adjacentPov and the link heading
    sortedLinks = adjacentLinks
      .map((link) => ({
        link: link,
        difference: getDifference(pov.heading, link.heading)
      }))
      .sort((a, b) => a.difference - b.difference)
      .map((item) => item.link);

    //When reach the boundary, it will give an alarm
    if (sortedLinks.length == 1) {
      swal("Out of Boundary, Already turn back", { timer: 2000, });
    }  


    for (var i = 0; i < sortedLinks.length; i++) {
      console.log(i, "sortedLinks is", sortedLinks[i], pov);
    }

    fowardLinkPanoID = sortedLinks[0].pano;
    console.log("fowardLinkPanoID_Heading", sortedLinks[0].heading);


    backLinkPanoID = sortedLinks[sortedLinks.length - 1].pano;
    console.log("backLinkPanoID_Heading", sortedLinks[sortedLinks.length - 1].heading);


    console.log("fowardLinkPanoID", fowardLinkPanoID);
    console.log("backLinkPanoID", backLinkPanoID);

    if (fowardStatus) {
      streetView.setPano(fowardLinkPanoID);
      pov.heading = sortedLinks[0].heading;
      // streetView.setPov(pov);
      fowardStatus = false;
      console.log("foward");
    }
    else if (backwardStatus) {
      streetView.setPano(backLinkPanoID);
      // pov.heading = sortedLinks[sortedLinks.length - 1].heading;
      // streetView.setPov(pov);
      backwardStatus = false;
      console.log("backward");
    }
    else {
      streetView.setPano(data.location.pano);
      // streetView.setPov(pov);
    }

    //create marker
    const arrowIcon = {
      path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
      fillColor: 'blue',
      fillOpacity: 1,
      scale: 4,
      strokeColor: 'blue',
      strokeWeight: 2,
      rotation: pov.heading
    };
    
    // Create or update map marker. 
    if(marker == null) {
      marker = new google.maps.Marker({
        position: data.location.latLng,
        map: map,
        clickable: true,
        icon: arrowIcon,
        zIndex: 10
      });
    } else { 
      // Update marker position and heading.
      marker.setIcon(arrowIcon);
      marker.setPosition(data.location.latLng);
    }



  } else {
    console.error('Street View data not found for this location.');
  }
  });
}

// Adjust the Street View panel size when the window size changes.
function resizeStreetView() {
  const streetView = document.getElementById("streetView");
  streetView.style.width = window.innerWidth + "px";
  streetView.style.height = window.innerHeight + "px";
  // Initialize the Street View when the panel is resized
}

//maintain all pov.heading between 0 to 360
function normalPov(heading) {
  var temHeading = heading;
  var multiple;
  if (heading < 0) {
    if (heading < -360) {
      multiple = -(temHeading) / 360;
      heading = heading + (1 + multiple) * 360;
    }
    else {
      heading = heading + 360;
    }
  }
  if (heading > 360) {
    multiple = temHeading / 360;
    heading = (heading - multiple * 360);
  }
  pov.heading = heading;
}

// Add a listener to update the Street View panel size when the window is resized.
window.addEventListener("resize", resizeStreetView);

// Initialize the Street View when the page loads.
window.addEventListener("load", streetView);


/*Main Function*/
async function mainloop() {
  // console.log(keyState);

  if (!streetView) {
    window.requestAnimationFrame(mainloop);
    return;
  }

  if (keyState.w && !keyState.wDelay && !fowardStatus) {
    keyState.wDelay = true;

    setTimeout(() => {
      keyState.wDelay = false;
      // Handle W key
      console.log("w");
      fowardStatus = true;
      svService.getPanorama({ pano: fowardLinkPanoID }, processSVData);
    }, 500);
  }
  if (keyState.a) {
    // Handle A key
    normalPov(pov.heading);
    pov.heading -= 1;
    console.log("a + heading", pov.heading);
  }
  if (keyState.s && !keyState.sDelay && !backwardStatus) {
    keyState.sDelay = true;
    setTimeout(() => {
      keyState.sDelay = false;
      // Handle S key
      console.log("s")
      backwardStatus = true;
      if (sortedLinks.length == 1) {
        swal("Out of Boundary, Already turn back", { timer: 2000, });
      }
      svService.getPanorama({ pano: backLinkPanoID }, processSVData);
    }, 500);
  }
  if (keyState.d) {
    // Handle D key
    normalPov(pov.heading);
    pov.heading += 1;
    console.log("d + heading", pov.heading);
  }

  // Clamp pitch value to +/- 20 so you don't end up looking at your feet or the sky
  if (pov.pitch > 20) {
    pov.pitch = 20;
  }
  if (pov.pitch < -20) {
    pov.pitch = -20;
  }
  pov.pitch *= 0.95; // Automatically drift pitch back to level

  // Simple rotation of steering wheel based on controller input
  // document.getElementById("wheel").style.transform = "rotate(" + (-pov.heading) + "deg)";

  // Simple map
  document.getElementById("map").style.transform = "rotate(" + pov.heading + "deg)";

  streetView.setPov(pov);

  window.requestAnimationFrame(mainloop);
}

