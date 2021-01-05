"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const libp2p_websockets_1 = __importDefault(require("libp2p-websockets"));
const libp2p_webrtc_star_1 = __importDefault(require("libp2p-webrtc-star"));
const libp2p_mplex_1 = __importDefault(require("libp2p-mplex"));
const libp2p_noise_1 = require("libp2p-noise");
const libp2p_secio_1 = __importDefault(require("libp2p-secio"));
const libp2p_kad_dht_1 = __importDefault(require("libp2p-kad-dht"));
const libp2p_gossipsub_1 = __importDefault(require("libp2p-gossipsub"));
const lodash_1 = __importDefault(require("lodash"));
const libp2p_bootstrap_1 = __importDefault(require("libp2p-bootstrap"));
const utils_1 = require("../utils");
// Reccommended config as per https://github.com/ipfs/js-ipfs/blob/master/packages/ipfs/src/core/runtime/libp2p-browser.js
const config = {
    dialer: {
        maxParallelDials: 150,
        maxDialsPerPeer: 4,
        dialTimeout: 10e3 // 10 second dial timeout per peer dial
    },
    modules: {
        transport: [
            libp2p_websockets_1.default,
            libp2p_webrtc_star_1.default
        ],
        streamMuxer: [libp2p_mplex_1.default],
        connEncryption: [
            libp2p_secio_1.default,
            libp2p_noise_1.NOISE
        ],
        peerDiscovery: [libp2p_bootstrap_1.default],
        dht: libp2p_kad_dht_1.default,
        pubsub: libp2p_gossipsub_1.default
    },
    config: {
        peerDiscovery: {
            autoDial: true,
            bootstrap: {
                enabled: true
            },
            webRTCStar: {
                enabled: true
            }
        },
        dht: {
            kBucketSize: 20,
            enabled: true,
            clientMode: true,
            randomWalk: {
                enabled: true,
                interval: 300e3,
                timeout: 10e3
            }
        },
        pubsub: {
            enabled: true,
            emitSelf: true
        }
    },
    metrics: {
        enabled: true
    },
    peerStore: {
        persistence: true,
        threshold: 1
    }
};
exports.default = (conf) => utils_1.createLibP2P(lodash_1.default.merge(config, conf));
