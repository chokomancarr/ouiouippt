import * as pc from "./piece.js"
import * as bd from "./board.js"
import * as qu from "./queue.js"
import * as ui from "./game_ui.js"
import * as input from "./inputman.js"
import * as player from "./ctrl_player.js"

(function() {
    let log = document.getElementById("log");
    let info = document.getElementById("info");
    
    let board = new bd.Board();
    
    board.queue = new qu.Queue(1024);
    
    input.init();
    player.init(board);
    
    board.spawn_piece_from_queue();
    
    board.state = bd.STATE_PLAY;
    
    let t0 = undefined;
    function loop(t1) {
        requestAnimationFrame(loop);
        let dt = t1 - (t0 ?? (t0 = t1));
        if (dt > 33) {
            t0 += 33;
            player.update();
            board.step_frame();
            ui.draw_board(board, document.getElementsByClassName("board_svg")[0]);
        }
    };
    
    requestAnimationFrame(loop);
})();