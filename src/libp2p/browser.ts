import WS from 'libp2p-websockets'
import WebRTCStar from 'libp2p-webrtc-star'
import Multiplex from 'libp2p-mplex'
import { NOISE } from 'libp2p-noise'
import SECIO from 'libp2p-secio'
import KadDHT from 'libp2p-kad-dht'
import GossipSub from 'libp2p-gossipsub'

import { createlibp2p } from '../utils'
import Libp2p from 'libp2p'

// Reccommended config as per https://github.com/ipfs/js-ipfs/blob/master/packages/ipfs/src/core/runtime/libp2p-browser.js

const config = {
  dialer: {
    maxParallelDials: 150, // 150 total parallel multiaddr dials
    maxDialsPerPeer: 4, // Allow 4 multiaddrs to be dialed per peer in parallel
    dialTimeout: 10e3 // 10 second dial timeout per peer dial
  },
  modules: {
    transport: [
      WS,
      WebRTCStar
    ],
    streamMuxer: [Multiplex],
    connEncryption: [
      SECIO,
      NOISE
    ],
    peerDiscovery: [],
    dht: KadDHT,
    pubsub: GossipSub
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
      enabled: false,
      clientMode: true,
      randomWalk: {
        enabled: false
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
}

export default (conf?: any): Promise<Libp2p> => createlibp2p({ ...config, ...conf })
