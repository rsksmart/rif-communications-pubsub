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
exports.createLibP2P = void 0;
const libp2p_1 = __importDefault(require("libp2p"));
const peer_id_1 = __importDefault(require("peer-id"));
exports.createLibP2P = (config) => __awaiter(void 0, void 0, void 0, function* () {
    let libp2p;
    if ((config === null || config === void 0 ? void 0 : config.peerId) instanceof peer_id_1.default) {
        libp2p = new libp2p_1.default(config);
    }
    else {
        const peerId = yield peer_id_1.default.create();
        libp2p = new libp2p_1.default(Object.assign(Object.assign({}, config), { peerId }));
    }
    yield libp2p.start();
    return libp2p;
});
