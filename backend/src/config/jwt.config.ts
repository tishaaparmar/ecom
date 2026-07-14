import type { StringValue } from 'ms';

export type JwtExpiresIn = StringValue | number;

const JWT_EXPIRES_IN_PATTERN =
  /^\d+(\s?(ms|msec|msecs|millisecond|milliseconds|s|sec|secs|second|seconds|m|min|mins|minute|minutes|h|hr|hrs|hour|hours|d|day|days|w|week|weeks|y|yr|yrs|year|years))?$/i;

export function isValidJwtExpiresIn(value: string): boolean {
  return JWT_EXPIRES_IN_PATTERN.test(value.trim());
}

export function parseJwtExpiresIn(value: string): JwtExpiresIn {
  const trimmedValue = value.trim();

  if (/^\d+$/.test(trimmedValue)) {
    return Number(trimmedValue);
  }

  if (!isValidJwtExpiresIn(trimmedValue)) {
    throw new Error('JWT_EXPIRES_IN must be a valid timespan, for example 15m');
  }

  return trimmedValue as StringValue;
}
