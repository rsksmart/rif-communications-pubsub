export type JsonPrimitive = string | number | boolean | null
export type JsonObject = { [member: string]: JsonSerializable }
export type JsonArray = JsonSerializable[]
export type JsonSerializable = JsonPrimitive | JsonObject | JsonArray

export interface Message<T = JsonSerializable> {
  from: string
  to?: string
  data: T
  seqno: Buffer
  topicIDs: Array<string>
  signature: Buffer
  key: Buffer
}

export interface Options {
  pollInterval?: number
  ignoreSelfMessages?: boolean
}
