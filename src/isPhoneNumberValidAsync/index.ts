import { PhoneNumber } from '../types';

/**
 * Check if a given international phone number is valid.
 *
 * > **This method uses [dynamic import](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import) under the hood, use only if your builder supports it**
 */
const isPhoneNumberValidAsync = async ({
  iso2,
  nationalNumber,
}: PhoneNumber): Promise<boolean> =>
  !!iso2 &&
  (await import(`../phoneValidationPatterns/${iso2}`)).default.test(
    nationalNumber
  );

export default isPhoneNumberValidAsync;
