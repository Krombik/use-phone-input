import ISO2 from './ISO2';

export type PhoneNumber = {
  iso2: ISO2 | '';
  countryCode: string;
  nationalNumber: string;
  formattedValue: string;
};

/** @internal */
export type DataTuple = [
  currValue: PhoneNumber,
  setValue: (value: PhoneNumber) => void,
  onChange: (e: { target: { value: string } }) => void,
  setCountry: (iso2: ISO2) => void
];

export interface PhoneNumberUtils {
  /**
   * Convert an input {@link value} into a standardized phone number object.
   * @param estimatedIso2 - ISO2 code, will be used for country detection if multiple countries have same country code and it can't be detected automatically for the current {@link value}
   */
  toPhoneNumber(value: string, estimatedIso2?: ISO2): PhoneNumber;
  /**
   * Retrieve the country calling code based on an {@link iso2 ISO2} country code
   */
  getCountryCode<T extends string>(
    iso2: T
  ): T extends ISO2 ? string : undefined;
  /**
   * Set a default {@link prefix} for country calling codes
   */
  setPrefix(prefix: string): void;
  /**
   * An array of ISO2 country codes
   */
  readonly iso2List: ISO2[];
}
