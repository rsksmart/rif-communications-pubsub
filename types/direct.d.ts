import type Libp2p from 'libp2p';
import Emittery from 'emittery';
import type { JsonSerializable, DirectMessage } from './definitions';
export declare const PROTOCOL = "rif-communications-pubsub/v0.1.0";
export default class DirectChat extends Emittery.Typed<{
    'message': DirectMessage;
    'error': Error;
}> {
    private static protocols;
    private libp2p;
    private constructor();
    static getDirectChat(libp2p: Libp2p): DirectChat;
    private handleDirect;
    get peerId(): string;
    sendTo(peer: string, message: JsonSerializable): Promise<void>;
}
