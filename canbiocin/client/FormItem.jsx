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
  handleIngredientChange,
  editable,
  params,
}) {
  const [error, setError] = React.useState(false);
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
    handleIngredientChange()
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

  const getParams = () => {
    if (!editable && error) {
      setError(false)
    }
    let updatedParams = {
      onChange: handleChange,
      value: getter(obj),
      editable: editable,
      error: error,
      ...params,
    }
    return updatedParams
  }

  return (renderItem(getParams()))
}
