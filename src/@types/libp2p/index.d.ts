declare module 'libp2p' {
  export default class Libp2p {
    peerId: any;
    static create(config?: {
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
    }): Promise<Libp2p>;

    start(): Promise<void>
    handle(PROTOCOL: any, handler: any): void
    unhandle(PROTOCOL: any, handler: any): void
    peerStore: {
        get(peerId: any): any
    }

    peerInfo: {
        id: {
          toB58String(): string
        }
    };

    dialProtocol(peerInfo: any, PROTOCOL: string): Promise<{stream: any}>
    pubsub: {
      subscribe(topic: string, onMessage: (message: Buffer) => void): Promise<void>
      unsubscribe(topic: string, onMessage: (message: Buffer) => void): Promise<void>
      publish(topic: string, message: Buffer): Promise<void>
      getSubscribers(topic: string): Promise<[]>
    }

    connections: {
      keys(): any[]
    };
  }
}
