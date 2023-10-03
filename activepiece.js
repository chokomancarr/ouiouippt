'use strict';

import * as pc from "./piece.js"

export class ActivePiece {
    constructor(ty) {
        this.ty = ty;
        this.pos_x = 3;
        this.pos_y = 19;
        this.rot = 0;
        this.mask = null;
        this.dist_to_floor = -1;
        this.update_mask();
    }
    
    update_mask() {
        this.mask = pc.mask[this.ty][this.rot];
    }
    
    rotated(i) {
        let res = new ActivePiece(this.ty);
        Object.assign(res, this);
        res.rot = (this.rot + i + 4) % 4;
        res.update_mask();
        return res;
    }
    moved(dx, dy) {
        let res = new ActivePiece(this.ty);
        Object.assign(res, this);
        res.pos_x += dx;
        res.pos_y += dy;
        return res;
    }
}