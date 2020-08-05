import Libp2p from 'libp2p'
import TCP from 'libp2p-tcp'
import WS from 'libp2p-websockets'
import MPLEX from 'libp2p-mplex'
import SECIO from 'libp2p-secio'
import MulticastDNS from 'libp2p-mdns'
import DHT from 'libp2p-kad-dht'
import GossipSub from 'libp2p-gossipsub'

import Room from './room/pubsub'

const config = {
  addresses: {
    // TODO: remove
    // add a listen address (localhost) to accept TCP connections on a random port
    listen: ['/ip4/127.0.0.1/tcp/0']
  },
  modules: {
    transport: [TCP, WS],
    streamMuxer: [MPLEX],
    connEncryption: [SECIO],
    peerDiscovery: [MulticastDNS],
    dht: DHT,
    pubsub: GossipSub
  }
  // TODO: Add bootnodes
}

export default async function createRoom (roomName: string): Promise<Room> {
  const libp2p = await Libp2p.create(config)
  await libp2p.start()

  return new Room(libp2p, roomName)
}
