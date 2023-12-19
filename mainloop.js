async function mainloop() {

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

window.requestAnimationFrame(mainloop);
