import PubSubRoom, { Options } from './pubsub'
import Libp2p from 'libp2p'
import PeerId from 'peer-id'
import pipe from 'it-pipe'
import { Message } from './Message'

const PROTOCOL = 'rif-communications-pubsub/v0.1.0'

class Connection {
  stream: any

  private constructor (stream: any) {
    this.stream = stream
  }

  public static async create (libp2p: Libp2p, peer: string, PROTOCOL: string) {
    const p = PeerId.createFromCID(peer)
    const peerInfo = libp2p.peerStore.get(p)
    const { stream } = await libp2p.dialProtocol(peerInfo.id, PROTOCOL)
    return new Connection(stream)
  }

  public async send (msg: string) {
    await pipe(
      msg,
      this.stream
    )
  }
}

interface Dictionary<T> {
  [key: string]: T
}

export default class PubSubRoomDirect extends PubSubRoom {
  private connections: Dictionary<Connection>
  constructor (libp2p: Libp2p, topic: string, options?: Options) {
    super(libp2p, topic, options)

    this.handleDirect = this.handleDirect.bind(this)

    this.connections = {}
    this.libp2p.handle(PROTOCOL, this.handleDirect)
  }

  private handleDirect ({ stream, connection }: any): void {
    const remotePeer = connection.remotePeer.toB58String()
    let d = ''
    let msg
    pipe(
      stream,
      async source => {
        for await (const message of source) {
          d += message.toString()

          try {
            msg = JSON.parse(d)
          } catch (error) {
            continue
          }

          if (msg.from !== remotePeer) {
            continue
          }
          const m: Message = {
            from: msg.from,
            to: msg.to,
            data: Buffer.from(msg.data, 'hex'),
            topicIDs: msg.topicIDs,
            seqno: msg.seqno
          }
          this.emit('message', m)
          // eslint-disable-next-line
          console.log('emitter called')
        }
      }
    )
  }

  public leave () {
    this.libp2p.unhandle(PROTOCOL, this.handleDirect)
    // Object.keys(this.connections).forEach((peer) => {
    //   this.connections[peer].stop()
    // })
    super.leave()
  }

  public async sendTo (peer: string, message: string) {
    let conn = this.connections[peer]

    if (!conn) {
      conn = await Connection.create(this.lp2p, peer, PROTOCOL)
      // FIXME: second sentTo does not work if connection is persisted
      // this.connections[peer] = conn
    }

    const msg = {
      from: this.peerId,
      to: peer,
      topicIDs: [this.topic],
      data: Buffer.from(message).toString('hex')
    }

    await conn.send(JSON.stringify(msg))
  }
}
