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

  type MessageHandler = (msg: { from: string, data: Buffer, seqno: Buffer, topicIDs: Array<string>, signature: Buffer, key: Buffer }) => void

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
      subscribe (topic: string, onMessage: MessageHandler): void
      unsubscribe (topic: string, onMessage: MessageHandler): void
      publish (topic: string, message: Buffer): Promise<void>
      getSubscribers (topic: string): Promise<[]>
    }

    connections: {
      keys (): any[]
    }
  }
}
