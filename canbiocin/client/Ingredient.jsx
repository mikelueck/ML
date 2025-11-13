const React = require('React');

import { Link, useNavigate, useSearchParams } from 'react-router';
import { NewFormItem, PropsProvider, DROPDOWN, DATEPICKER } from './FormItem';
import { ConfirmDialog } from './Dialog';
import { AlertDialog } from './Dialog';
import { SppDropdown } from './Dropdowns';
import { CategoryDropdown } from './Dropdowns';
import { emptyIngredient } from './utils.js';

import { useGrpc } from './GrpcContext';
import { scopes } from './scopes.js';

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


import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';

function getItemValue(ingredient) {
  return ingredient.item.value
}

const commonFields = {  
  "id": true,
  "costKg": true,
  "costShippingKg": true,
  // TODO "supplier" : true,
  "mostRecentQuoteDate": true,
}

const fieldsByType = {
  "probiotic": {...commonFields, "spp": true, "strain": true, "stockBCfuG": true, kgPerMeKg: true, meBCfuG: true, costOfMe:true , "notes": true},
  "prebiotic": {...commonFields, "category": true, "name": true, "function": true, "notes": true},
  "postbiotic": {...commonFields, "name": true, "bagSizeKg": true, "function": true, "notes": true},
}

function Ingredient({ingredientType, ingredient, editable, handleChange}) {
  if (ingredient == null) {
    return (
        <>
        "Not Found"
        </>
    )
  }

  const allowed_fields = fieldsByType[ingredientType]

  const SppFieldOrDropdown = (ingredient, editable) => {
    if (editable) {
      return (
      <MyNewFormItem
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
      MyNewFormItem({field:'spp'})
      )
    }
  }

  const CategoryFieldOrDropdown = (ingredient, editable) => {
    if (editable) {
      return (
      <MyNewFormItem
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
      MyNewFormItem({field:'category'})
      )
    }
  }


  const MyNewFormItem = ({field, label, type, units, renderItem, extra_params = {}}) => {
      if (!allowed_fields[field]) {
        return null
      }
      let props_provider = PropsProvider(getItemValue(ingredient), editable, handleChange)
      return NewFormItem({field, label, type, units, renderItem, props_provider, extra_params});
  }

  return (
    <>
    <Grid container rowSpacing={1} columnSpacing={{ xs:1, sm: 2, md: 3 }} sx={{ p: 2 }} spacing={4}>
      {/*{MyNewFormItem({field:'id', extra_params:{editable:false}})}*/}
      {/* Probiotics */}
      {SppFieldOrDropdown(ingredient, editable)}
      {MyNewFormItem({field:'strain'})}
      {/* Prebiotics & Postbiotics */}
      {CategoryFieldOrDropdown(ingredient, editable)}
      {MyNewFormItem({field:'name'})}
    </Grid>
    {/* Probiotics */}
    <Grid container rowSpacing={1} columnSpacing={{ xs:1, sm: 2, md: 3 }} sx={{ p: 2 }} spacing={4}>
      {MyNewFormItem({field:'stockBCfuG', label: 'Stock B CFU/g', type:'number', units:'B CFU/g'})}
      {MyNewFormItem({field:'meBCfuG', label: 'ME B CFU/g', type:'number', units:'B CFU/g'})}
      {MyNewFormItem({field:'kgPerMeKg', label: 'FD per kg ME', type:'number', units:'kg'})}
    </Grid>
    <Grid container rowSpacing={1} columnSpacing={{ xs:1, sm: 2, md: 3 }} sx={{ p: 2 }} spacing={4}>
      {MyNewFormItem({field:'bagSizeKg', label: 'Bag Size (kg)', type:'number'})}
      {MyNewFormItem({field:'costKg', label: 'Cost / kg', type:'money'})}
      {MyNewFormItem({field:'costShippingKg', label: 'Cost+Shipping / kg', type:'money'})}
      {MyNewFormItem({field:'costOfMe', label: 'Cost of ME / kg', type:'money'})}
    </Grid>
    <Grid container rowSpacing={1} columnSpacing={{ xs:1, sm: 2, md: 3 }} sx={{ p: 2 }} spacing={4}>
      {MyNewFormItem({
        field: 'mostRecentQuoteDate', 
        label: 'Most Recent Quote Date',
        type:DATEPICKER,
        extra_params: {
          openTo:"day",
          slotProps:{ textField: { variant: 'standard' } },
          readOnly:!editable,
        }})}
    </Grid>
    <Grid container rowSpacing={1} columnSpacing={{ xs:1, sm: 2, md: 3 }} sx={{ p: 2 }} spacing={4}>
      {MyNewFormItem({field:'function'})}
    </Grid>
    <Grid container rowSpacing={1} columnSpacing={{ xs:1, sm: 2, md: 3 }} sx={{ p: 2 }} spacing={4}>
      {MyNewFormItem({field:'notes', extra_params:{multiline: true, rows: 4}})}
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
  const { grpcRequest, hasScope } = useGrpc();

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
          const response = await grpcRequest("deleteIngredient", {id: ingredientId, type: ingredientType});
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

export default function () {
  const [editable, setEditable] = React.useState(false);

  const [searchParams, setSearchParams] = useSearchParams();

  const [ingredient, setIngredient] = React.useState(null);
  const [updatedIngredient, setUpdatedIngredient] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(true)

  const [ingredientId, setIngredientId] = React.useState(searchParams.get('ingredientId'))

  const [isAdd, setIsAdd] = React.useState(searchParams.get('add'))

  const { grpcRequest, hasScope } = useGrpc();

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
    if (!isAdd && editable) {
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
            const response = await grpcRequest("createIngredient", {ingredient: updatedIngredient});
            setIngredientId(response.id)
            navigate(`/ingredient?type=${ingredientType}&ingredientId=${response.id}`, { replace: true });
            setIsAdd(false)
          } else {
            const response = await grpcRequest("updateIngredient", {ingredient: updatedIngredient});
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
        const response = await grpcRequest("getIngredient", {type: ingredientType, id: ingredientId});
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
