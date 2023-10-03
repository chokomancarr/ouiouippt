'use strict';

import * as util from "./util.js"
import * as pc from "./piece.js"
import * as apc from "./activepiece.js"
import * as hnd from "./handling.js"

const STEP_RESULT_NONE = 0;
const STEP_RESULT_GRAVITY = 1;
const STEP_RESULT_LOCKED = 2;
const STEP_RESULT_CLEARED = 3;

export const STATE_EMPTY = 0;
export const STATE_PLAY = 1;
export const STATE_WAIT = 2;
export const STATE_WAIT_AUTOLOCK = 3;
export const STATE_TOPOUT = 4;

/*
 * board coordinates origin is bottom left
 */
export class Board {
    constructor() {
        this.data = util.ARR_N(10 * 40, pc.PC_NONE);
        this.active_piece = null;
        this.queue = null;
        this.hold = pc.PC_NONE;
        this.state = STATE_EMPTY;
        this.wait_time = 0;
        this.lines_to_remove = [];
    }
    
    add_garbage(hole_pos, gty = 0x10) {
        this.data = [...util.ARR_N(10, pc.PC_NONE).map((_, i) => (i == hole_pos) ? pc.PC_NONE : gty), ...this.data.slice(0, -10)];
    }
    
    spawn_piece_from_queue() {
        return this.spawn_piece(this.queue.pop());
    }
    
    spawn_piece(ty) {
        if (this.active_piece !== null) {
            alert("system error: cannot spawn new active piece when current active piece is not null!");
            return false;
        }
        this.active_piece = new apc.ActivePiece(ty);
        if (!this.move_active_piece(0, -1)) {
            this.touching_ground = true;
        }
        this.t_gravity = 0;
        this.t_lock = 0;
        this.t_maxlock = 0;
        this.active_piece.dist_to_floor = this.get_dist_to_floor();
        if (this.has_intersect(this.active_piece)) {
            return false;
        }
        return true;
    }

    has_intersect(apc) {
        let poss = util.ARR_N(4).map((_, i) => [apc.pos_x + apc.mask[i * 2], apc.pos_y + apc.mask[i * 2 + 1]]);
        return poss.some(p => (p[0] < 0) || (p[1] < 0) || (p[0] > 9) || (this.data[p[0] + p[1] * 10] > 0));
    }
    
    move_active_piece(mx, my) {
        if (this.active_piece === null) return false;
        if (mx !== 0 && my !== 0) {
            alert("system error: move_active_piece should not be called with x and y offsets at the same time!");
            return false;
        }
        if (my > 0) {
            alert("system error: piece cannot move upwards, use your brain ruffian!");
            return false;
        }
        let apc2 = this.active_piece.moved(mx, my);
        if (!this.has_intersect(apc2)) {
            this.active_piece = apc2;
            if (mx === 0)
                this.active_piece.dist_to_floor += my;
            else 
                this.active_piece.dist_to_floor = this.get_dist_to_floor();
            
            if (my < 0) {
                this.t_gravity = 0;
            }
            this.t_lock = 0;
            
            return true;
        }
        else {
            return false;
        }
    }
    rotate_active_piece(r) {
        if (this.active_piece === null) return false;
        if (this.active_piece.ty === pc.PC_O) return true;
        let apc2 = this.active_piece.rotated(r);
        let srs_mask = (this.active_piece.rot << 4) + apc2.rot;
        let kicks = [[0, 0], ...((apc2.ty === pc.PC_I) ? pc.SRS.I[srs_mask] : pc.SRS.NOT_I[srs_mask])];
        for (let k of kicks) {
            let apc3 = apc2.moved(k[0], k[1]);
            if (!this.has_intersect(apc3)) {
                this.active_piece = apc3;
                
                this.active_piece.dist_to_floor = this.get_dist_to_floor();
                return true;
            }
        }
        return false;
    }
    
    hold_piece() {
        let h = this.hold;
        this.hold = this.active_piece.ty;
        this.active_piece = null;
        if (h === pc.PC_NONE) {
            this.spawn_piece_from_queue();
        }
        else {
            this.spawn_piece(h);
        }
    }
    
    get_dist_to_floor() {
        for (let a = -1; ; a -= 1) {
            if (this.has_intersect(this.active_piece.moved(0, a))) {
                return -a - 1;
            }
        }
    }
    
    apply_active_piece() {
        let inrange = false;
        for (let i = 0; i < 4; i++) {
            let y = this.active_piece.pos_y + this.active_piece.mask[i * 2 + 1];
            this.data[ this.active_piece.pos_x + this.active_piece.mask[i * 2] + 10 * y ] = this.active_piece.ty;
            inrange ||= (y < 20);
        }
        this.active_piece = null;
        return inrange;
    }
    
    drop_active_piece() {
        this.move_active_piece(0, -this.active_piece.dist_to_floor);
        if (this.apply_active_piece()) {
            this.state = STATE_WAIT_AUTOLOCK;
            this.wait_time = 1;
        }
        else {
            this.state = STATE_TOPOUT;
        }
    }
    
    /** we return line indices from big to small ... */
    check_full_lines() {
        this.lines_to_remove = util.RANGE(20).filter(i =>
            !this.data.slice((19 - i) * 10, (20 - i) * 10).some(c => c === pc.PC_NONE)
        ).map(i => 19 - i);
        return this.lines_to_remove.length > 0;
    }
    
    empty_full_lines() {
        for (let l of this.lines_to_remove) {
            for (let i = 0; i < 10; i++)
                this.data[l * 10 + i] = pc.PC_NONE;
        }
    }
    
    /** ... so we can loop them directly here */
    remove_full_lines() {
        for (let l of this.lines_to_remove) {
            this.data.splice(l * 10, 10);
        }
        this.data = this.data.concat(util.ARR_N(10 * this.lines_to_remove.length, pc.PC_NONE));
        this.lines_to_remove = [];
    }
    
    step_frame() {
        switch (this.state) {
            case STATE_EMPTY: break;
            case STATE_TOPOUT: break;
            case STATE_PLAY: {
                if (this.active_piece.dist_to_floor === 0) {
                    this.t_lock += 1;
                    this.t_maxlock += 1;
                    if (this.t_lock >= hnd.NF_AUTOLOCK || this.t_maxlock >= hnd.NF_MAXLOCK) {
                        if (this.apply_active_piece()) {
                            this.state = STATE_WAIT_AUTOLOCK;
                            this.wait_time = hnd.NF_AUTOLOCK_DELAY;
                        }
                        else {
                            this.state = STATE_TOPOUT;
                        }
                    }
                }
                else {
                    this.t_gravity += 1;
                    if (this.t_gravity >= hnd.NF_GRAVITY) {
                        this.move_active_piece(0, -1);
                        return STEP_RESULT_GRAVITY;
                        this.t_gravity = 0;
                    }
                }
                break;
            }
            default: {
                if ((this.wait_time -= 1) === 0) {
                    if (this.state >= STATE_WAIT_AUTOLOCK) {
                        if (this.check_full_lines()) {
                            this.empty_full_lines();
                            this.state = STATE_WAIT;
                            this.wait_time = hnd.NF_CLEAR_SPAWN_DELAY;
                            return STEP_RESULT_CLEARED;
                        }
                        else {
                            this.state = STATE_WAIT;
                            this.wait_time = hnd.NF_LOCK_SPAWN_DELAY;
                            return STEP_RESULT_LOCKED;
                        }
                    }
                    else {
                        if (this.spawn_piece_from_queue())
                            this.state = STATE_PLAY;
                        else {
                            this.state = STATE_TOPOUT;
                        }
                    }
                }
                else if (this.wait_time <= hnd.NF_REMOVE_CLEARED_LINES && this.state === STATE_WAIT) {
                    this.remove_full_lines();
                }
            }
        }
    }
    
    pretty_print(show_all = false) {
        let n = show_all ? 40 : 21;
        let d2 = this.data.slice();
        if (this.active_piece !== null) {
            for (let i = 0; i < 4; i++) {
                d2[ this.active_piece.pos_x + this.active_piece.mask[i * 2] + 10 * (this.active_piece.pos_y + this.active_piece.mask[i * 2 + 1]) ] = this.active_piece.ty;
            }
        }
        return util.ARR_N(n).map((_, i) => (i + "").padEnd(3, ".") + "|" + d2.slice((n - 1 - i) * 10, (n - i) * 10).map(i => pc.names[i] ?? "X").join(" ")).join("\n")
    }
}