const React = require('React');

export const TEXTFIELD = "TextField";
export const DROPDOWN = "DropDown";
export const DATEPICKER = "DatePicker";

export function FormItem({
  obj,
  type,  // TextField, Dropdown, Datepicker
  getter,
  setter,
  validater,
  renderItem,
  editable,
  params,
}) {
  const [error, setError] = React.useState(false);

  const handleDatePickerChange = (newValue) => {
    handleBaseChange(newValue)
  }

  type = type ? type : TEXTFIELD;

  const handleBaseChange = (newValue) => {
    let isError = false
    if (validater) {
      isError = !validater(obj, newValue)
    }
    if (!isError) {
      setter(obj, newValue)
    }
    setError(isError)
  }

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
      handleDropdownChange(b)
    } else if (type == DATEPICKER) {
      handleDatePickerChange(a)
    }
  }

  let updatedParams = {
    onChange: handleChange,
    defaultValue: getter(obj),
    editable: editable,
    error: error,
    ...params,
  }

  return (renderItem(updatedParams))
}
