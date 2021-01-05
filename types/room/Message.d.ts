/// <reference types="node" />
export interface Message {
    from: string;
    to?: string;
    data: Buffer;
    seqno: Buffer;
    topicIDs: string[];
}
