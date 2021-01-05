/// <reference types="node" />
import Emittery from 'emittery';
import type Libp2p from 'libp2p';
import type { JsonSerializable, Message, Options } from '../definitions';
export declare const DEFAULT_OPTIONS: Options;
export default class PubSubRoom extends Emittery.Typed<{
    'peer:joined': string;
    'peer:left': string;
    'message': Message;
    'error': Error;
}, 'unsubscribed'> {
    protected lp2p: Libp2p;
    protected topic: string;
    protected connectedPeers: string[];
    protected interval: NodeJS.Timeout;
    private ignoreSelfMessages;
    constructor(libp2p: Libp2p, topic: string, options?: Options);
    /**
     * Periodically poll connectedPeers for latest messages
     *
     * @emits peer:joined  When new peer joins the topic
     * @emits peer:left    When peer leaves the topic
     */
    private pollPeers;
    private onMessage;
    get peerId(): string;
    get peers(): string[];
    get libp2p(): Libp2p;
    hasPeer(peer: string): boolean;
    leave(): void;
    /**
     * Broadcast message to the topic
     */
    broadcast(message: JsonSerializable): Promise<void>;
}
