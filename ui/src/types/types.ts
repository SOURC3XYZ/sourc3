export interface IApiReq {
  jsonrpc: string,
  id: number | string,
  method: string,
  params: any
}
