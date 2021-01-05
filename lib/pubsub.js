"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_OPTIONS = void 0;
const emittery_1 = __importDefault(require("emittery"));
const hyperdiff_1 = __importDefault(require("hyperdiff"));
const from_string_1 = __importDefault(require("uint8arrays/from-string"));
const to_string_1 = __importDefault(require("uint8arrays/to-string"));
exports.DEFAULT_OPTIONS = {
    pollInterval: 1000,
    ignoreSelfMessages: false
};
class PubSubRoom extends emittery_1.default.Typed {
    constructor(libp2p, topic, options) {
        super();
        options = Object.assign(exports.DEFAULT_OPTIONS, options);
        this.lp2p = libp2p;
        this.topic = topic;
        this.connectedPeers = [];
        this.ignoreSelfMessages = Boolean(options.ignoreSelfMessages);
        this.onMessage = this.onMessage.bind(this);
        this.pollPeers = this.pollPeers.bind(this);
        if (!this.libp2p.pubsub || !this.libp2p._config.pubsub.enabled) {
            throw new Error('pubsub has not been configured');
        }
        this.interval = setInterval(this.pollPeers, options.pollInterval);
        this.libp2p.pubsub.on(this.topic, this.onMessage);
        this.libp2p.pubsub.subscribe(this.topic);
    }
    /**
     * Periodically poll connectedPeers for latest messages
     *
     * @emits peer:joined  When new peer joins the topic
     * @emits peer:left    When peer leaves the topic
     */
    pollPeers() {
        return __awaiter(this, void 0, void 0, function* () {
            const newPeers = (yield this.libp2p.pubsub.getSubscribers(this.topic)).sort();
            const differences = hyperdiff_1.default(this.connectedPeers, newPeers);
            differences.added.forEach((peer) => this.emit('peer:joined', peer));
            differences.removed.forEach((peer) => this.emit('peer:left', peer));
            if (differences.added.length > 0 || differences.removed.length > 0) {
                this.connectedPeers = newPeers;
            }
        });
    }
    onMessage(message) {
        if (this.ignoreSelfMessages && message.from === this.peerId) {
            return;
        }
        try {
            const parsedData = JSON.parse(to_string_1.default(message.data));
            const newMessage = Object.assign(Object.assign({}, message), { data: parsedData });
            this.emit('message', newMessage);
        }
        catch (e) {
            this.emit('error', e);
        }
    }
    get peerId() {
        return this.libp2p.peerId.toB58String();
    }
    get peers() {
        return this.connectedPeers.slice(0);
    }
    get libp2p() {
        return this.lp2p;
    }
    hasPeer(peer) {
        return Boolean(this.connectedPeers.find(p => p.toString() === peer.toString()));
    }
    leave() {
        clearInterval(this.interval);
        this.libp2p.pubsub.unsubscribe(this.topic);
        this.libp2p.pubsub.removeListener(this.topic, this.onMessage);
        this.emit('unsubscribed');
    }
    /**
     * Broadcast message to the topic
     */
    broadcast(message) {
        return __awaiter(this, void 0, void 0, function* () {
            const msg = from_string_1.default(JSON.stringify(message));
            yield this.libp2p.pubsub.publish(this.topic, msg);
        });
    }
}
exports.default = PubSubRoom;
module.exports = PubSubRoom;
