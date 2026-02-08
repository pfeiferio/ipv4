import {IPv4Address} from "./IPv4Address.js";
import {getCommonPrefixLength, getNetworkAddress, intToIp, ipV4} from "./utils.js";
import type {IPv4AddressAsString, IPv4AddressWithCidrAsString, IPv4Input, IPv4NetworkInput} from "./types.js";

export class IPv4Network {

  readonly #addressAsInteger: number
  readonly #prefix: number
  readonly #address: string

  constructor(address: IPv4NetworkInput) {
    if (address instanceof IPv4Network) {
      this.#address = address.#address
      this.#addressAsInteger = address.#addressAsInteger
      this.#prefix = address.#prefix
      return
    } else if (!(address instanceof IPv4Address)) {
      address = new IPv4Address(address)
    }

    this.#addressAsInteger = getNetworkAddress(address.toInteger(), address.prefix)
    this.#address = intToIp(this.#addressAsInteger)
    this.#prefix = address.prefix
  }

  get addressWithCidr(): IPv4AddressWithCidrAsString {
    return `${this.address}/${this.prefix}`
  }

  get address(): IPv4AddressAsString {
    return this.#address
  }

  get prefix(): number {
    return this.#prefix
  }

  get size(): number {
    return 2 ** (32 - this.prefix)
  }

  get firstHost(): IPv4Address | null {
    if (this.prefix >= 31) return null;
    return new IPv4Address(this.toInteger() + 1);
  }

  get lastHost(): IPv4Address | null {
    if (this.prefix >= 31) return null;
    return new IPv4Address(this.toInteger() + this.size - 2);
  }

  get broadcast(): IPv4Address {
    return new IPv4Address(this.toInteger() + this.size - 1);
  }

  get netmask(): IPv4Address {
    const mask = (0xFFFFFFFF << (32 - this.prefix)) >>> 0;
    return new IPv4Address(mask);
  }

  get hostmask(): IPv4Address {
    return new IPv4Address((2 ** (32 - this.prefix)) - 1, null, {allowZeroOctet: true});
  }

  get hostCount(): number {
    const s = this.size;
    return s <= 2 ? 0 : s - 2;
  }

  contains(other: IPv4Input): boolean {
    other = ipV4(other)

    const prefix = this.prefix
    const mask =
      prefix === 0
        ? 0
        : (0xFFFFFFFF << (32 - prefix)) >>> 0

    return ((other.toInteger() & mask) >>> 0) === this.toInteger()
  }

  overlaps(other: IPv4NetworkInput): boolean {
    if (!(other instanceof IPv4Network)) {
      other = new IPv4Network(other)
    }

    const startA = this.toInteger()
    const endA = startA + this.size - 1

    const startB = other.toInteger()
    const endB = startB + other.size - 1

    return startA <= endB && startB <= endA
  }

  containsNetwork(other: IPv4NetworkInput) {
    if (!(other instanceof IPv4Network)) {
      other = new IPv4Network(other)
    }

    const startA = this.toInteger()
    const endA = startA + this.size - 1

    const startB = other.toInteger()
    const endB = startB + other.size - 1

    return startA <= startB && endB <= endA
  }

  isSubnetOf(other: IPv4NetworkInput): boolean {
    if (!(other instanceof IPv4Network)) {
      other = new IPv4Network(other)
    }
    return other.containsNetwork(this)
  }

  isSupernetOf(other: IPv4NetworkInput): boolean {
    return this.containsNetwork(other)
  }

  sharedPrefixLength(other: IPv4NetworkInput): number {
    if (!(other instanceof IPv4Network)) {
      other = new IPv4Network(other)
    }
    return getCommonPrefixLength(this.toInteger(), other.toInteger())
  }

  toInteger(): number {
    return this.#addressAsInteger
  }

  toString(): string {
    return this.addressWithCidr
  }

  equals(other: IPv4Input): boolean {
    other = ipV4(other)
    return this.toInteger() === other.toInteger() &&
      this.prefix === other.prefix;
  }

  * hosts(keepPrefix: boolean = false): Generator<IPv4Address, void | IPv4Address, undefined | IPv4Address> {
    if (this.prefix >= 31) return;

    const start = this.toInteger() + 1;
    const end = this.toInteger() + this.size - 1;

    for (let i = start; i < end; i++) {
      yield new IPv4Address(i, keepPrefix ? this.prefix : 32);
    }
  }

  * addresses(keepPrefix: boolean = false): Generator<IPv4Address, void | IPv4Address, undefined | IPv4Address> {
    const start = this.toInteger();
    const end = start + this.size;
    for (let i = start; i < end; i++) {
      yield new IPv4Address(i, keepPrefix ? this.prefix : 32);
    }
  }
}
