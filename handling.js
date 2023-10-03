//try to replicate PPT as much as possible
//values are in frames (30fps)

export let NF_GRAVITY = 40;
export let NF_AUTOLOCK = 20;
export let NF_MAXLOCK = 100;
export let NF_ARR = 2;
export let NF_DAS = 7;
export let NF_SDF = 1;

export let NF_AUTOLOCK_DELAY = 5; //additional frames added to delays below if piece is auto-locked
export let NF_LOCK_SPAWN_DELAY = 2;
export let NF_CLEAR_SPAWN_DELAY = 20;
export let NF_REMOVE_CLEARED_LINES = 2;

(function() {
    let aa = [ "gravity", "autolock", "maxlock", "arr", "das", "sdf", "autolock_delay", "lock_spawn_delay", "clear_spawn_delay" ];
    document.getElementById("handling_config").innerHTML = `<table>${
        aa.map(a => `<tr><td>${a}</td><td><input id="hnd_${a}" type="number"></input></td></tr>`).join("")
    }</table>`;
    aa.forEach(a => {
        let elem = document.getElementById("hnd_" + a);
        elem.value = eval("NF_" + a.toUpperCase());
        elem.addEventListener("change", e => {
            eval(`NF_${a.toUpperCase()}=${+e.target.value};`);
        });
    });
})();