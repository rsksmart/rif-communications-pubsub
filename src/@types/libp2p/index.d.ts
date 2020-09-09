declare module 'libp2p' {
  interface Options {
    peerId: any
    addresses: {
      listen: string[]
    }
    modules: {
      transport: any[]
      streamMuxer: any[]
      connEncryption: any[]
      peerDiscovery: any[]
      dht: any
      pubsub: any
    }
  }

  type MessageHandler = (msg: { from: string, data: Uint8Array, seqno: Buffer, topicIDs: Array<string>, signature: Buffer, key: Buffer }) => void

  export default class Libp2p {
    peerId: any

    constructor (config?: Options)

    static create (config?: Options): Promise<Libp2p>;

    start (): Promise<void>

    handle (PROTOCOL: any, handler: any): void

    unhandle (PROTOCOL: any, handler: any): void

    peerStore: {
      get (peerId: any): any
    }

    peerInfo: {
      id: {
        toB58String (): string
      }
    }

    dialProtocol (peerInfo: any, PROTOCOL: string): Promise<{ stream: (data: Buffer) => Promise<void>, protocol: any }>

    pubsub: {
      on (topic: string, onMessage: MessageHandler): void
      removeListener (topic: string, onMessage: MessageHandler): void
      subscribe (topic: string): void
      unsubscribe (topic: string): void
      publish (topic: string, message: Uint8Array): Promise<void>
      getSubscribers (topic: string): Promise<[]>
    }

    _config: {
      pubsub: {
        enabled: boolean
      }
    }

    connections: {
      keys (): any[]
    }
  }
}
