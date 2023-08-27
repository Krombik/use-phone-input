import ISO2 from './iso2';

type PhoneNumberMainData = [
  countryCode: number,
  iso2: ISO2,
  maxLength: number,
  format: string,
  ...(string | number)[]
];

type PhoneNumberData =
  | PhoneNumberMainData
  | [...PhoneNumberMainData, leadingDigits: RegExp];

export default PhoneNumberData;
