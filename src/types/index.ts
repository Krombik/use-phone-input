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
   */
  toPhoneNumber(value: string): PhoneNumber;
  /** @internal */
  toPhoneNumber(value: string, data: DataTuple): void;
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
