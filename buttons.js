document.addEventListener("DOMContentLoaded", function () {
    // Get references to the up, left, down, and right buttons
    var upButton = document.getElementById("up");
    var leftButton = document.getElementById("left");
    var downButton = document.getElementById("down");
    var rightButton = document.getElementById("right");
    var fullscreenButton = document.getElementById("fullscreen");


    //if is fullscreen, change fullscreenButton content to "點此結束" else "點此開始體驗"
    document.addEventListener("fullscreenchange", function () {
        var fullscreenButton = document.getElementById("fullscreenButton");
        if (document.fullscreenElement) {
            fullscreenButton.innerText = "點此結束";
        } else {
            fullscreenButton.innerText = "點此開始";
        }
    });

    // Add click event listeners to the fullscreen buttons
    fullscreenButton.addEventListener("click", (e) => {
        if (document.fullscreenElement) {
            document.exitFullscreen();
            console.log("Exiting fullscreen");
            // hide #control-wrapper #mapPanel id
            document.getElementById("control-wrapper").style.display = "none";
            document.getElementById("mapPanel").style.display = "none";
        } else {
            document.documentElement.requestFullscreen();
            document.getElementById("control-wrapper").style.display = "block";
            document.getElementById("mapPanel").style.display = "block";
        }
        e.preventDefault();
    });

    // Add click event listeners to the buttons
    upButton.addEventListener("mousedown", (e) => { keyState.w = true; e.preventDefault(); });
    upButton.addEventListener("touchstart", (e) => { keyState.w = true; e.preventDefault(); });
    leftButton.addEventListener("mousedown", (e) => { keyState.a = true; e.preventDefault(); });
    leftButton.addEventListener("touchstart", (e) => { keyState.a = true; e.preventDefault(); });
    downButton.addEventListener("mousedown", (e) => { keyState.s = true; e.preventDefault(); });
    downButton.addEventListener("touchstart", (e) => { keyState.s = true; e.preventDefault(); });
    rightButton.addEventListener("mousedown", (e) => { keyState.d = true; e.preventDefault(); });
    rightButton.addEventListener("touchstart", (e) => { keyState.d = true; e.preventDefault(); });

    // Add release event listeners to the buttons
    upButton.addEventListener("mouseup", (e) => { keyState.w = false; e.preventDefault(); });
    upButton.addEventListener("touchend", (e) => { keyState.w = false; e.preventDefault(); });
    leftButton.addEventListener("mouseup", (e) => { keyState.a = false; e.preventDefault(); });
    leftButton.addEventListener("touchend", (e) => { keyState.a = false; e.preventDefault(); });
    downButton.addEventListener("mouseup", (e) => { keyState.s = false; e.preventDefault(); });
    downButton.addEventListener("touchend", (e) => { keyState.s = false; e.preventDefault(); });
    rightButton.addEventListener("mouseup", (e) => { keyState.d = false; e.preventDefault(); });
    rightButton.addEventListener("touchend", (e) => { keyState.d = false; e.preventDefault(); });
});
