import { PhoneNumber } from '../types';

/**
 * Checks if the given international phone number is valid based on the provided {@link phoneValidationPatterns validation patterns}.
 * @param phoneValidationPatterns - Object containing validation patterns for different countries, keyed by ISO2 country code.
 * @returns `true` if the phone number is valid, `false` otherwise.
 */
const isPhoneNumberValid = (
  phoneValidationPatterns: Record<string, RegExp>,
  { iso2, nationalNumber }: PhoneNumber
) => !!iso2 && phoneValidationPatterns[iso2].test(nationalNumber);

export default isPhoneNumberValid;
