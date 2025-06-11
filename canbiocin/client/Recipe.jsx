const React = require('React');
import { NewFormItem, PropsProvider, TEXTFIELD, DROPDOWN, DATEPICKER } from './FormItem';
import { EditToolbar } from './DataGridEditToolbar';
import { timestampToDate } from './timestamp.js';
import { moneyToString } from './money.js';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { ConfirmDialog } from './Dialog';
import { AlertDialog } from './Dialog';

import { getGrpcClient } from './grpc.js';

import { Field } from './Field';

import Tooltip from '@mui/material/Tooltip';

import { AppBar,
         Box, 
         Dialog,
         DialogTitle,
         Grid,
         IconButton,
         Toolbar,
         ToolbarButton,
         Typography } from '@mui/material';

import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import CancelIcon from '@mui/icons-material/Cancel';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import BlenderIcon from '@mui/icons-material/Blender';

import { GridToolbarButton } from '@mui/x-data-grid';
import { GridToolbar } from '@mui/x-data-grid';

import { DataGrid,
         GridRowModes,
         GridActionsCellItem,
         GridEditInputCell,
         GridRowEditStopReasons,
} from '@mui/x-data-grid';

function getItemValue(row) {
  return row.item
}

function getRowId(row) {
  return getItemValue(row).id
}

const validateNumber = (params) => {
  const hasError = params.props.value <= 0;
  if (hasError) {
    return {...params.props, error: "Must be greater than 0"}
  } else {
    return {...params.props, error: false}
  }
}

const renderEditCell = (params) => {
  const { error } = params;
  return (
    <Tooltip open={!!error} title={error} arrow >
    <GridEditInputCell {...params}/>
    </Tooltip>
  )
}

const probioticColumns = (editable) => {return [
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
    type: 'number',
    valueGetter: (value, row) => {
      return getItemValue(row).stockCfuG;
    },
    flex: 1,
    renderHeader: () => (
      <strong>{'Stock'}<br/>{'M CFU/g'}</strong>
    ),
  },
  { field: 'cfuG', 
    headerName: 'Desired M CFU/g', 
    editable: editable,
    valueGetter: (value, row) => {
      return row.cfuG
    },
    preProcessEditCellProps: validateNumber,
    renderEditCell: renderEditCell,
    flex: 1,
    type: 'number',
    renderHeader: () => (
      <strong>{'Desired'}<br/>{'M CFU/g'}</strong>
    ),
  },
]};

const prebioticColumns = (editable) => {return [
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
    editable: editable,
    preProcessEditCellProps: validateNumber,
    renderEditCell: renderEditCell,
    type: 'number',
    valueGetter: (value, row) => {
      return row.mgServing;
    },
    flex: 1,
    renderHeader: () => (
      <strong>{'mg / Serving'}</strong>
    ),
  },
]};

function IngredientRows({title, columnDef, editable, ingredients, setIngredients, rowModesModel, setRowModesModel, onRowModesModelChange, onRowEditStop, processRowUpdate}) {
  if (ingredients.length == 0) {
    return "" 
  }
  const onProcessRowUpdateError = (e) => {
    alert("ProcessRowUpdateError fixme")
    console.log(e)
  };

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
        rowModesModel={rowModesModel}
        onRowModesModelChange={onRowModesModelChange}
        onRowEditStop={onRowEditStop}
        processRowUpdate={processRowUpdate}
        onProcessRowUpdateError={onProcessRowUpdateError}
        slots={{ toolbar: EditToolbar }}
        slotProps={{
          toolbar: { setIngredients, setRowModesModel, editable },
        }}
        hideFooter
        showToolbar
      />
      </div>
      </Box>
  )
}

export function Recipe({recipe, editable, actionColumns, rowModels, handleChange}) {
  if (recipe == null) {
    return (
        <>
        "Not Found"
        </>
    )
  }

  const MyNewFormItem = ({field, label, type, units, renderItem, extra_params = {}}) => {
      let props_provider = PropsProvider(recipe, editable, handleChange)
      return NewFormItem({field, label, type, units, renderItem, props_provider, extra_params});
  }

  const setIngredients = (ingredients) => (rows) => {
    console.log("setIngredients")
    // basically we are trying to add a new row here
  }

  return (
    <>
    <Grid container rowSpacing={1} columnSpacing={{ xs:1, sm: 2, md: 3 }} sx={{ p: 2 }}spacing={2}>
      <Grid container spacing={4}>
        <MyNewFormItem field='id' />
        <MyNewFormItem field='name' />
        <MyNewFormItem field="probioticOveragePercent" label="Probiotic Overage %" type="number" units="%" />
      </Grid>
      <IngredientRows 
          title="Probiotics" 
          columnDef={probioticColumns(editable).concat(actionColumns(editable, rowModels.probiotics.rowModesModel))} 
          editable={editable}
          ingredients={recipe.probiotics}
          setIngredients={setIngredients(recipe.probiotics)}
          rowModesModel={rowModels.probiotics.rowModesModel}
          setRowModesModel={rowModels.probiotics.setRowModesModel}
          onRowModesModelChange={rowModels.probiotics.onModesModelChange}
          onRowEditStop={rowModels.handleRowEditStop}
          processRowUpdate={rowModels.processRowUpdate}
      />
      <IngredientRows 
          title="Prebiotics" 
          columnDef={prebioticColumns(editable).concat(actionColumns(editable, rowModels.prebiotics.rowModesModel))} 
          editable={editable}
          ingredients={recipe.prebiotics}
          setIngredients={setIngredients(recipe.probiotics)}
          rowModesModel={rowModels.prebiotics.rowModesModel}
          setRowModesModel={rowModels.prebiotics.setRowModesModel}
          onRowModesModelChange={rowModels.prebiotics.onModesModelChange}
          onRowEditStop={rowModels.handleRowEditStop}
          processRowUpdate={rowModels.processRowUpdate}
      />
      <IngredientRows 
          title="Postbiotics" 
          columnDef={prebioticColumns(editable).concat(actionColumns(editable, rowModels.prebiotics.rowModesModel))} 
          editable={editable}
          ingredients={recipe.postbiotics}
          setIngredients={setIngredients(recipe.probiotics)}
          rowModesModel={rowModels.postbiotics.rowModesModel}
          setRowModesModel={rowModels.postbiotics.setRowModesModel}
          onRowModesModelChange={rowModels.postbiotics.onModesModelChange}
          onRowEditStop={rowModels.handleRowEditStop}
          processRowUpdate={rowModels.processRowUpdate}
      />
    </Grid>
    </>
  )
}

function Delete({recipeId}) {
  const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false)
  const [isDeleting, setIsDeleting] = React.useState(false)

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

  const handleDeleteClick = () => () => {
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirmClose = () => {
    setDeleteConfirmOpen(false);
  }

  return (
        <>
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
        </>
  )
}

export function RecipeDialog() {
  const [editable, setEditable] = React.useState(false);

  const [searchParams, setSearchParams] = useSearchParams();
  const [isAdd, setIsAdd] = React.useState(searchParams.get('add'));

  const [recipeId, setRecipeId] = React.useState(searchParams.get('recipeId'))
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = React.useState(true)
  const [recipe, setRecipe] = React.useState(null);
  const [updatedRecipe, setUpdatedRecipe] = React.useState(null);

  const[probioticRowModesModel, setProbioticRowModesModel] = React.useState({});
  const[prebioticRowModesModel, setPrebioticRowModesModel] = React.useState({});
  const[postbioticRowModesModel, setPostbioticRowModesModel] = React.useState({});

  const handleRowDeleteClick = (id) => () => {
    console.log("RowDelete implement me")
    let r = updatedRecipe

    for (let i = 0; i < r.probiotics.length; i++) {
      if (r.probiotics[i].item.id == id) {
        // Can probably do something better here than copying things around
        let clone = structuredClone(r)
        clone.id = "handleRowDelete"
        clone.probiotics.splice(i, 1)
        setUpdatedRecipe(clone)
        return
      }
    }
    for (let i = 0; i < r.prebiotics.length; i++) {
      if (r.prebiotics[i].item.id == id) {
        let clone = structuredClone(r)
        clone.id = "handleRowDelete"
        clone.prebiotics.splice(i, 1)
        setUpdatedRecipe(clone)
        return
      }
    }
    for (let i = 0; i < r.postbiotics.length; i++) {
      if (r.postbiotics[i].item.id == id) {
        let clone = structuredClone(r)
        clone.id = "handleRowDelete"
        clone.postbiotics.splice(i, 1)
        setUpdatedRecipe(clone)
        return
      }
    }
  }

  const findEditedSectionForId = (r, id) => {
    let rowModesModel = null
    let setRowModesModel = null
    // Figure out which id this is from

    for (let i = 0; i < r.probiotics.length; i++) {
      if (getRowId(r.probiotics[i]) == id) {
        rowModesModel = probioticRowModesModel
        setRowModesModel = setProbioticRowModesModel
      }
    }
    if (!rowModesModel) {
      for (let i = 0; i < r.prebiotics.length; i++) {
        if (getRowId(r.prebiotics[i]) == id) {
          rowModesModel = prebioticRowModesModel
          setRowModesModel = setPrebioticRowModesModel
        }
      }
    }
    if (!rowModesModel) {
      for (let i = 0; i < r.postbiotics.length; i++) {
        if (getRowId(r.postbiotics[i]) == id) {
          rowModesModel = postbioticRowModesModel
          setRowModesModel = setPostbioticRowModesModel
        }
      }
    }
    return [rowModesModel, setRowModesModel]
  }

  const findIngredientForRow = (recipe, row) => {
    let r = recipe;
    let ingredients = null
    if (row.$typeName.toLowerCase().includes("probiotic")) {
      ingredients = r.probiotics
    } else if (row.$typeName.toLowerCase().includes("prebiotic")) {
      ingredients = r.prebiotics
    } else if (row.$typeName.toLowerCase().includes("postbiotic")) {
      ingredients = r.postbiotics
    }

    let id = getRowId(row)
    for (let i = 0; i < ingredients.length; i++) {
      if (getRowId(ingredients[i]) == id) {
        return [ingredients, i]
      }
    }
    return [null, -1]
  }

  const handleRowCancelClick = (id) => () => {
    const [rowModesModel, setRowModesModel] = findEditedSectionForId(updatedRecipe, id)

    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View, ignoreModifications: true } });
  }

  const handleRowEditClick = (id) => () => {
    const [rowModesModel, setRowModesModel] = findEditedSectionForId(updatedRecipe, id)

    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
  }

  const handleProbioticsRowModesModelChange = (newRowModesModel) => {
    setProbioticRowModesModel(newRowModesModel)
  }

  const handlePrebioticsRowModesModelChange = (newRowModesModel) => {
    setPrebioticRowModesModel(newRowModesModel)
  }

  const handlePostbioticsRowModesModelChange = (newRowModesModel) => {
    setPostbioticRowModesModel(newRowModesModel)
  }

  const handleRowEditStop = (params, event) => {
    if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      event.defaultMuiPrevent = true;
    }
  }

  const processRowUpdate = (newRow) => {
    // Can probably do something better here than copying things around
    let clone = structuredClone(updatedRecipe);
    let [ingredients, index] = findIngredientForRow(clone, newRow);

    if (ingredients && index >= 0 && index < ingredients.length) {
      ingredients.splice(index, 1, newRow)
      clone.id = "processRowUpdate"
      setUpdatedRecipe(clone)
    } else {
      console.log(`Couldn't find ingredients to update for ${newRow}`)
    }
    
    const updatedRow = { ...newRow, isNew: false };
    return updatedRow;
  };

  const rowModels = {
    prebiotics: {
        rowModesModel:prebioticRowModesModel, 
        setRowModesModel: setPrebioticRowModesModel, 
        onModesModelChange: handlePrebioticsRowModesModelChange
    },
    probiotics: {
        rowModesModel:probioticRowModesModel, 
        setRowModesModel: setProbioticRowModesModel, 
        onModesModelChange: handleProbioticsRowModesModelChange
    },
    postbiotics: {
        rowModesModel:postbioticRowModesModel, 
        setRowModesModel: setPostbioticRowModesModel, 
        onModesModelChange: handlePostbioticsRowModesModelChange
    },
    handleRowEditStop: handleRowEditStop,
    processRowUpdate: processRowUpdate
  }

  const actionColumns = (editable, rowModesModel) => {
    if (!editable) {
      return []
    }
    return [
    {
    field: 'actions',
    type: 'actions',
    headerName: 'Actions',
    width: 100,
    cellClassName: 'actions',
    getActions: ({ id }) => {
      const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;

      if (isInEditMode) {
        return [
          <GridActionsCellItem
            icon={<CancelIcon />}
            label="Cancel"
            className="textPrimary"
            onClick={handleRowCancelClick(id)}
            color="inherit"
          />,
        ];
      } else {
        return [
         <GridActionsCellItem
            icon={<EditIcon />}
            label="Edit"
            className="textPrimary"
            onClick={handleRowEditClick(id)}
            color="inherit"
          />,
          <GridActionsCellItem
            icon={<DeleteIcon />}
            label="Delete"
            onClick={handleRowDeleteClick(id)}
            color="inherit"
          />,
        ]
      }
    }
  }]};

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
  }, [recipeId]);

  let refObj = {}
  let fields = [
   "id", 
   "name", 
   "probioticOveragePercent"];
  fields.forEach((item) => {
    let isValid = false
    if (item == "id") {
      // The id field is not editable and doesn't need validation
      isValid = true
    }
    refObj[item] = isValid
  })
  const formValid = React.useRef(refObj)

  const handleChange = (key, isValid) => {
    formValid.current[key] = isValid
    //setUpdatedIngredient(updatedIngredient)
  }

  const handleEditClick = () => () => {
    let clone = structuredClone(recipe)
    // TODO
    clone.id = "handleEditClick"
    setUpdatedRecipe(clone)
    setEditable(true)
  };

  const handleSaveClick = () => () => {
    setEditable(false)
    alert("implement me")
  };

  const handleClose = () => () => {
    navigate(-1);
  }

  const [errorOpen, setErrorOpen] = React.useState(false)
  const [error, setError] = React.useState("")

  const handleErrorClose = () => {
    setErrorOpen(false)
  }

  const handleCreateRecipe = () => {
    navigate(`/recipeMix?recipeId={recipeId}`);
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
          onClick={handleCreateRecipe}
          aria-label={editable ? "save" : "edit"}
        >
        <BlenderIcon />
        </IconButton>
        <IconButton
          edge="end"
          color="inherit"
          onClick={editable ? handleSaveClick() : handleEditClick() }
          aria-label={editable ? "save" : "edit"}
        >
          {editable ? <SaveIcon /> : <EditIcon />}
        </IconButton>
        <Delete recipeId={recipeId}/>
        <AlertDialog
          title="Error"
          content={error}
          open={errorOpen}
          onClose={handleErrorClose} />
      </Toolbar>
    </AppBar>
    <Recipe 
        recipe={editable ? updatedRecipe : recipe} 
        editable={editable} 
        actionColumns={actionColumns}
        rowModels={rowModels}
        handleChange={handleChange}
    />
    </>
  )
}
