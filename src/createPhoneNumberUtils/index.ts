import type { DataTuple, PhoneNumberUtils, PhoneNumber } from '../types';
import type PhoneNumberData from '../types/PhoneNumberData';
import type ISO2 from '../types/ISO2';
import {
  MASK_SYMBOL,
  MAX_CALLING_CODE_LENGTH,
  MAX_NUMBER_LENGTH,
} from '../constants';

/**
 * Generates utility functions for formatting, parsing, and managing international phone numbers
 * @param [prefix='+'] - Default prefix for country calling codes
 * @returns An object containing utility functions for phone number handling
 */
const createPhoneNumberUtils = (data: PhoneNumberData[], prefix = '+') => {
  const callingCodeDataMap = new Map<string, PhoneNumberData[]>();

  const iso2DataMap = new Map<string, string>();

  const iso2List: ISO2[] = [];

  for (let i = 0; i < data.length; i++) {
    const item = data[i];

    const callingCode = String(item[0]);

    const iso2 = item[1];

    iso2List.push(iso2);

    iso2DataMap.set(iso2, callingCode);

    if (callingCodeDataMap.has(callingCode)) {
      callingCodeDataMap.get(callingCode)!.push(item);
    } else {
      callingCodeDataMap.set(callingCode, [item]);
    }
  }

  return {
    iso2List,
    setPrefix(newPrefix) {
      prefix = newPrefix;
    },
    getCountryCode: iso2DataMap.get.bind(iso2DataMap),
    toPhoneNumber(value: string, data?: DataTuple): PhoneNumber | undefined {
      let isSame: boolean | undefined;

      let countries: PhoneNumberData[] | undefined;

      let countryCode: string = '';

      const withPrefix = prefix && value.startsWith(prefix);

      const prevValue = data && data[0];

      value = (withPrefix ? value.slice(prefix.length) : value).replace(
        /\D/g,
        ''
      );

      if (
        prevValue &&
        prevValue.iso2 &&
        value.startsWith(prevValue.countryCode)
      ) {
        isSame = true;

        countryCode = prevValue.countryCode;

        countries = callingCodeDataMap.get(countryCode);
      } else {
        for (let i = Math.min(MAX_CALLING_CODE_LENGTH, value.length); i--; ) {
          countryCode = value.slice(0, i);

          if (callingCodeDataMap.has(countryCode)) {
            countries = callingCodeDataMap.get(countryCode)!;

            break;
          }
        }
      }

      let nationalNumber = value.slice(countryCode.length);

      let iso2: ISO2 | '' = '';

      let formattedValue =
        ((withPrefix || countryCode) && prefix) + countryCode;

      if (countries) {
        let countryData: PhoneNumberData;

        const countriesCount = countries.length;

        if (countriesCount == 1) {
          countryData = countries[0];
        } else {
          let mainCountry: PhoneNumberData | undefined;

          for (let i = 0; i < countriesCount; i++) {
            const item = countries[i];

            if (item.length % 2) {
              mainCountry = item;
            } else if ((item[item.length - 1] as RegExp).test(nationalNumber)) {
              countryData = item;

              break;
            }
          }

          countryData ||= mainCountry || countries[countriesCount - 1];
        }

        const formatsEnd = countryData.length - (countryData.length % 2);

        iso2 = countryData[1];

        nationalNumber = nationalNumber.slice(
          0,
          countryData[formatsEnd - 2] as number
        );

        isSame &&= prevValue && nationalNumber == prevValue.nationalNumber;

        if (nationalNumber && !isSame) {
          for (let i = 2; i < formatsEnd; i += 2) {
            if (nationalNumber.length <= (countryData[i] as number)) {
              const format = countryData[i + 1] as string;

              formattedValue += ' ';

              for (let i = 0, shift = 0; i < nationalNumber.length; i++) {
                const p = format[i + shift];

                if (p == MASK_SYMBOL) {
                  formattedValue += nationalNumber[i];
                } else {
                  formattedValue += p + nationalNumber[i];

                  shift++;
                }
              }

              break;
            }
          }
        }
      } else {
        nationalNumber = nationalNumber.slice(0, MAX_NUMBER_LENGTH);

        formattedValue += nationalNumber;
      }

      const nextValue: PhoneNumber = {
        countryCode,
        iso2,
        nationalNumber,
        formattedValue,
      };

      if (!data) {
        return nextValue;
      }

      if (!isSame) {
        data[0] = nextValue;

        data[1](nextValue);
      }
    },
  } as PhoneNumberUtils;
};

export default createPhoneNumberUtils;
