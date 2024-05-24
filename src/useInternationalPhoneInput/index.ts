import { DataTuple, PhoneNumberUtils, PhoneNumber } from '../types';

import useConst from 'react-helpful-utils/useConst';
import ISO2 from '../types/ISO2';

/**
 * @example
 * ```jsx
 * import phoneNumberUtils from 'use-phone-input/phoneNumberUtils';
 * import useInternationalPhoneInput from 'use-phone-input/useInternationalPhoneInput';
 *
 * // use it if you want to have no prefix in formatted phone number
 * phoneNumberUtils.setPrefix('');
 *
 * const PhoneInput = () => {
 *   const [phone, setPhone] = useState(phoneNumberUtils.toPhoneNumber(''));
 *
 *   const { inputProps, setCountry } = useInternationalPhoneInput(
 *     phoneNumberUtils,
 *     phone,
 *     setPhone
 *   );
 *
 *   return (
 *     <div>
 *       <select
 *         value={phone.iso2}
 *         onChange={(e) => {
 *           setCountry(e.target.value);
 *         }}
 *       >
 *         <option value="">-</option>
 *         {phoneNumberUtils.iso2List.map((iso2) => (
 *           <option key={iso2} value={iso2}>
 *             {iso2}
 *           </option>
 *         ))}
 *       </select>
 *       <input {...inputProps} />
 *     </div>
 *   );
 * };
 * ```
 */
const useInternationalPhoneInput = (
  utils: PhoneNumberUtils,
  value: PhoneNumber,
  onChange: (value: PhoneNumber) => void
) => {
  const data = useConst<DataTuple>(() => {
    let estimatedIso2: ISO2 | undefined;

    return [
      value,
      onChange,
      ({ target, nativeEvent }) => {
        let { value: inputValue, selectionStart } = target as HTMLInputElement;

        const prevInputValue = data[0].formattedValue;

        if (
          selectionStart &&
          (nativeEvent as InputEvent).inputType == 'deleteContentBackward' &&
          /\D/.test(prevInputValue[selectionStart])
        ) {
          inputValue =
            inputValue.slice(0, selectionStart - 1) +
            inputValue.slice(selectionStart--);
        }

        const nextValue = utils.toPhoneNumber(inputValue, estimatedIso2);

        const nextInputValue = nextValue.formattedValue;

        if (prevInputValue != nextInputValue) {
          if (estimatedIso2 && estimatedIso2 != nextValue.iso2) {
            estimatedIso2 = undefined;
          }

          data[1](nextValue);
        }

        if (selectionStart != inputValue.length) {
          let nextCaretPosition = 0;

          for (
            let i = inputValue
              .slice(0, selectionStart!)
              .replace(/\D/g, '').length;
            nextCaretPosition < nextInputValue.length &&
            (/\D/.test(nextInputValue[nextCaretPosition]) || i--);
            nextCaretPosition++
          ) {}

          setTimeout(() => {
            (target as HTMLInputElement).setSelectionRange(
              nextCaretPosition,
              nextCaretPosition
            );
          }, 0);
        }
      },
      (iso2) => {
        const prevValue = data[0];

        if (iso2 != prevValue.iso2) {
          estimatedIso2 = iso2;

          const nextValue = utils.toPhoneNumber(
            utils.getCountryCode(iso2) || '',
            estimatedIso2
          );

          if (prevValue.formattedValue != nextValue.formattedValue) {
            data[1](nextValue);
          }
        }
      },
    ];
  });

  data[0] = value;

  data[1] = onChange;

  return {
    inputProps: {
      type: 'tel' as const,
      value: value.formattedValue,
      onInput: data[2],
    },
    setCountry: data[3],
  };
};

export default useInternationalPhoneInput;
