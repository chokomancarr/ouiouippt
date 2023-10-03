import * as util from "./util.js"
import * as pc from "./piece.js"

export class Queue {
    constructor(seed, min_next = 5) {
        this.prng = new util.Rand(seed);
        this.nexts = [];
        this.min_next = min_next;
        for (let a = 0; a < min_next; a += 7)
            this.add_bag();
    }
    pop() {
        let nxt = this.nexts.shift();
        if (this.nexts.length == this.min_next) {
            this.add_bag();
        }
        return nxt;
    }
    add_bag() {
        this.nexts = this.nexts.concat(util.ARR_N(7)
            .map((_, i) => [this.prng.next(), i])
            .sort((a, b) => a[0] - b[0]).map(j => pc.PC_NONE + j[1] + 1));
    }
}