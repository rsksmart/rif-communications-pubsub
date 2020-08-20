import Emittery from 'emittery'
import diff from 'hyperdiff'
import type Libp2p from 'libp2p'

import { toBuffer } from './utils'
import type { JsonSerializable, Message, Options } from './definitions'

export const DEFAULT_OPTIONS: Options = {
  pollInterval: 1000,
  ignoreSelfMessages: false
}

export default class PubSubRoom extends Emittery.Typed<{ 'peer:joined': string, 'peer:left': string, 'message': Message, 'error': Error }, 'unsubscribed'> {
  protected lp2p: Libp2p
  protected topic: string
  protected connectedPeers: string[]
  protected interval: NodeJS.Timeout
  private ignoreSelfMessages: boolean

  constructor (libp2p: Libp2p, topic: string, options?: Options) {
    super()

    options = Object.assign(DEFAULT_OPTIONS, options)
    this.lp2p = libp2p
    this.topic = topic
    this.connectedPeers = []
    this.ignoreSelfMessages = Boolean(options.ignoreSelfMessages)

    this.onMessage = this.onMessage.bind(this)
    this.pollPeers = this.pollPeers.bind(this)

    if (!this.libp2p.pubsub || !this.libp2p.pubsub._pubsub._options.enabled) {
      throw new Error('pubsub has not been configured')
    }

    this.interval = setInterval(
      this.pollPeers,
      options.pollInterval!
    )

    this.libp2p.pubsub.subscribe(this.topic, this.onMessage)
  }

  /**
   * Periodically poll connectedPeers for latest messages
   *
   * @emits peer:joined  When new peer joins the topic
   * @emits peer:left    When peer leaves the topic
   */
  private async pollPeers (): Promise<void> {
    const newPeers = (await this.libp2p.pubsub.getSubscribers(this.topic)).sort()

    const differences = diff(this.connectedPeers, newPeers)

    differences.added.forEach((peer: string) => this.emit('peer:joined', peer))
    differences.removed.forEach((peer: string) => this.emit('peer:left', peer))

    if (differences.added.length > 0 || differences.removed.length > 0) {
      this.connectedPeers = newPeers
    }
  }

  private onMessage (message: Message<Buffer>): void {
    if (this.ignoreSelfMessages && message.from === this.peerId) {
      return
    }

    try {
      const parsedData = JSON.parse(message.data!.toString()) as JsonSerializable
      const newMessage: Message = { ...message, data: parsedData }
      this.emit('message', newMessage)
    } catch (e) {
      this.emit('error', e)
    }
  }

  public get peerId (): string {
    return this.libp2p.peerId.toB58String()
  }

  public get peers (): string[] {
    return this.connectedPeers.slice(0)
  }

  public get libp2p (): Libp2p {
    return this.lp2p
  }

  public hasPeer (peer: string): boolean {
    return Boolean(this.connectedPeers.find(p => p.toString() === peer.toString()))
  }

  public leave (): void {
    clearInterval(this.interval)
    this.libp2p.pubsub.unsubscribe(this.topic, this.onMessage)
    this.emit('unsubscribed')
  }

  /**
   * Broadcast message to the topic
   */
  public async broadcast (message: JsonSerializable): Promise<void> {
    const msg = toBuffer(JSON.stringify(message))
    await this.libp2p.pubsub.publish(this.topic, msg)
  }
}

module.exports = PubSubRoom
