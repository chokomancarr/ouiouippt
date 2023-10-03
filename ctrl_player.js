import * as input from "./inputman.js"
import * as hnd from "./handling.js"

let charge_l = 0;
let charge_r = 0;
let delay_l = 0;
let delay_r = 0;
let delay_d = 0;
let handled_hd = false;
let handled_cw = false;
let handled_ccw = false;
let handled_hl = false;

let board = null;

export function init(bd) {
    board = bd;
}

export function update() {
    if (input.inputbuf.has(input.EV_MV_LEFT)) {
        if (charge_l < hnd.NF_DAS) {
            charge_l += 1;
        }
        else if (delay_l > 0) {
            delay_l -= 1;
        }
    }
    else {
        charge_l = 0;
        delay_l = 0;
    }
    if (input.inputbuf.has(input.EV_MV_RIGHT)) {
        if (charge_r < hnd.NF_DAS) {
            charge_r += 1;
        }
        else if (delay_r > 0) {
            delay_r -= 1;
        }
    }
    else {
        charge_r = 0;
        delay_r = 0;
    }
    
    if (board.active_piece === null) {
        input.set_reading(false);
        return;
    }
    input.set_reading(true);
    
    if (charge_l === 1) {
        board.move_active_piece(-1, 0);
    }
    else if (charge_l === hnd.NF_DAS && delay_l === 0) {
        board.move_active_piece(-1, 0);
        delay_l = hnd.NF_ARR;
    }
    
    if (charge_r === 1) {
        board.move_active_piece(1, 0);
    }
    else if (charge_r === hnd.NF_DAS && delay_r === 0) {
        board.move_active_piece(1, 0);
        delay_r = hnd.NF_ARR;
    }
    
    if (input.inputbuf.has(input.EV_SOFTDROP)) {
        if ((delay_d -= 1) === 0) {
            delay_d = hnd.NF_SDF;
            board.move_active_piece(0, -1);
        }
    }
    else {
        delay_d = 1;
    }
    
    if (input.inputbuf.has(input.EV_HARDDROP)) {
        if (!handled_hd) {
            board.drop_active_piece();
            handled_hd = true;
        }
    }
    else {
        handled_hd = false;
    }
    
    if (input.inputbuf.has(input.EV_RT_CW)) {
        if (!handled_cw) {
            board.rotate_active_piece(1);
            handled_cw = true;
        }
    }
    else {
        handled_cw = false;
    }
    
    if (input.inputbuf.has(input.EV_RT_CCW)) {
        if (!handled_ccw) {
            board.rotate_active_piece(-1);
            handled_ccw = true;
        }
    }
    else {
        handled_ccw = false;
    }
    
    if (input.inputbuf.has(input.EV_HOLD)) {
        if (!handled_hl) {
            board.hold_piece();
            handled_hl = true;
        }
    }
    else {
        handled_hl = false;
    }
}