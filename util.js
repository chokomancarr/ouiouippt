'use strict';

function mulberry32(a) {
    return function() {
      
    }
}

export function ARR_N(n, v = 0, unique = false) {
    let a = new Array(n);
    if (unique) {
        return a.fill(a).map(_ => v);
    }
    else {
        return a.fill(v);
    }
}

export function RANGE(n) {
    return (new Array(20)).fill(0).map((_, i) => i)
}

export class Rand {
    constructor(seed) {
        this.a = seed;
    }
    next() {
        let t = this.a += 0x6D2B79F5;
        t = Math.imul(t ^ t >>> 15, t | 1);
        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
}

let _cookies = (function() {
    let res = {};
    let ck = document.cookie.trim().split(";");
    for (let c of ck) {
        if (c === "") continue;
        let [k, v] = c.split("=");
        res[k.trim()] = v.trim();
    }
    return res;
})();

export function cookie_get(k, def = null) {
    return _cookies[k] ?? def;
}

export function cookie_set(k, v) {
    _cookies[k] = v;
    document.cookie = `${k}=${v}; max-age=31536000`;
}