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

    marker = new google.maps.Marker({
        position: coords,
        map: map,
        icon: {
            path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
            fillColor: 'blue',
            fillOpacity: 1,
            scale: 4,
            strokeColor: 'blue',
            strokeWeight: 2,
            rotation: pov.heading
        },
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
        fullscreenControl: false,
        clickableIcons: false,
        linksControl: true
    });

    var controlsDiv = document.getElementById('control-wrapper');
    streetView.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(controlsDiv);

    var mapPanelDiv = document.getElementById('mapPanel');
    streetView.controls[google.maps.ControlPosition.TOP_LEFT].push(mapPanelDiv);

    // var fullscreenDiv = document.getElementById('fullscreen');
    // streetView.controls[google.maps.ControlPosition.TOP_RIGHT].push(fullscreenDiv);


    // Hook to communicate with the street view data provider service
    svService = new google.maps.StreetViewService();

    // Set the initial Street View camera to near the starting coordinates
    svService.getPanorama({ location: coords, radius: 10 }, processSVData);
    resizeStreetView()

}

function resizeStreetView() {
    const streetView = document.getElementById("streetView");
    streetView.style.width = window.innerWidth + "px";
    streetView.style.height = window.innerHeight + "px";
    // Initialize the Street View when the panel is resized
}

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

function isMarkerInView(marker, map) {
    const mapBounds = map.getBounds();
    if (mapBounds) {
        const markerPosition = marker.getPosition();
        return mapBounds.contains(markerPosition);
    }
    return true;
}

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
                fowardStatus = false;
                console.log("foward");
            }
            else if (backwardStatus) {
                streetView.setPano(backLinkPanoID);

                backwardStatus = false;
                console.log("backward");
            }
            else {
                streetView.setPano(data.location.pano);
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
            if (marker == null) {
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
                marker.rotation = pov.heading;
            }

            // Check if marker is within the map's view bounds.
            if (isMarkerInView(marker, map)) {
                // If marker is not in view, recenter the map at the marker's position.
                map.setCenter(marker.getPosition());
            }


        } else {
            console.error('Street View data not found for this location.');
        }
    });

}

window.addEventListener("resize", resizeStreetView);
window.addEventListener("load", streetView);
