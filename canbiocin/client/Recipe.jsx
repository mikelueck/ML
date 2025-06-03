const React = require('React');
import { timestampToDate } from './timestamp.js';
import { moneyToString } from './money.js';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { ConfirmDialog } from './Dialog';
import { AlertDialog } from './Dialog';

import { getGrpcClient } from './grpc.js';

import { Field } from './Field';

import { AppBar,
         Box, 
         Dialog,
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

import { DataGrid,
         GridRowModes,
         GridActionsCellItem,
         GridRowEditStopReasons,
         TollbarButton, 
} from '@mui/x-data-grid';

function getItemValue(row) {
  return row.item
}

function getRowId(row) {
  return getItemValue(row).id
}

const probioticColumns = [
  { field: 'strain',
    headerName: 'Strain', 
    editable: false, 
    sortable:true,
    valueGetter: (value, row) => {
      return getItemValue(row).strain;
    },
    flex: 4,
    renderHeader: () => (
      <strong>{'Strain'}</strong>
    ),
  },
  { field: 'stockCfuG', 
    headerName: 'Stock M CFU/g', 
    editable: false,
    valueGetter: (value, row) => {
      return getItemValue(row).stockCfuG;
    },
    flex: 1,
    renderHeader: () => (
      <strong>{'Stock'}<br/>{'M CFU/g'}</strong>
    ),
  },
  { field: 'desiredCfuG', 
    headerName: 'Desired M CFU/g', 
    editable: true,
    valueGetter: (value, row) => {
      return row.cfuG
    },
    flex: 1,
    renderHeader: () => (
      <strong>{'Desired'}<br/>{'M CFU/g'}</strong>
    ),
  },
];

const prebioticColumns = [
  { field: 'name',
    headerName: 'Name', 
    editable: false, 
    sortable:true,
    valueGetter: (value, row) => {
      return getItemValue(row).name;
    },
    flex: 4,
    renderHeader: () => (
      <strong>{'Name'}</strong>
    ),
  },
  { field: 'mgServing', 
    headerName: 'mg / Serving', 
    editable: true,
    valueGetter: (value, row) => {
      return row.mgServing;
    },
    flex: 1,
    renderHeader: () => (
      <strong>{'mg / Serving'}</strong>
    ),
  },
];


function IngredientRows({title, columnDef, ingredients}) {
  if (ingredients.length == 0) {
    return "" 
  }
  return (
      <Box sx={{ width: '100%' }}>
      <Typography variant="h5" align="left">
        {title}
      </Typography>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
      <DataGrid
        rows={ingredients}
        getRowId={getRowId}
        columns={columnDef}
        editMode="row"
        hideFooter
      />
      </div>
      </Box>
  )
}

export function Recipe({recipeId, editable}) {
  const [isLoading, setIsLoading] = React.useState(true)
  const [recipe, setRecipe] = React.useState(null);

  React.useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await getGrpcClient().getRecipe({id: recipeId});
        let r = response.recipe

        // replace all the "items" with their full specification
        for (let i = 0; i < r.probiotics.length; i++) {
          for (let j = 0; j < response.probiotics.length; j++) {
            if (response.probiotics[j].id == r.probiotics[i].item) {
              r.probiotics[i].item = response.probiotics[j];
              break;
            }
          }
        }

        // replace all the "items" with their full specification
        for (let i = 0; i < r.prebiotics.length; i++) {
          for (let j = 0; j < response.prebiotics.length; j++) {
            if (response.prebiotics[j].id == r.prebiotics[i].item) {
              r.prebiotics[i].item = response.prebiotics[j];
              break;
            }
          }
        }

        // replace all the "items" with their full specification
        for (let i = 0; i < r.postbiotics.length; i++) {
          for (let j = 0; j < response.postbiotics.length; j++) {
            if (response.postbiotics[j].id == r.postbiotics[i].item) {
              r.postbiotics[i].item = response.postbiotics[j];
              break;
            }
          }
        }

        setRecipe(r);
      } catch (error) {
        //setError(error);
        console.log(error);
      } finally {
        setIsLoading(false)
      }
    };
    fetchData();
  }, []);

  if (recipe == null) {
    return (
        <>
        "Not Found"
        </>
    )
  }

  return (
    <>
    <Grid container rowSpacing={1} columnSpacing={{ xs:1, sm: 2, md: 3 }} sx={{ p: 2 }}spacing={2}>
      <Grid container spacing={4}>
        <Field
            id='id'
            label='ID' 
            defaultValue={recipe.id}
            editable={editable}
            size="small"
            variant="standard"
        />
        <Field
            id='name'
            label='Name' 
            defaultValue={recipe.name}
            editable={editable}
            size="small"
            variant="standard"
        />
        <Field
            id='overage'
            label='Probiotic Overage %' 
            defaultValue={recipe.probioticOveragePercent}
            editable={editable}
            size="small"
            variant="standard"
            type="number"
            units="%"
        />
      </Grid>
      <IngredientRows title="Probiotics" columnDef={probioticColumns} ingredients={recipe.probiotics} />
      <IngredientRows title="Prebiotics" columnDef={prebioticColumns} ingredients={recipe.prebiotics} />
      <IngredientRows title="Postbiotics" columnDef={prebioticColumns} ingredients={recipe.postbiotics} />
    </Grid>
    </>
  )
}

export function RecipeDialog() {
  const [editable, setEditable] = React.useState(false);

  const [searchParams, setSearchParams] = useSearchParams();

  const recipeId = searchParams.get('recipeId')
  const navigate = useNavigate();

  const handleEditClick = () => () => {
    setEditable(true)
    alert("implement me")
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
    const deleteRecipe = async () => {
      if (isDeleting) {
        let isError = false
        try {
          const response = await getGrpcClient().deleteRecipe({id: recipeId});
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
    deleteRecipe();
  }, [isDeleting, recipeId]);


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
          title="Delete Recipe"
          content="Are you sure you want to delete this recipe?"
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
    <Recipe recipeId={recipeId} editable={editable} />
    </>
  )
}
