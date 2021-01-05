/// <reference types="node" />
export declare type JsonPrimitive = string | number | boolean | null;
export declare type JsonObject = {
    [member: string]: JsonSerializable;
};
export declare type JsonArray = JsonSerializable[];
export declare type JsonSerializable = JsonPrimitive | JsonObject | JsonArray;
export interface DirectMessage<T = JsonSerializable> {
    from: string;
    to: string;
    data: T;
}
export interface Message<T = JsonSerializable> {
    from: string;
    data: T;
    seqno: Buffer;
    topicIDs: Array<string>;
    signature: Buffer;
    key: Buffer;
}
export interface Options {
    pollInterval?: number;
    ignoreSelfMessages?: boolean;
}
export interface Dictionary<T> {
    [key: string]: T;
}
