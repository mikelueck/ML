const React = require('React');

export const TEXTFIELD = "TextField";
export const DROPDOWN = "DropDown";
export const DATEPICKER = "DatePicker";

export function FormItem({
  obj,
  field,
  type,  // TextField, Dropdown, Datepicker
  getter,
  setter,
  validater,
  renderItem,
  handleIngredientChange,
  editable,
  params,
}) {
  const isValid = () => {
    let v = validater(obj, getter(obj))
    return validater(obj, getter(obj))
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
    handleIngredientChange(field, !isError)
    setError(isError)
  }

  // Initialize the error state
  React.useEffect(() => {
    const initErrorState = async () => {
      handleIngredientChange(field, isValid())
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
