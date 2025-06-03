const React = require('React');

import dayjs from 'dayjs';

import { timestampToDate } from './timestamp.js';
import { moneyToString } from './money.js';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { Field } from './Field';
import { ConfirmDialog } from './Dialog';
import { AlertDialog } from './Dialog';

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

export function Ingredient({type, ingredientId, editable}) {
  const [isLoading, setIsLoading] = React.useState(true)
  const [ingredient, setIngredient] = React.useState(null);

  React.useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await getGrpcClient().getIngredient({type: type, id: ingredientId});
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

  if (ingredient == null) {
    return (
        <>
        "Not Found"
        </>
    )
  }

  return (
    <>
    <Grid container rowSpacing={1} columnSpacing={{ xs:1, sm: 2, md: 3 }} sx={{ p: 2 }} spacing={4}>
      <Field
          id='id'
          label='ID' 
          defaultValue={getItemValue(ingredient).id}
          size="small"
          variant="standard"
      />
      {/* Probiotics */}
      <Field
          id='spp'
          label='Spp' 
          defaultValue={getItemValue(ingredient).spp}
          optional
          editable={editable}
          size="small"
          variant="standard"
      />
      <Field
          id='strain'
          label='Strain' 
          defaultValue={getItemValue(ingredient).strain}
          optional
          editable={editable}
          size="small"
          variant="standard"
      />
      {/* Prebiotics & Postbiotics */}
      <Field
          id='category'
          label='Category' 
          defaultValue={getItemValue(ingredient).category}
          optional
          editable={editable}
          size="small"
          variant="standard"
      />
      <Field
          id='name'
          label='Name' 
          defaultValue={getItemValue(ingredient).name}
          optional
          editable={editable}
          size="small"
          variant="standard"
      />
    </Grid>
    {/* Probiotics */}
    <Grid container rowSpacing={1} columnSpacing={{ xs:1, sm: 2, md: 3 }} sx={{ p: 2 }} spacing={4}>
        <Field
            id='stock_cfu_g'
            defaultValue={getItemValue(ingredient).stockCfuG}
            optional
            editable={editable}
            units="M CFU/g"
            size="small"
            variant="standard"
        />
    </Grid>
    <Grid container rowSpacing={1} columnSpacing={{ xs:1, sm: 2, md: 3 }} sx={{ p: 2 }} spacing={4}>
      <Field
          id='cost_kg'
          label='Cost/kg' 
          defaultValue={moneyToString(getItemValue(ingredient).costKg, 2, true)}
          optional
          editable={editable}
          dollars
          size="small"
          variant="standard"
      />
      <Field
          id='cost_shipping_kg'
          label='Cost+Shipping/kg' 
          defaultValue={moneyToString(getItemValue(ingredient).costShippingKg, 2, true)}
          optional
          editable={editable}
          dollars
          size="small"
          variant="standard"
      />
    </Grid>
    <Grid container rowSpacing={1} columnSpacing={{ xs:1, sm: 2, md: 3 }} sx={{ p: 2 }} spacing={4}>
    <LocalizationProvider dateAdapter={AdapterDayjs}>
    <DatePicker 
      name="most_recent_quote_date" 
      readOnly={!editable}
      openTo="day"
      slotProps={{ textField: { variant: 'standard' } }}
      views={['year', 'month', 'day']}
      defaultValue={dayjs(timestampToDate(getItemValue(ingredient).mostRecentQuoteDate))} />
    </LocalizationProvider>
    </Grid>
    <Grid container rowSpacing={1} columnSpacing={{ xs:1, sm: 2, md: 3 }} sx={{ p: 2 }} spacing={4}>
      <Field
          id='markup_percent'
          label='Markup' 
          defaultValue={getItemValue(ingredient).markupPercent}
          editable={editable}
          size="small"
          units="%"
          variant="standard"
      />
    </Grid>
    <Grid container rowSpacing={1} columnSpacing={{ xs:1, sm: 2, md: 3 }} sx={{ p: 2 }} spacing={4}>
      <Field
          id='function'
          label='Function' 
          defaultValue={getItemValue(ingredient).function}
          optional
          editable={editable}
          size="small"
          variant="standard"
      />
    </Grid>
    <Grid container rowSpacing={1} columnSpacing={{ xs:1, sm: 2, md: 3 }} sx={{ p: 2 }} spacing={4}>
      <Field
          id='notes'
          label='Notes' 
          defaultValue={getItemValue(ingredient).notes}
          optional={type=="probiotic"}
          editable={editable}
          size="small"
          multiline
          rows={4}
          fullWidth
          variant="standard"
      />
    </Grid>
    </>
  )
}

export function IngredientDialog() {
  const [editable, setEditable] = React.useState(false);

  const [searchParams, setSearchParams] = useSearchParams();

  const ingredientId = searchParams.get('ingredientId')
  const type = searchParams.get('type')
  const navigate = useNavigate();

  const handleEditClick = () => () => {
    setEditable(true)
  };

  const handleSaveClick = () => () => {
    setEditable(false)
    alert("implement me")
  };

  const handleClose = () => () => {
    navigate(-1);
  }

  const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false)
  const [isDeleting, setIsDeleting] = React.useState(false)
  
  const [errorOpen, setErrorOpen] = React.useState(false)
  const [error, setError] = React.useState("")

  const handleDeleteClick = () => () => {
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirmClose = () => {
    setDeleteConfirmOpen(false);
  }

  React.useEffect(() => {
    const deleteIngredient = async () => {
      if (isDeleting) {
        let isError = false
        try {
          const response = await getGrpcClient().deleteIngredient({id: ingredientId, type: type});
          console.log(response)
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


  const handleDeleteConfirm = () => {
    setIsDeleting(true); // Should trigger useEffect
  }

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
          onClick={handleClose()}
          aria-label="close"
        >
          <CloseIcon />
        </IconButton>
        <Box sx={{ flexGrow: 1}} />
        <IconButton
          edge="end"
          color="inherit"
          onClick={editable ? handleSaveClick() : handleEditClick() }
          aria-label={editable ? "save" : "edit"}
        >
          {editable ? <SaveIcon /> : <EditIcon />}
        </IconButton>
        <IconButton
          edge="end"
          color="inherit"
          onClick={handleDeleteClick()}
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
        <AlertDialog
          title="Error"
          content={error}
          open={errorOpen}
          onClose={handleErrorClose} />

      </Toolbar>
    </AppBar>
    <Ingredient type={type} ingredientId={ingredientId} editable={editable} />
    </>
  )
}
