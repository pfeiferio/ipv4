import {IPv4Network} from "./IPv4Network.js";
import {getCommonPrefixLength, ipV4, parseNumberToIp, parseStringToIp} from "./utils.js";
import type {IPv4AddressAsString, IPv4AddressInAddrArpa, IPv4AddressWithCidrAsString, IPv4Input} from "./types.js";

type IpV4Options = {
  allowZeroOctet?: boolean
}

export class IPv4Address {

  readonly #addressAsInteger: number = 0
  readonly #prefix: number
  readonly #address: string
  #network: IPv4Network | null = null
  static fromInteger: (value: number, prefix?: number) => IPv4Address;
  static fromString: (value: string) => IPv4Address;
  static isValid: (value: IPv4Input) => boolean;
  static private: () => IPv4Address[];
  static rfc1918: () => IPv4Address[];

  constructor(
    ipv4Address: IPv4Input,
    prefixOverride: number | null = null,
    {allowZeroOctet = false}: IpV4Options = {}
  ) {

    if (typeof ipv4Address === 'string') {
      const {address, prefix, addressAsInteger} = parseStringToIp(ipv4Address, prefixOverride)
      this.#addressAsInteger = addressAsInteger
      this.#prefix = prefix
      this.#address = address

      // Validate zero octet only for string input
      if (!allowZeroOctet) {
        this.#validateZeroOctet()
      }
    } else if (typeof ipv4Address === 'number') {
      const {address, prefix, addressAsInteger} = parseNumberToIp(ipv4Address)
      this.#addressAsInteger = addressAsInteger
      this.#prefix = prefixOverride ?? prefix
      this.#address = address
    } else if (ipv4Address instanceof IPv4Address) {
      this.#prefix = prefixOverride ?? ipv4Address.#prefix
      this.#address = ipv4Address.#address
      this.#addressAsInteger = ipv4Address.#addressAsInteger
    } else {
      throw new Error(`Invalid IPv4 address type: ${typeof ipv4Address}`)
    }
  }

  get prefix(): number {
    return this.#prefix
  }

  get address(): IPv4AddressAsString {
    return this.#address
  }

  get addressWithCidr(): IPv4AddressWithCidrAsString {
    return `${this.address}/${this.prefix}`
  }

  #validateZeroOctet(): void {
    const firstOctet = (this.#addressAsInteger >>> 24) & 0xFF;

    if (firstOctet !== 0) {
      return;
    }

    if (this.#addressAsInteger === 0 && [0, 8, 32].includes(this.#prefix)) {
      return
    }

    throw new Error('First octet cannot be 0 (except 0.0.0.0 with /0, /8, or /32)')
  }

  network(): IPv4Network {
    return this.#network ??= new IPv4Network(this)
  }

  isInSubnet(subnet: IPv4Input): boolean {
    return new IPv4Network(subnet).contains(this)
  }

  toString(): IPv4AddressAsString {
    return this.#address
  }

  toInteger(): number {
    return this.#addressAsInteger
  }

  equals(other: IPv4Input): boolean {
    other = ipV4(other)
    return this.toInteger() === other.toInteger() &&
      this.prefix === other.prefix;
  }

  isSameAddress(other: IPv4Input): boolean {
    return this.toInteger() === ipV4(other).toInteger();
  }

  next(): IPv4Address | null {
    if (this.toInteger() >= 0xFFFFFFFF) return null;
    return new IPv4Address(this.toInteger() + 1, this.prefix);
  }

  prev(): IPv4Address | null {
    if (this.toInteger() <= 0) return null;
    return new IPv4Address(this.toInteger() - 1, this.prefix);
  }

  withPrefix(prefix: number): IPv4Address {
    return new IPv4Address(this.#addressAsInteger, prefix)
  }

  isPrivate(): boolean {
    const int = this.#addressAsInteger;
    // 10.0.0.0/8
    if ((int & 0xFF000000) === 0x0A000000) return true;
    // 172.16.0.0/12
    if (((int & 0xFFF00000) >>> 0) === 0xAC100000) return true;
    // 192.168.0.0/16
    if (((int & 0xFFFF0000) >>> 0) === 0xC0A80000) return true;
    return false;
  }

  isPublic(): boolean {
    return !this.isPrivate() && !this.isLoopback() && !this.isLinkLocal()
      && !this.isMulticast() && !this.isReserved();
  }

  isLoopback(): boolean {
    // 127.0.0.0/8
    return (this.#addressAsInteger & 0xFF000000) === 0x7F000000;
  }

  isLinkLocal(): boolean {
    // 169.254.0.0/16
    return ((this.#addressAsInteger & 0xFFFF0000) >>> 0) === 0xA9FE0000;
  }

  isMulticast(): boolean {
    // 224.0.0.0/4 (224-239.x.x.x)
    return ((this.#addressAsInteger & 0xF0000000) >>> 0) === 0xE0000000;
  }

  isReserved(): boolean {
    // 240.0.0.0/4 (240-255.x.x.x)
    return ((this.#addressAsInteger & 0xF0000000) >>> 0) === 0xF0000000;
  }

  reversePointer(): IPv4AddressInAddrArpa {
    const octets = this.#address.split('.');
    return `${octets[3]}.${octets[2]}.${octets[1]}.${octets[0]}.in-addr.arpa`;
  }

  toBinary(): string {
    const format = (len: number, fill: boolean = true): string =>
      ((this.#addressAsInteger >>> len) & 0xFF).toString(2).padStart(fill ? 8 : 0, '0')
    return `${format(24, false)}${format(16)}${format(8)}${format(0)}`
  }

  toBinaryAddress(): string {
    const format = (len: number): string => ((this.#addressAsInteger >>> len) & 0xFF).toString(2).padStart(8, '0')
    return `${format(24)}.${format(16)}.${format(8)}.${format(0)}`
  }

  toHex(): string {
    return this.#addressAsInteger.toString(16).toUpperCase().padStart(8, '0');
  }

  sharedPrefixLength(other: IPv4Input): number {
    if (!(other instanceof IPv4Address)) {
      other = new IPv4Address(other)
    }
    return getCommonPrefixLength(this.toInteger(), other.toInteger())
  }
}

IPv4Address.fromInteger = (value: number, prefix: number = 32): IPv4Address => new IPv4Address(value, prefix)
IPv4Address.fromString = (value): IPv4Address => ipV4(value)
IPv4Address.isValid = (value: IPv4Input): boolean => {
  try {
    new IPv4Address(value);
    return true;
  } catch {
    return false;
  }
}
IPv4Address.private = (): IPv4Address[] => [
  new IPv4Address('10.0.0.0/8'),
  new IPv4Address('172.16.0.0/12'),
  new IPv4Address('192.168.0.0/16')
]
IPv4Address.rfc1918 = (): IPv4Address[] => IPv4Address.private()
