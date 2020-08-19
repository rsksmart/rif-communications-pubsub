import type Libp2p from 'libp2p'
import PeerId from 'peer-id'
import pipe from 'it-pipe'
import Emittery from 'emittery'

import type { JsonSerializable, Dictionary, MessageDirect } from './definitions'

export const PROTOCOL = 'rif-communications-pubsub/v0.1.0'

export default class DirectChat extends Emittery.Typed<{ 'message': MessageDirect, 'error': Error }> {
  // Dictionary of libp2p listeners
  private static protocols: Dictionary<DirectChat> = {}
  private libp2p: Libp2p

  private constructor (libp2p: Libp2p) {
    super()

    this.handleDirect = this.handleDirect.bind(this)
    this.libp2p = libp2p
    this.libp2p.handle(PROTOCOL, this.handleDirect)
  }

  public static getDirectChat (libp2p: Libp2p): DirectChat {
    const peerId = libp2p.peerId.toB58String()
    let direct = DirectChat.protocols[peerId]

    if (!direct) {
      direct = new DirectChat(libp2p)
      DirectChat.protocols[peerId] = direct
    }
    return direct
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

          try {
            const parsedData = JSON.parse(Buffer.from(msg.data, 'hex').toString()) as JsonSerializable

            const m: MessageDirect = {
              from: msg.from,
              to: msg.to,
              data: parsedData
            }

            this.emit('message', m)
          } catch (e) {
            this.emit('error', e)
          }
        }
      }
    )
  }

  public get peerId (): string {
    return this.libp2p.peerId.toB58String()
  }

  public async sendTo (peer: string, message: string): Promise<void> {
    const p = PeerId.createFromCID(peer)
    const peerInfo = this.libp2p.peerStore.get(p)
    const { stream } = await this.libp2p.dialProtocol(peerInfo.id, PROTOCOL)

    const msg = {
      from: this.peerId,
      to: peer,
      data: Buffer.from(JSON.stringify(message)).toString('hex')
    }

    await pipe(
      JSON.stringify(msg),
      stream
    )
  }
}
