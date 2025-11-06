const React = require('React');

import { Field } from './Field';
import { timestampToDate } from './timestamp.js';
import { dateToTimestamp } from './timestamp.js';
import { moneyToString } from './money.js';
import { floatToMoney } from './money.js';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import dayjs from 'dayjs';

export const TEXTFIELD = "TextField";
export const DROPDOWN = "DropDown";
export const DATEPICKER = "DatePicker";

const CapitalizeFirstLetter = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export const PropsProvider = (obj, editable, handleChange) => (type) => {
  let defaultProps = {
    obj: obj,
    editable: editable,
    handleItemChange : handleChange,
  }

  let defaultFieldProps = {
    ...defaultProps,
    params: {
      size: "small",
      variant: "standard",
    }
  }

  if (!type || type == 'number' || type == 'money') {
    return defaultFieldProps
  } else {
    return defaultProps
  }
}

// PropsProvider is expected to be a function
export const NewFormItem = ({field, label, type, units, renderItem, props_provider, extra_params = {}}) => {
      if (!renderItem) {
        renderItem = (params) => (
            <Field
                {...params}
            />
        )
      }

      if (label == undefined) {
        label = CapitalizeFirstLetter(field)
      }

      let fieldType = 'string';
      let dollars = false;

      if (type == 'number' || type == 'money') {
        fieldType = 'number'
      }

      let getter = (obj) => {return obj[field]}
      let setter = (obj, newValue) => {obj[field] = newValue}

      if (type == 'money') {
        getter = (obj) => {return moneyToString(obj[field], 2, true)};
        setter = (obj, newValue) => {obj[field] = floatToMoney(newValue)};
        dollars = true;
      } else if (type == DATEPICKER) {
        getter = (obj) => {return dayjs(timestampToDate(obj[field]))};
        setter = (obj, newValue) => {obj[field] = dateToTimestamp(newValue.toDate())};

        renderItem = (params) => (
          <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker {...params} />
          </LocalizationProvider>
        );
      }
    
      let props = props_provider(type)
      let itemType 

      if (!type || type == 'number' || type == 'money') {
        itemType = TEXTFIELD
      } else {
        itemType = type
      }

      let validater = null
      if (type == 'number' || type == 'money' || type == DATEPICKER ) {
        validater=(obj, newValue) => {return Boolean(newValue && (newValue > 0))}
      } else if (extra_params && extra_params.multiline) {
        validater=null
      } else {
        validater=(obj, newValue) => {return Boolean(newValue && (newValue.length > 0))}
      }

      return (
      <FormItem
        type={itemType}
        field={field}
        {...props}
        getter={getter}
        setter={setter}
        renderItem={renderItem}
        validater={validater}
        params={{
          id: field,
          label: label,
          type: fieldType,
          units: units,
          dollars:dollars,
          ...props.params,
          ...extra_params,
        }}
      />
      )
  }

export function FormItem({
  obj,
  field,
  type,  // TextField, Dropdown, Datepicker
  getter,
  setter,
  validater,
  renderItem,
  handleItemChange,
  editable,
  params,
}) {
  const isValid = () => {
    if (validater) {
      let v = validater(obj, getter(obj))
      return validater(obj, getter(obj))
    }
    return true
  }

  const [error, setError] = React.useState(!isValid())
  const [value, setValue] = React.useState(getter(obj));

  const handleDatePickerChange = (newValue) => {
    handleBaseChange(newValue)
  }

  type = type ? type : TEXTFIELD;

  const handleBaseChange = (newValue) => {
    let isError = false
    if (validater) {
      isError = !validater(obj, newValue)
    }
    setter(obj, newValue)
    setValue(getter(obj))
    handleItemChange(field, !isError)
    setError(isError)
  }

  // Initialize the error state
  React.useEffect(() => {
    const initErrorState = async () => {
      handleItemChange(field, isValid())
    };
    initErrorState()
  })
  

  const handleDropdownChange = (newValue) => {
    handleBaseChange(newValue)
  }

  const handleFieldChange = (event) => {
    if (event.target) {
      handleBaseChange(event.target.value)
    }
  }

  const handleChange = (a, b, c) => {
    if (type == TEXTFIELD) {
      handleFieldChange(a)
    } else if (type == DROPDOWN) {
      handleDropdownChange(a)
    } else if (type == DATEPICKER) {
      handleDatePickerChange(a)
    }
  }

  const getParams = () => {
    let updatedParams = {
      onChange: handleChange,
      value: getter(obj),
      editable: editable,
      error: !editable ? false : error,
      ...params,
    }
    return updatedParams
  }

  return (renderItem(getParams()))
}
