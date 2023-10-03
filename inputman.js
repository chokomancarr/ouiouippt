import * as util from "./util.js"

export const EV_IGNORE = 0;
export const EV_MV_LEFT = 1;
export const EV_MV_RIGHT = 2;
export const EV_IGNORE_ALL = 3;
export const EV_RT_CCW = 3;
export const EV_RT_CW = 4;
export const EV_SOFTDROP = 5;
export const EV_HARDDROP = 6;
export const EV_HOLD = 7;

export var keymap = {};

export let inputbuf = new Set();

let _reading_all = false;
export function set_reading(b) {
    _reading_all = b;
}

let inputmap_buttons = Array.from(document.getElementsByClassName("inputmap_item"));
let listening_input = -1;

export function reset_keymap() {
    keymap = {
        "ArrowLeft": EV_MV_LEFT,
        "ArrowRight": EV_MV_RIGHT,
        "KeyZ": EV_RT_CCW,
        "KeyX": EV_RT_CW,
        "ArrowDown": EV_SOFTDROP,
        "Space": EV_HARDDROP,
        "ShiftLeft": EV_HOLD
    };
}

export function init() {
    document.addEventListener("keydown", _onkeydown);
    document.addEventListener("keyup", _onkeyup);
    
    let _map = util.cookie_get("inputmap");
    if (_map !== null) {
        keymap = JSON.parse(_map);
    }
    else {
        reset_keymap();
    }
    
    Object.entries(keymap).forEach(([k, v], i) => {
        inputmap_buttons[v-1].innerText = k;
    });
    
    inputmap_buttons.forEach((e, i) => {
        e.addEventListener("click", e => {
            if (listening_input === -1) {
                listening_input = i;
                e.target.innerHTML = "<i>listening...</i>";
            }
        });
    });
    
    document.getElementById("inputmap_save").addEventListener("click", _ => {
        if (listening_input === -1)
            util.cookie_set("inputmap", JSON.stringify(keymap));
    });
    document.getElementById("inputmap_reset").addEventListener("click", _ => {
        if (listening_input === -1) {
            let _map = util.cookie_get("keymap");
            if (_map !== null) {
                keymap = JSON.parse(_map);
            }
            else {
                reset_keymap();
            }
            
            Object.entries(keymap).forEach(([k, v], i) => {
                inputmap_buttons[i].innerText = k;
            });
        }
    });
}

function _onkeydown(e) {
    if (e.repeat === true) return;
    if (listening_input > -1) {
        let old = Object.entries(keymap).find(([k,v]) => v === listening_input + 1);
        delete keymap[old];
        inputmap_buttons[listening_input].innerText = e.code;
        keymap[e.code] = listening_input + 1;
        listening_input = -1;
    }
    else {
        let cd = keymap[e.code] ?? EV_IGNORE;
        if (!_reading_all && (cd >= EV_IGNORE_ALL)) return;
        inputbuf.add(cd);
    }
}
function _onkeyup(e) {
    inputbuf.delete(keymap[e.code] ?? EV_IGNORE);
}