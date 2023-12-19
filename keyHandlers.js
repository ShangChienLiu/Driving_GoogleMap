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

document.addEventListener("keydown", keydownHandler, { passive: false });
document.addEventListener("keyup", keyupHandler, { passive: false });
