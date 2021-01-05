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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PROTOCOL = void 0;
const peer_id_1 = __importDefault(require("peer-id"));
const it_pipe_1 = __importDefault(require("it-pipe"));
const emittery_1 = __importDefault(require("emittery"));
exports.PROTOCOL = 'rif-communications-pubsub/v0.1.0';
class DirectChat extends emittery_1.default.Typed {
    constructor(libp2p) {
        super();
        this.handleDirect = this.handleDirect.bind(this);
        this.libp2p = libp2p;
        this.libp2p.handle(exports.PROTOCOL, this.handleDirect);
    }
    static getDirectChat(libp2p) {
        const peerId = libp2p.peerId.toB58String();
        let direct = DirectChat.protocols[peerId];
        if (!direct) {
            direct = new DirectChat(libp2p);
            DirectChat.protocols[peerId] = direct;
        }
        return direct;
    }
    handleDirect({ stream, connection }) {
        const remotePeer = connection.remotePeer.toB58String();
        let d = '';
        let msg;
        it_pipe_1.default(stream, (source) => { var source_1, source_1_1; return __awaiter(this, void 0, void 0, function* () {
            var e_1, _a;
            try {
                for (source_1 = __asyncValues(source); source_1_1 = yield source_1.next(), !source_1_1.done;) {
                    const message = source_1_1.value;
                    d += message.toString();
                    try {
                        msg = JSON.parse(d);
                    }
                    catch (error) {
                        continue;
                    }
                    if (msg.from !== remotePeer) {
                        continue;
                    }
                    try {
                        const parsedData = JSON.parse(Buffer.from(msg.data, 'hex').toString());
                        const m = {
                            from: msg.from,
                            to: msg.to,
                            data: parsedData
                        };
                        this.emit('message', m);
                    }
                    catch (e) {
                        this.emit('error', e);
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (source_1_1 && !source_1_1.done && (_a = source_1.return)) yield _a.call(source_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
        }); });
    }
    get peerId() {
        return this.libp2p.peerId.toB58String();
    }
    sendTo(peer, message) {
        return __awaiter(this, void 0, void 0, function* () {
            const p = peer_id_1.default.createFromCID(peer);
            const peerInfo = this.libp2p.peerStore.get(p);
            const { stream } = yield this.libp2p.dialProtocol(peerInfo.id, exports.PROTOCOL);
            const msg = {
                from: this.peerId,
                to: peer,
                data: Buffer.from(JSON.stringify(message)).toString('hex')
            };
            yield it_pipe_1.default(JSON.stringify(msg), stream);
        });
    }
}
exports.default = DirectChat;
// Dictionary of libp2p listeners
DirectChat.protocols = {};
