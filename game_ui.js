import * as util from "./util.js"
import * as pc from "./piece.js"
import * as bd from "./board.js"

function Q(selector, parent = document) {
    return parent.querySelector(selector);
}


export function draw_board(bd, svg) {
    let cats = {};
    bd.data.slice(0, 210).forEach((ty, i) => {
        if (ty !== pc.PC_NONE)
            (cats[ty] ?? (cats[ty] = [])).push(i);
    });
    
    Q(".board_lines", svg).innerHTML =
        Object.entries(cats).map(([ty, c]) => `
<path fill="${pc.colors[ty]}" d="${ c.map(i => {
    let x = i % 10;
    let y = (i / 10) >> 0;
    return `M${x * 10} ${200 - y * 10} l10 0 l0 -10 l-10 0z`;
}).join("") }"/>
        `).join("");
    
    Q(".active_piece", svg).innerHTML = (bd.active_piece === null) ? "" : `
<path fill="${pc.colors[bd.active_piece.ty]}" d="${util.ARR_N(4).map((_, i) => `
    M${(bd.active_piece.pos_x + bd.active_piece.mask[i * 2]) * 10} ${200 - (bd.active_piece.pos_y + bd.active_piece.mask[i * 2 + 1]) * 10} l10 0 l0 -10 l-10 0z
`).join("")}"/>
    `;
    
    Q(".shadow_piece", svg).innerHTML = (bd.active_piece === null) ? "" : `
<path fill="#ccc7" d="${util.ARR_N(4).map((_, i) => `
    M${(bd.active_piece.pos_x + bd.active_piece.mask[i * 2]) * 10} ${200 - (bd.active_piece.pos_y + bd.active_piece.mask[i * 2 + 1] - bd.active_piece.dist_to_floor) * 10} m1 -1 l8 0 l0 -8 l-8 0z
`).join("")}"/>
    `;
    
    Q(".next_queue", svg).innerHTML =
        bd.queue.nexts.slice(0, 5).map((ty, n) => {
            let mask = pc.mask[ty][0];
            let x0 = 1;
            let y0 = n * 35 + 29;
            return `
<path fill="${pc.colors[ty]}" d="${
    util.ARR_N(4).map((_, i) => `
        M${x0 + 10 * mask[i*2]} ${y0 - 10 * mask[i*2+1]} l10 0 l0 -10 l-10 0z
    `).join("")
}"/>`
        }).join("");
        
    Q(".hold_piece", svg).innerHTML = (bd.hold === pc.PC_NONE) ? "" : `
<path fill="${pc.colors[bd.hold]}" d="${
    util.ARR_N(4).map((_, i) => `
        M${10 * pc.mask[bd.hold][0][i*2]} ${30 - 10 * pc.mask[bd.hold][0][i*2+1]} l10 0 l0 -10 l-10 0z
    `).join("")
}"/>`;

    let effs = Array.from(svg.querySelectorAll(".clear_eff"));
    if (bd.lines_to_remove.length > 0) {
        bd.lines_to_remove.map((l, i) => {
            effs[i].setAttribute("y", (19 - l) * 10);
            effs[i].classList.add("show");
        });
    }
    else {
        for (let e of effs) {
            e.classList.remove("show");
        }
    }
}