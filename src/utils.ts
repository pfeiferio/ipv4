import {IPv4Address} from "./IPv4Address.js";
import type {IPv4Input, ParserResult} from "./types.js";

/**
 * Convert a 32-bit integer to an IPv4 address in dotted-decimal notation.
 *
 * @param value - Unsigned 32-bit integer
 * @returns IPv4 address (e.g. "192.168.0.1")
 */
export const intToIp = (value: number): string => {
  if (!Number.isInteger(value) || value < 0 || value > 0xFFFFFFFF) {
    throw new Error('Invalid IPv4 integer')
  }

  return [
    (value >>> 24) & 0xFF,
    (value >>> 16) & 0xFF,
    (value >>> 8) & 0xFF,
    value & 0xFF
  ].join('.')
}

export const ipV4 = (address: IPv4Input): IPv4Address => new IPv4Address(address)

/**
 * Convert an IPv4 address from dotted-decimal notation to a 32-bit integer.
 *
 * @param ipv4Address - IPv4 address (e.g. "192.168.0.1")
 * @returns Unsigned 32-bit integer representation
 */
export const ipToInt = (ipv4Address: string): number => {

  const parts = ipv4Address.split('/') as [string, string | undefined]

  if (parts.length > 2) {
    throw new Error('Invalid IPv4 address format: too many "/" separators')
  }

  return parts[0].split('.').reduce((acc, part, _idx, arr) => {

    if (arr.length !== 4) {
      throw new Error('IPv4 address must have exactly 4 octets');
    }

    const num = Number(part);

    if (!Number.isInteger(num)) {
      throw new Error(`Octet "${part}" is not a valid integer`);
    }

    if (num < 0 || num > 255) {
      throw new Error(`Octet ${num} is out of range (0-255)`);
    }

    return ((acc << 8) | num) >>> 0;
  }, 0);
}

export const parseStringToIp = (ipv4Address: string, prefixOverride: number | null = null): ParserResult => {

  const parts = ipv4Address.split('/') as [string, string | undefined]

  if (parts.length > 2) {
    throw new Error('Invalid IPv4 address format: too many "/" separators')
  }

  let [address, prefixValue = 32] = parts;
  const prefix = prefixOverride ?? Number(prefixValue);

  if (!Number.isInteger(prefix)) {
    throw new Error(`Prefix "${prefixValue}" is not a valid integer`);
  }

  if (prefix < 0 || prefix > 32) {
    throw new Error(`Prefix ${prefix} is out of range (0-32)`);
  }

  const addressAsInteger = ipToInt(address)
  address = intToIp(addressAsInteger)

  return {
    address,
    addressAsInteger,
    prefix
  }
}

export const parseNumberToIp = (ipv4Address: number): ParserResult => {
  return {
    address: intToIp(ipv4Address),
    addressAsInteger: ipv4Address,
    prefix: 32
  }
}

/**
 * Calculate the network address for an IPv4 address and CIDR prefix.
 *
 * @param ip - IPv4 address or its 32-bit integer representation
 * @param prefix - CIDR prefix length (0–32)
 * @returns Network address as unsigned 32-bit integer
 */
export const getNetworkAddress = (ip: number | string, prefix: number): number => {
  ip = typeof ip === 'number' ? ip : ipToInt(ip)

  if (!Number.isInteger(ip) || ip < 0 || ip > 0xFFFFFFFF) {
    throw new Error('Invalid IPv4 integer')
  }

  if (!Number.isInteger(prefix) || prefix < 0 || prefix > 32) {
    throw new Error('Invalid prefix')
  }

  if (prefix === 0) {
    return 0
  }

  const mask = (0xFFFFFFFF << (32 - prefix)) >>> 0
  return (ip & mask) >>> 0
}

/**
 * Determine the longest common CIDR prefix length shared by two IPv4 addresses.
 *
 * @param a - First IPv4 address as 32-bit integer
 * @param b - Second IPv4 address as 32-bit integer
 * @returns Common prefix length (0–32)
 */
export const getCommonPrefixLength = (a: number, b: number): number =>
  Math.clz32((a ^ b) >>> 0)
