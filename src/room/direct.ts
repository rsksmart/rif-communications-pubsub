import PubSubRoom, { Options } from './pubsub'
import Libp2p from 'libp2p'
import PeerId from 'peer-id'
import pipe from 'it-pipe'
import Emittery from 'emittery'
import { Message } from './Message'

const PROTOCOL = 'rif-communications-pubsub/v0.1.0'

const emitter = new Emittery.Typed<{ direct: Message }>()

const handleDirect = ({ stream, connection }: any): void => {
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

        emitter.emit('direct', m)
      }
    }
  )
}

export default class PubSubRoomDirect extends PubSubRoom {
  constructor (libp2p: Libp2p, topic: string, options?: Options) {
    super(libp2p, topic, options)

    this.onDirectMessage = this.onDirectMessage.bind(this)

    this.libp2p.handle(PROTOCOL, handleDirect)
    emitter.on('direct', this.onDirectMessage)
  }

  public leave (): void {
    this.libp2p.unhandle(PROTOCOL, handleDirect)
    super.leave()
  }

  private onDirectMessage (msg: Message): void {
    // Only emit direct messages for this room and this user
    if (msg.topicIDs.includes(this.topic) && this.peerId === msg.to) {
      this.onMessage(msg)
    }
  }

  public async sendTo (peer: string, message: string): Promise<void> {
    const p = PeerId.createFromCID(peer)
    const peerInfo = this.libp2p.peerStore.get(p)
    const { stream } = await this.libp2p.dialProtocol(peerInfo.id, PROTOCOL)

    const msg = {
      from: this.peerId,
      to: peer,
      topicIDs: [this.topic],
      data: Buffer.from(message).toString('hex')
    }

    await pipe(
      JSON.stringify(msg),
      stream
    )
  }
}
