import type {IPv4Address} from "./IPv4Address.js";
import type {IPv4Network} from "./IPv4Network.js";

export type IPv4Input =
  IPv4Address | string | number

export type IPv4NetworkInput =
  IPv4Input | IPv4Network

export type ParserResult = {
  address: string
  addressAsInteger: number
  prefix: number
}

export type IPv4AddressAsString = string
export type IPv4AddressWithCidrAsString = string
export type IPv4AddressInAddrArpa = string
