const React = require('React');

import dayjs from 'dayjs';


import { timestampToDate } from './timestamp.js';
import { dateToTimestamp } from './timestamp.js';
import { moneyToString } from './money.js';
import { floatToMoney } from './money.js';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { Field } from './Field';
import { FormItem, TEXTFIELD, DROPDOWN, DATEPICKER } from './FormItem';
import { ConfirmDialog } from './Dialog';
import { AlertDialog } from './Dialog';
import { SppDropdown } from './Dropdowns';
import { CategoryDropdown } from './Dropdowns';
import { emptyIngredient } from './utils.js';

import { getGrpcClient } from './grpc.js';

import { AppBar,
         Box, 
         Button, 
         Dialog,
         DialogActions,
         DialogContent,
         DialogTitle,
         Grid,
         IconButton,
         Toolbar,
         Tooltip,
         Typography } from '@mui/material';

import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';

function getItemValue(ingredient) {
  return ingredient.item.value
}

const CapitalizeFirstLetter = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

const commonFields = {  
  "id": true,
  "costKg": true,
  "costShippingKg": true,
  // TODO "supplier" : true,
  "mostRecentQuoteDate": true,
  "markupPercent": true,
}

const fieldsByType = {
  "probiotic": {...commonFields, "spp": true, "strain": true},
  "prebiotic": {...commonFields, "category": true, "name": true, "function": true, "notes": true},
  "postbiotic": {...commonFields, "name": true, "bagSizeKg": true, "function": true, "notes": true},
}

export function Ingredient({ingredientType, ingredient, editable, handleChange}) {
  if (ingredient == null) {
    return (
        <>
        "Not Found"
        </>
    )
  }

  const SppFieldOrDropdown = (ingredient, editable) => {
    if (editable) {
      return (
      <NewFormItem
        field="spp"
        type={DROPDOWN}
        renderItem={(params) => (
          <SppDropdown
              {...params}
          />
        )} 
      />
      )
    } else {
      return (
      NewFormItem({field:'spp'})
      )
    }
  }

  const CategoryFieldOrDropdown = (ingredient, editable) => {
    if (editable) {
      return (
      <NewFormItem
        field="category"
        type={DROPDOWN}
        renderItem={(params) => (
          <CategoryDropdown
              {...params}
          />
        )} />
      )
    } else {
      return (
      NewFormItem({field:'category'})
      )
    }
  }

  let defaultProps = {
    obj: ingredient,
    editable: editable,
  }

  let defaultFieldProps = {
    ...defaultProps,
    params: {
      size: "small",
      variant: "standard",
    }
  }

  const NewFormItem = ({field, label, type, units, renderItem, extra_params = {}}) => {
      if (!fieldsByType[ingredientType][field]) {
        return null
      }
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

      let getter = (obj) => {return getItemValue(obj)[field]}
      let setter = (obj, newValue) => {getItemValue(obj)[field] = newValue}

      if (type == 'money') {
        getter = (obj) => {return moneyToString(getItemValue(obj)[field], 2, true)};
        setter = (obj, newValue) => {getItemValue(obj)[field] = floatToMoney(newValue)};
        dollars = true;
      } else if (type == DATEPICKER) {
        getter = (obj) => {return dayjs(timestampToDate(getItemValue(obj)[field]))};
        setter = (obj, newValue) => {getItemValue(obj)[field] = dateToTimestamp(newValue.toDate())};

        renderItem = (params) => (
          <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker {...params} />
          </LocalizationProvider>
        );
      }
    
      let props
      let itemType 

      if (!type || type == 'number' || type == 'money') {
        props = defaultFieldProps
        itemType = TEXTFIELD
      } else {
        props = defaultProps
        itemType = type
      }

      let validater
      if (type == 'number' || type == 'money' || type == DATEPICKER ) {
        validater=(obj, newValue) => {return Boolean(newValue && (newValue > 0))}
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
        handleIngredientChange={handleChange}
        validater={validater}
        params={{
          id: field,
          label: label,
          type: fieldType,
          units: units,
          dollars:dollars,
          ...defaultFieldProps.params,
          ...extra_params,
        }}
      />
      )
  }


  return (
    <>
    <Grid container rowSpacing={1} columnSpacing={{ xs:1, sm: 2, md: 3 }} sx={{ p: 2 }} spacing={4}>
      {/*{NewFormItem({field:'id', extra_params:{editable:false}})}*/}
      {/* Probiotics */}
      {SppFieldOrDropdown(ingredient, editable)}
      {NewFormItem({field:'strain'})}
      {/* Prebiotics & Postbiotics */}
      {CategoryFieldOrDropdown(ingredient, editable)}
      {NewFormItem({field:'name'})}
    </Grid>
    {/* Probiotics */}
    <Grid container rowSpacing={1} columnSpacing={{ xs:1, sm: 2, md: 3 }} sx={{ p: 2 }} spacing={4}>
      {NewFormItem({field:'stockCfuG', label: '', type:'number', units:'M CFU/g'})}
    </Grid>
    <Grid container rowSpacing={1} columnSpacing={{ xs:1, sm: 2, md: 3 }} sx={{ p: 2 }} spacing={4}>
      {NewFormItem({field:'bagSizeKg', label: 'Bag Size (kg)', type:'number'})}
      {NewFormItem({field:'costKg', label: 'Cost / kg', type:'money'})}
      {NewFormItem({field:'costShippingKg', label: 'Cost+Shipping / kg', type:'money'})}
    </Grid>
    <Grid container rowSpacing={1} columnSpacing={{ xs:1, sm: 2, md: 3 }} sx={{ p: 2 }} spacing={4}>
      {NewFormItem({
        field: 'mostRecentQuoteDate', label: 'Most Recent Quote Date',
        type:DATEPICKER,
        extra_params: {
          openTo:"day",
          slotProps:{ textField: { variant: 'standard' } },
          readOnly:!editable,
        }})}
    </Grid>
    <Grid container rowSpacing={1} columnSpacing={{ xs:1, sm: 2, md: 3 }} sx={{ p: 2 }} spacing={4}>
      {NewFormItem({field:'markupPercent', label: 'Markup', type:'number', units:"%"})}
    </Grid>
    <Grid container rowSpacing={1} columnSpacing={{ xs:1, sm: 2, md: 3 }} sx={{ p: 2 }} spacing={4}>
      {NewFormItem({field:'function'})}
    </Grid>
    <Grid container rowSpacing={1} columnSpacing={{ xs:1, sm: 2, md: 3 }} sx={{ p: 2 }} spacing={4}>
      {NewFormItem({field:'notes', extra_params:{multiline: true, rows: 4}})}
    </Grid>
    </>
  )
}

function Delete({ingredientId, ingredientType}) {
  if (!ingredientId || ingredientId.length == 0) {
    return null
  }
  const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false)
  const [isDeleting, setIsDeleting] = React.useState(false)
  const navigate = useNavigate();

  const handleDeleteClick = () => {
    setDeleteConfirmOpen(true);
  };
  const handleDeleteConfirmClose = () => {
    setDeleteConfirmOpen(false);
  }

  const handleDeleteConfirm = () => {
    setIsDeleting(true); // Should trigger useEffect
  }

  React.useEffect(() => {
    const deleteIngredient = async () => {
      if (isDeleting) {
        let isError = false
        try {
          const response = await getGrpcClient().deleteIngredient({id: ingredientId, type: ingredientType});
        } catch (e) {
          isError = true
          setError(e.message);
          console.log(e);
        } finally {
          setIsDeleting(false);
          setDeleteConfirmOpen(false);
          if (!isError) {
            navigate(-1);
          } else {
            setErrorOpen(true);
          }
        }
      }
    };
    deleteIngredient();
  }, [isDeleting, ingredientId]);

  return(
        <>
        <IconButton
          edge="end"
          color="inherit"
          onClick={handleDeleteClick}
          aria-label="delete"
        >
          <DeleteIcon />
        </IconButton>
        <ConfirmDialog
          title="Delete Ingredient"
          content="Are you sure you want to delete this ingredient?"
          open={deleteConfirmOpen}
          onClose={handleDeleteConfirmClose}
          onConfirm={handleDeleteConfirm} />
        </>
   )
}

export function IngredientDialog() {
  const [editable, setEditable] = React.useState(false);

  const [searchParams, setSearchParams] = useSearchParams();

  const [ingredient, setIngredient] = React.useState(null);
  const [updatedIngredient, setUpdatedIngredient] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(true)

  const [ingredientId, setIngredientId] = React.useState(searchParams.get('ingredientId'))

  const [isAdd, setIsAdd] = React.useState(searchParams.get('add'))
  const ingredientType = searchParams.get('type')
  const navigate = useNavigate();

  const handleEditClick = () => {
    let clone = structuredClone(ingredient)
    setUpdatedIngredient(clone)
    setEditable(true)
  };

  const handleSaveClick = () => {
    // Make sure the object is valid
    if (Object.values(formValid.current).every(isValid => isValid)) {
      setEditable(false)
      setIsSaving(true)
    } else {
      setError("Please check that the fields have appropriate values.")
      setErrorOpen(true)
    }

  };

  const handleClose = () => {
    if (editable) {
      setEditable(false)
    } else {
      navigate(-1);
    }
  }

  let refObj = {}
  Object.keys(fieldsByType[ingredientType]).forEach((key) => {
    let isValid = false
    if (key == "id") {
      // The id field is not editable and doesn't need validation
      isValid = true
    }
    refObj[key] = isValid
  })

  const formValid = React.useRef(refObj)

  const handleIngredientChange = (key, isValid) => {
    formValid.current[key] = isValid
    setUpdatedIngredient(updatedIngredient)
  }

  const [isSaving, setIsSaving] = React.useState(false)
  
  const [errorOpen, setErrorOpen] = React.useState(false)
  const [error, setError] = React.useState("")

  React.useEffect(() => {
    const updateIngredient = async () => {
      if (isSaving) {
        let isError = false
        try {
          if (isAdd) {
            const response = await getGrpcClient().createIngredient({ingredient: updatedIngredient});
            setIngredientId(response.id)
            navigate(`/ingredient?type=${ingredientType}&ingredientId=${response.id}`, { replace: true });
            setIsAdd(false)
          } else {
            const response = await getGrpcClient().updateIngredient({ingredient: updatedIngredient});
          }
        } catch (e) {
          isError = true
          setError(e.message);
          console.log(e);
        } finally {
          setIsSaving(false);
          if (!isError) {
            setIngredient(updatedIngredient)
          } else {
            setErrorOpen(true);
          }
        }
        setIsSaving(false)
      }
    };
    updateIngredient();
  }, [isSaving, updatedIngredient]);

  React.useEffect(() => {
    const triggerAddEdit = async () => {
      if (isAdd && ingredient) {
        // Force us into edit mode
        handleEditClick()
      }
    };
    triggerAddEdit()
  }, [ingredient]);

  React.useEffect(() => {
    const fetchData = async () => {
      if (!ingredientId) {
        // make empty ingredient
        setIngredient(emptyIngredient(ingredientType))
        return
      }
      setIsLoading(true);
      try {
        const response = await getGrpcClient().getIngredient({type: ingredientType, id: ingredientId});
        let i = response.ingredient

        setIngredient(i);
      } catch (error) {
        setError(error);
        console.log(error);
      } finally {
        setIsLoading(false)
      }
    };
    fetchData();
  }, [ingredientId]);


  const handleErrorClose = () => {
    setErrorOpen(false)
  }


  return (
    <>
    <AppBar sx={{ position: 'relative' }}>
      <Toolbar>
        <IconButton
          edge="start"
          color="inherit"
          onClick={handleClose}
          aria-label="close"
        >
          <CloseIcon />
        </IconButton>
        <Box sx={{ flexGrow: 1}} />
        <IconButton
          edge="end"
          color="inherit"
          onClick={editable ? handleSaveClick : handleEditClick }
          aria-label={editable ? "save" : "edit"}
        >
          {editable ? <SaveIcon /> : <EditIcon />}
        </IconButton>
        <Delete ingredientId={ingredientId} ingredientType={ingredientType} />
        <AlertDialog
          title="Error"
          content={error}
          open={errorOpen}
          onClose={handleErrorClose} />

      </Toolbar>
    </AppBar>
    <Ingredient ingredientType={ingredientType} ingredient={editable ? updatedIngredient : ingredient} editable={editable} handleChange={handleIngredientChange} />
    </>
  )
}
