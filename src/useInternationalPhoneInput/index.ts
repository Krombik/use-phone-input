import { DataTuple, PhoneNumberUtils, PhoneNumber } from '../types';

import useConst from 'react-helpful-utils/useConst';

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
  const data = useConst<DataTuple>(() => [
    value,
    onChange,
    (e) => {
      utils.toPhoneNumber(e.target.value, data);
    },
    (iso2) => {
      utils.toPhoneNumber(utils.getCountryCode(iso2) || '', data);
    },
  ]);

  data[0] = value;

  data[1] = onChange;

  return {
    inputProps: {
      type: 'tel' as const,
      value: value.formattedValue,
      onChange: data[2],
    },
    setCountry: data[3],
  };
};

export default useInternationalPhoneInput;
