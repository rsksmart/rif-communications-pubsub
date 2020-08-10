import PubSubRoom, { Options } from './pubsub'
import Libp2p from 'libp2p'
import PeerId from 'peer-id'
import pipe from 'it-pipe'
import Emittery from 'emittery'

const PROTOCOL = 'rif-communications-pubsub/v0.1.0'

const emitter = new Emittery()

const handleDirect = ({ stream, connection }: any): void => {
  const remotePeer = connection.remotePeer.toB58String()
  let d = ''
  let msg
  pipe(
    stream,
    async (source) => {
      for await (const message of source) {
        d += message.toString()

        try {
          msg = JSON.parse(d)
        } catch (error) {
          continue
        }

        if (msg.from !== remotePeer) { continue }

        emitter.emit('direct', msg)
      }
    }
  )
}

export default class PubSubRoomDirect extends PubSubRoom {
  constructor (libp2p: Libp2p, topic: string, options?: Options) {
    super(libp2p, topic, options)

    this.handleDirectMessage = this.handleDirectMessage.bind(this)

    this.libp2p.handle(PROTOCOL, handleDirect)
    emitter.on('direct', this.handleDirectMessage)
  }

  private handleDirectMessage (msg: any) {
    const m = {
      from: msg.from,
      to: msg.to,
      topic: Buffer.from(msg.topic, 'hex').toString(),
      data: Buffer.from(msg.data, 'hex').toString()
    }
    this.emit('direct', m)
  }

  public leave () {
    this.libp2p.unhandle(PROTOCOL, handleDirect)
    super.leave()
  }

  public async sendTo (peer: string, message: string) {
    const p = PeerId.createFromCID(peer)
    const peerInfo = this.libp2p.peerStore.get(p)
    const { stream } = await this.libp2p.dialProtocol(peerInfo.id, PROTOCOL)

    const msg = {
      from: this.peerId,
      to: peer,
      topic: Buffer.from(this.topic).toString('hex'),
      data: Buffer.from(message).toString('hex')
    }

    await pipe(JSON.stringify(msg), stream)
  }
}
