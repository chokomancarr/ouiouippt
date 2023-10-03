export let is_host = false;

let host_time_delta = 0;

export const PK_DATA = 0;
export const PK_SYNC1 = 1;
export const PK_SYNC2 = 2;

let _sync_client_time0 = 0;

export function get_shared_time() {
    if (is_host) return Date.now();
    else return Date.now() + host_time_delta;
}

export function sync_to_host_time() {
    _sync_client_time0 = Date.now();
    send(0, PK_SYNC1);
}

export function send(data, ty = PK_DATA) {
    let payload = {
        ty: ty,
        d: data
    };
}

export function _ondata(data) {
    switch (data.ty) {
        case PK_SYNC1: {
            if (is_host) {
                send(Date.now(), PK_SYNC1);
            }
            else {
                let t = Date.now();
                let delay = t - _sync_client_time0;
                let tmid = t + Math.floor(delay / 2);
                let host_tmid = data.d;
                host_time_delta = host_tmid - tmid;
                send(host_tmid + delay);
            }
            break;
        }
        case PK_SYNC2: {
            if (is_host) {
                let t = Date.now();
                send(t - data.d, PK_SYNC2);
            }
            else {
                host_time_delta += data.d;
            }
            break;
        }
        case PK_DATA: {
            
        }
    }
}