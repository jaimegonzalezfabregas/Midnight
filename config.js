const network = require("network");


let active_interface;
/* obj should be:
           { name: 'eth0',
             ip_address: '10.0.1.3',
             mac_address: '56:e5:f9:e4:38:1d',
             type: 'Wired',
             netmask: '255.255.255.0',
             gateway_ip: '10.0.1.1' }
           */

async function get_active_interface() {
    if (!active_interface) {
        await new Promise((r) => {
            network.get_active_interface(function (err, obj) {
                if (err) throw err;
                active_interface = obj;
                r();
            })
        })
    }
    return active_interface;
}

const zip = (a, b) => a.map((k, i) => [k, b[i]]);

const set_last_byte = (ip, b) => ip.split(".").map((e, i) => i == 3 ? b : e).join(".");

// WIFI LAN
module.exports = {
    GET_IP_RANGE: async () => {
        let ai = await get_active_interface();
        let net_ip = zip(ai.ip_address.split("."), ai.netmask.split(".")).map(([ip, mask]) => ip & mask).join(".")
        let broadcast_ip = zip(ai.ip_address.split("."), ai.netmask.split(".")).map(([ip, mask]) => ip | !mask).join(".")
        return [set_last_byte(net_ip, 140), set_last_byte(broadcast_ip, 200)];
    },
    GET_EXPOSED_IP: async () => {
        return (await get_active_interface()).ip_address;
    },
    GET_GATEWAY: async () => {
        return (await get_active_interface()).gateway_ip;
    },
    DOMAIN_CONFIG: {
        "example.com": {
            logging: true,
            petition_warp: (headers, body, url) => {

                if (headers["accept-encoding"]) {
                    delete headers["accept-encoding"];
                }

                return [headers, body, url]
            },

            response_warp: (headers, body, statusCode) => {
                body = body.split("illustrative").join("nefarious");
                if (headers["content-length"]) {
                    headers["content-length"] = body.length + "";
                }

                return [headers, body, statusCode]
            }
        },
        // "api.moyoung.com": {
        //     logging: true,
        // },
        // "wr.moyoung.com": {
        //     logging: true,
        // },
        // "qcdn.moyoung.com": {
        //     logging: true,
        // },
    }
};

