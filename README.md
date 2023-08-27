# use-phone-input

> This library requires React v16.8 or later.

Simplify phone number handling in React applications with automatic formatting, validation, and country code selection for international numbers. This library also provides the flexibility to work exclusively with specific countries, effectively reducing the final bundle size of your application. All phone number data is sourced from the [Google phone number lib](https://github.com/google/libphonenumber). Moreover, the library is equipped with automated update checks every day.

## Installation

using npm:

```
npm install --save use-phone-input
```

or yarn:

```
yarn add use-phone-input
```

or pnpm:

```
pnpm add use-phone-input
```

---

## API

- [useInternationalPhoneInput](#useinternationalphoneinput)
- [createPhoneNumberUtils](#createphonenumberutils)
- [phoneNumberUtils](#phonenumberutils)
- [isPhoneNumberValid](#isphonenumbervalid)
- [isPhoneNumberValidAsync](#isphonenumbervalidasync)

### useInternationalPhoneInput

Simplify international phone number handling in React apps with automatic formatting and country code selection.

```ts
type PhoneNumber = {
  iso2: ISO2 | '';
  countryCode: string;
  nationalNumber: string;
  formattedValue: string;
};

const useInternationalPhoneInput: (
  utils: PhoneNumberUtils,
  value: PhoneNumber,
  onChange: (value: PhoneNumber) => void
) => {
  inputProps: {
    type: 'tel';
    value: string;
    onChange(e: {
      target: {
        value: string;
      };
    }): void;
  };
  setCountry(iso2: ISO2): void;
};
```

Example:

```jsx
import phoneNumberUtils from 'use-phone-input/phoneNumberUtils';
import useInternationalPhoneInput from 'use-phone-input/useInternationalPhoneInput';

// use it if you want to have no prefix in formatted phone number
phoneNumberUtils.setPrefix('');

const PhoneInput = () => {
  const [phone, setPhone] = useState(phoneNumberUtils.toPhoneNumber(''));

  const { inputProps, setCountry } = useInternationalPhoneInput(
    phoneNumberUtils,
    phone,
    setPhone
  );

  return (
    <div>
      <select
        value={phone.iso2}
        onChange={(e) => {
          setCountry(e.target.value);
        }}
      >
        {phoneNumberUtils.iso2List.map((iso2) => (
          <option key={iso2} value={iso2}>
            {iso2}
          </option>
        ))}
      </select>
      <input {...inputProps} />
    </div>
  );
};
```

---

### createPhoneNumberUtils

Generate utils for specific list of countries, use it if you need to handle specific countries numbers, otherwise just use [phoneNumberUtils](#phonenumberutils)

```ts
type PhoneNumberUtils = {
  toPhoneNumber(value: string): PhoneNumber;
  getCountryCode<T extends string>(
    iso2: T
  ): T extends ISO2 ? string : undefined;
  setPrefix(prefix: string): void;
  readonly iso2List: ISO2[];
};

const createPhoneNumberUtils: (
  data: PhoneNumberFormat[],
  prefix?: string // '+' by default
) => PhoneNumberUtils;
```

Example:

```js
import createPhoneNumberUtils from 'use-phone-input/createPhoneNumberUtils';
import CA from 'use-phone-input/phoneNumberFormats/CA';
import US from 'use-phone-input/phoneNumberFormats/US';

// generates utils only for Canada and USA phone numbers
const phoneNumberUtils = createPhoneNumberUtils([CA, US]);
```

---

### phoneNumberUtils

Utils for all countries

```ts
const phoneNumberUtils: PhoneNumberUtils;
```

---

### isPhoneNumberValid

Check if a given international phone number is valid based on provided phoneValidationPatterns validation patterns

```ts
const isPhoneNumberValid: (
  phoneValidationPatterns: Record<string, RegExp>,
  value: PhoneNumber
) => boolean;
```

Example:

```js
import isPhoneNumberValid from 'use-phone-input/isPhoneNumberValid';

import phoneValidationPatterns from 'use-phone-input/phoneValidationPatterns';

import CA from 'use-phone-input/phoneValidationPatterns/CA';
import US from 'use-phone-input/phoneValidationPatterns/US';

isPhoneNumberValid(phoneValidationPatterns, value);

isPhoneNumberValid({ CA, US }, value);
```

---

### isPhoneNumberValidAsync

Check if a given international phone number is valid.

> This method uses [dynamic import](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import) under the hood, use only if your builder supports it

```ts
const isPhoneNumberValidAsync = (value: PhoneNumber) => Promise<boolean>;
```

---

## License

MIT © [Krombik](https://github.com/Krombik)
