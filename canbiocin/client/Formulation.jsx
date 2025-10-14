const React = require('React');
import { NewFormItem, PropsProvider, TEXTFIELD, DROPDOWN, DATEPICKER } from './FormItem';
import { EditToolbar } from './DataGridEditToolbar';
import { timestampToDate } from './timestamp.js';
import { moneyToString } from './money.js';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { ConfirmDialog } from './Dialog';
import { AlertDialog } from './Dialog';
import { getNameForIngredient } from './utils.js';
import { getGroupForIngredient } from './utils.js';
import { verifyIngredient } from './utils.js';
import { emptyIngredientForType } from "./utils.js";
import { emptyRecipe } from "./utils.js";
import { valueToPrecision } from './utils.js';
import { styled } from '@mui/material/styles';
import { SavedRecipeDropdown } from './Dropdowns';

import { getGrpcClient } from './grpc.js';

import { Field } from './Field';

import Tooltip from '@mui/material/Tooltip';

import { AppBar,
         Box, 
         Card,
         CardActions,
         CardContent,
         CardHeader,
         Collapse,
         Dialog,
         DialogTitle,
         Grid,
         Toolbar,
         ToolbarButton,
         Typography } from '@mui/material';

import IconButton from '@mui/material/IconButton';

import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import CancelIcon from '@mui/icons-material/Cancel';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import BlenderIcon from '@mui/icons-material/Blender';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import { GridToolbarButton } from '@mui/x-data-grid';
import { GridToolbar } from '@mui/x-data-grid';

import { DataGrid,
         useGridApiRef,
         GridRowModes,
         GridActionsCellItem,
         GridEditInputCell,
         GridRowEditStopReasons,
} from '@mui/x-data-grid';

function getItemValue(row) {
  return row.item.value
}

function getRowId(row) {
  if (row.item && row.item.value) {
    return getItemValue(row).id
  }
  return row.item
}

const validateNumber = (f) => (params) => {
  const field = f;
  const hasError = params.props.value <= 0;
  let msg = ""
  if (hasError) {
    msg = "Must be greater than 0"
  } else {
    msg = verifyIngredient(params.row, field, params.props.value) 
  }
  if (msg) {
    return {...params.props, error: msg}
  } else {
    return {...params.props, error: false}
  }
}

const renderEditCell = (params) => {
  const { error } = params;
  return (
    <>
    <Tooltip {...params} open={!!error} title={error} arrow placement='top-start' PopperProps={{
         sx: {
           '&[data-popper-reference-hidden]': {
             display: 'none',
             'pointerEvents': 'none'
           },
         }
      }} 
      sx={(theme) => (error ? {
        backgroundColor: theme.palette.error.main,
        color: theme.palette.error.contrastText,
      }: {})}>
    <GridEditInputCell {...params}/>
    </Tooltip>
    </>
  )
}

const editNameField = "edittedName";

const probioticColumns = (editable, nameOptions) => {return [
  { field: editNameField,
    headerName: 'Strain', 
    editable: editable, 
    sortable:true,
    valueGetter: (value, row) => {
      if (!row.item.value) return ""
      return getItemValue(row).strain;
    },
    valueOptions: nameOptions,
    type: "singleSelect",
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
    preProcessEditCellProps: validateNumber('cfuG'),
    renderEditCell: renderEditCell,
    flex: 1,
    type: 'number',
    renderHeader: () => (
      <strong>{'Desired'}<br/>{'M CFU/g'}</strong>
    ),
  },
]};

const prebioticColumns = (editable, nameOptions) => {return [
  { field: editNameField,
    headerName: 'Name', 
    editable: editable, 
    sortable:true,
    valueGetter: (value, row) => {
      if (!row.item.value) return ""
      return getItemValue(row).name;
    },
    valueOptions: nameOptions,
    type: "singleSelect",
    flex: 4,
    renderHeader: () => (
      <strong>{'Name'}</strong>
    ),
  },
  { field: 'mgServing', 
    headerName: 'mg / Serving', 
    editable: editable,
    preProcessEditCellProps: validateNumber('mgServing'),
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

const postbioticColumns = (editable, nameOptions) => {return [
  { field: editNameField,
    headerName: 'Name', 
    editable: editable, 
    sortable:true,
    valueGetter: (value, row) => {
      if (!row.item.value) return ""
      return getItemValue(row).name;
    },
    valueOptions: nameOptions,
    type: "singleSelect",
    flex: 4,
    renderHeader: () => (
      <strong>{'Name'}</strong>
    ),
  },
  { field: 'mgServing', 
    headerName: 'mg / Serving', 
    editable: editable,
    preProcessEditCellProps: validateNumber('mgServing'),
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

function IngredientRows({title, newRowFn, columnDef, editable, ingredients, apiRef, setIngredients, rowModesModel, setRowModesModel, onRowModesModelChange, onRowEditStop, processRowUpdate}) {
  if (!editable && ingredients.length == 0) {
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
        apiRef={apiRef}
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
          toolbar: { newRowFn, setIngredients, setRowModesModel, editable },
        }}
        hideFooter
        showToolbar
      />
      </div>
      </Box>
  )
}

const ExpandMore = styled((props) => {
  const { expand, ...other } = props;
  return <IconButton {...other} />;
})(({ theme }) => ({
  marginLeft: 'auto',
  transition: theme.transitions.create('transform', {
    duration: theme.transitions.duration.shortest,
  }),
  variants: [
    {
      props: ({ expand }) => !expand,
      style: {
        transform: 'rotate(0deg)',
      },
    },
    {
      props: ({ expand }) => !!expand,
      style: {
        transform: 'rotate(180deg)',
      },
    },
  ],
}));

function FormulationHelper({recipe, editable}) {
  const [expanded, setExpanded] = React.useState(false);
  let servingSize = 1000.0; //(mg)

  // Compute the weight of the current recipe
  const computeWeight = (includeOverage) => {
    let weight = 0.0;
    let rows = recipe.probiotics;
    let multiplier = includeOverage ? (1 + recipe.probioticOveragePercent / 100) : 1;
    for (let i = 0; i < rows.length; i++) {
      weight += (multiplier * rows[i].cfuG) / getItemValue(rows[i]).stockCfuG * servingSize;
    }

    rows = recipe.prebiotics;
    for (let i = 0; i < rows.length; i++) {
      weight += rows[i].mgServing;
    }

    rows = recipe.postbiotics;
    for (let i = 0; i < rows.length; i++) {
      weight += rows[i].mgServing;
    }

    return valueToPrecision(weight, 3)
  }

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  if (!recipe || !editable) {
    return null
  }

  const CardContentNoPadding = styled(CardContent)(`
     padding: 4;
     &:last-child {
       padding-bottom: 4;
    }
  `);

  return (
    <Card size="sm"
      sx={{
          position: 'fixed',
          top: 70,
          right: 0,
          float: 'right',
          zIndex: 10,
          maxWidth: 200,
          padding: 3,
          p: 0,
         }}
    >
    <CardContentNoPadding>
    Formulation Assistant
    <ExpandMore
      expand={expanded}
      onClick={handleExpandClick}
      aria-expanded={expanded}
      aria-label="show more"
    >
      <ExpandMoreIcon />
    </ExpandMore>
    </CardContentNoPadding>

    <Collapse in={expanded} timeout="auto" unmountOnExit>
    <Box>
    <CardContentNoPadding>
    <Field value={computeWeight(false)} label="Weight" units="g" />
    </CardContentNoPadding>
    <CardContentNoPadding>
    <Field value={computeWeight(true)} label="Weight (including Overage)" units="g" />
    </CardContentNoPadding>
    <CardContentNoPadding>
    <Field value={servingSize - computeWeight()} label="Remaining" units="g" />
    </CardContentNoPadding>
    </Box>
    </Collapse>
    </Card>
  )
}

function Formulation({recipe, editable, ingredientsByType, actionColumns, rowModels, handleChange}) {
  const navigate = useNavigate();

  const getNamesForType = (type) => {
    let names = [];
    if (editable) {
      if (ingredientsByType.has(type)) {
        for (let i = 0; i < ingredientsByType.get(type).length; i++) {
          names.push(getNameForIngredient(ingredientsByType.get(type)[i]))
        }
      }
    }
    return names
  }

  const MyNewFormItem = ({field, label, type, units, renderItem, extra_params = {}}) => {
      let props_provider = PropsProvider(recipe, editable, handleChange)
      return NewFormItem({field, label, type, units, renderItem, props_provider, extra_params});
  }

  const setIngredients = (recipe, field) => (rowsOrFn) => {
    if (typeof rowsOrFn === 'function') {
      let newIngredients = rowsOrFn(recipe[field])
      recipe[field] = newIngredients
    } else {
      console.log("setIngredients")
      alert("setIngredients called without a function")
      recipe[field] = rowsOrFn
    }
  }

  const newRowFn = (type, field) => () => {
    let newIngredient = emptyIngredientForType(type);
    newIngredient.isNew = true
    
    // Prefill the item with the first element in the list
    for (let i = 0; i < ingredientsByType.get(type).length; i++) {
      let alreadyUsed = false
      for (let j = 0; j < recipe[field].length; j++) {  
        if (getNameForIngredient(recipe[field][j]) == getNameForIngredient(ingredientsByType.get(type)[i])) {
          alreadyUsed = true
        }
      }
      if (!alreadyUsed) {
        newIngredient.item = ingredientsByType.get(type)[i].item;
        return newIngredient;
      }
    }

    console.log("This recipe is already using all the ingredients so adding a new row doesn't make sense")
    newIngredient.item = ingredientsByType.get(t)[0].item;
    return newIngredient;
  }

  const onSavedDropdownSelect = (event) => {
      navigate(`/recipeMix?&savedRecipeId=${event.id}`)
  }

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
        <MyNewFormItem field='name' />
        <MyNewFormItem field="probioticOveragePercent" label="Probiotic Overage %" type="number" units="%" />
        <SavedRecipeDropdown
          recipeId={recipe.id}
          onChange={onSavedDropdownSelect}
        />
      </Grid>
      <IngredientRows 
          title="Probiotics" 
          newRowFn={newRowFn("probiotic", "probiotics")}
          columnDef={probioticColumns(editable, getNamesForType('probiotic')).concat(actionColumns(editable, rowModels.probiotics.rowModesModel))} 
          editable={editable}
          ingredients={recipe.probiotics}
          setIngredients={setIngredients(recipe, "probiotics")}
          apiRef={rowModels.probiotics.apiRef}
          rowModesModel={rowModels.probiotics.rowModesModel}
          setRowModesModel={rowModels.probiotics.setRowModesModel}
          onRowModesModelChange={rowModels.probiotics.onModesModelChange}
          onRowEditStop={rowModels.handleRowEditStop}
          processRowUpdate={rowModels.processRowUpdate}
      />
      <IngredientRows 
          title="Prebiotics" 
          newRowFn={newRowFn("prebiotic", "prebiotics")}
          columnDef={prebioticColumns(editable, getNamesForType('prebiotic')).concat(actionColumns(editable, rowModels.prebiotics.rowModesModel))} 
          editable={editable}
          ingredients={recipe.prebiotics}
          setIngredients={setIngredients(recipe, "prebiotics")}
          apiRef={rowModels.prebiotics.apiRef}
          rowModesModel={rowModels.prebiotics.rowModesModel}
          setRowModesModel={rowModels.prebiotics.setRowModesModel}
          onRowModesModelChange={rowModels.prebiotics.onModesModelChange}
          onRowEditStop={rowModels.handleRowEditStop}
          processRowUpdate={rowModels.processRowUpdate}
      />
      <IngredientRows 
          title="Postbiotics" 
          newRowFn={newRowFn("postbiotic", "postbiotics")}
          columnDef={postbioticColumns(editable, getNamesForType('postbiotic')).concat(actionColumns(editable, rowModels.postbiotics.rowModesModel))} 
          editable={editable}
          ingredients={recipe.postbiotics}
          apiRef={rowModels.postbiotics.apiRef}
          setIngredients={setIngredients(recipe, "postbiotics")}
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

function Delete({recipeId, setError, setErrorOpen}) {
  const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false)
  const [isDeleting, setIsDeleting] = React.useState(false)

  const navigate = useNavigate();

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
          title="Delete Formulation"
          content="Are you sure you want to delete this recipe?"
          open={deleteConfirmOpen}
          onClose={handleDeleteConfirmClose}
          onConfirm={handleDeleteConfirm} />
        </>
  )
}

export default function () {
  const [editable, setEditable] = React.useState(false);

  const [searchParams, setSearchParams] = useSearchParams();
  const [isAdd, setIsAdd] = React.useState(searchParams.get('add'));
  const [isSaving, setIsSaving] = React.useState(false)

  const [recipeId, setRecipeId] = React.useState(searchParams.get('recipeId'))
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = React.useState(true)
  const [recipe, setRecipe] = React.useState(null);
  const [updatedRecipe, setUpdatedRecipe] = React.useState(null);

  const [ingredientsByType, setIngredientsByType] = React.useState(new Map());
  const [ingredientsByName, setIngredientsByName] = React.useState(new Map());

  React.useEffect(() => {
    const triggerAddEdit = async () => {
      if (isAdd && recipe) {
        // Force us into edit mode
        handleEditClick()()
      }
    };
    triggerAddEdit()
  }, [recipe]);

  React.useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await getGrpcClient().listIngredients({});
        let typeMap = new Map()
        let nameMap = new Map()
        for (let i = 0; i < response.ingredients.length; i++) {
          let type = response.ingredients[i].item.case
          let value = response.ingredients[i]

          if (!typeMap.has(type)) {
            typeMap.set(type, []);
          }
          typeMap.get(type).push(value)

          nameMap.set(getNameForIngredient(response.ingredients[i]), value);
        }
        // Sort each type 
        for (const [key, value] of typeMap) {
          if (value) {
            value.sort((a,b) => {
              let x = getGroupForIngredient(a).localeCompare(getGroupForIngredient(b))
              if (x == 0) {
                return getNameForIngredient(a).localeCompare(getNameForIngredient(b))
              }
              return x
            })
          }
        }
        setIngredientsByType(typeMap)
        setIngredientsByName(nameMap)
      } catch (error) {
        setError(error);
        setErrorOpen(true)
        console.log(error);
      } finally {
        setIsLoading(false)
      }
    };
    fetchData();
  }, []);

  const probioticApiRef = useGridApiRef();
  const prebioticApiRef = useGridApiRef();
  const postbioticApiRef = useGridApiRef();

  const[probioticRowModesModel, setProbioticRowModesModel] = React.useState({});
  const[prebioticRowModesModel, setPrebioticRowModesModel] = React.useState({});
  const[postbioticRowModesModel, setPostbioticRowModesModel] = React.useState({});

  const handleRowDeleteClick = (id) => () => {
    let r = updatedRecipe

    for (let i = 0; i < r.probiotics.length; i++) {
      if (getItemValue(r.probiotics[i]).id == id) {
        // Can probably do something better here than copying things around
        let clone = structuredClone(r)
        clone.probiotics.splice(i, 1)
        setUpdatedRecipe(clone)
        return
      }
    }
    for (let i = 0; i < r.prebiotics.length; i++) {
      if (getItemValue(r.prebiotics[i]).id == id) {
        let clone = structuredClone(r)
        clone.prebiotics.splice(i, 1)
        setUpdatedRecipe(clone)
        return
      }
    }
    for (let i = 0; i < r.postbiotics.length; i++) {
      if (getItemValue(r.postbiotics[i]).id == id) {
        let clone = structuredClone(r)
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

  const verifyRecipe = (recipe) => {
    // A few rules
    // You can't use the same ingredient more than once
    // Probiotics: desired CFU can't be more than Stock CFU
    // Others: mgPerServing can be greater than 1000 (assumes 1g per serving)
    let map = [];
    let ingredients = [].concat(recipe.probiotics, recipe.prebiotics, recipe.postbiotics);
    let ingredientMsg
    for (let i = 0; i < ingredients.length; i++) {
      let name = getNameForIngredient(ingredients[i])
      if (map?.[name]) {
        setError(`Your recipe is using "${name}" more than once.`)
        setErrorOpen(true)
        return false
      }
      map[name] = true
      ingredientMsg = verifyIngredient(ingredients[i])
    }
    if (ingredientMsg) {
      setError(ingredientMsg)
      setErrorOpen(true)
      return false
    }
    return true
  }

  const processRowUpdate = (newRow) => {
    // Can probably do something better here than copying things around
    let clone = structuredClone(updatedRecipe);
    let [ingredients, index] = findIngredientForRow(clone, newRow);

    if (ingredients && index >= 0 && index < ingredients.length) {
      let oldIngredient;

      if (newRow[editNameField] && newRow[editNameField] != getNameForIngredient(ingredients[index])) {
        // They changed the type of the ingredient
        let updatedIngredient = ingredientsByName.get(newRow[editNameField])
        if (updatedIngredient) {
          oldIngredient = ingredients[index]
          newRow.item = updatedIngredient.item
          delete newRow[editNameField]
        } else {
          console.log(`An ingredient was selected but we couldn't find it ${newRow[editNameField]}`);
        }
      }
      ingredients.splice(index, 1, newRow)
      let verify = verifyRecipe(clone)
      if (!verify && oldIngredient) {
        // Datagrid behaves badly if two rows have the same id
        ingredients.splice(index, 1, oldIngredient)
      }
      if (!verify && newRow.isNew) {
        // if the new row is an addition and the recipe can't verify properly then we just delete the ingredient
        ingredients.splice(index, 1)
        Promise.reject();
      }
      // We update the updatedRecipe even if it isn't valid so that it renders correctly
      setUpdatedRecipe(clone)
    } else {
      console.log(`Couldn't find ingredients to update for ${newRow}`)
      Promise.reject();
    }
    
    const updatedRow = { ...newRow, isNew: false };
    return updatedRow;
  };

  const rowModels = {
    prebiotics: {
        apiRef: probioticApiRef,
        rowModesModel:prebioticRowModesModel, 
        setRowModesModel: setPrebioticRowModesModel, 
        onModesModelChange: handlePrebioticsRowModesModelChange
    },
    probiotics: {
        apiRef: prebioticApiRef,
        rowModesModel:probioticRowModesModel, 
        setRowModesModel: setProbioticRowModesModel, 
        onModesModelChange: handleProbioticsRowModesModelChange
    },
    postbiotics: {
        apiRef: postbioticApiRef,
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
      const isInEditMode = rowModesModel?.[id]?.mode === GridRowModes.Edit;

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
      if (!recipeId) {
        // make empty recipe
        setRecipe(emptyRecipe())
        return
      }
      setIsLoading(true);
      try {
        const response = await getGrpcClient().getRecipe({id: recipeId});
        let r = response.recipe

        // replace all the "items" with their full specification
        for (let i = 0; i < r.probiotics.length; i++) {
          for (let j = 0; j < response.probiotics.length; j++) {
            if (response.probiotics[j].id == r.probiotics[i].item) {
              r.probiotics[i].item = { case: 'probiotic', value: response.probiotics[j]};
              break;
            }
          }
        }

        // replace all the "items" with their full specification
        for (let i = 0; i < r.prebiotics.length; i++) {
          for (let j = 0; j < response.prebiotics.length; j++) {
            if (response.prebiotics[j].id == r.prebiotics[i].item) {
              r.prebiotics[i].item = {case: 'prebiotic', value: response.prebiotics[j]};
              break;
            }
          }
        }

        // replace all the "items" with their full specification
        for (let i = 0; i < r.postbiotics.length; i++) {
          for (let j = 0; j < response.postbiotics.length; j++) {
            if (response.postbiotics[j].id == r.postbiotics[i].item) {
              r.postbiotics[i].item = {case: 'postbiotic', value: response.postbiotics[j]};
              break;
            }
          }
        }

        setRecipe(r);
      } catch (error) {
        setError(error);
        setErrorOpen(true);
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
    setUpdatedRecipe(updatedRecipe)
  }

  const handleEditClick = () => () => {
    let clone = structuredClone(recipe)
    setUpdatedRecipe(clone)
    setEditable(true)
  };

  const handleCancelRecipe = () => {
    setUpdatedRecipe(null)
    setEditable(false)
  }

  const handleSaveClick = () => () => {
    if (Object.values(formValid.current).every(isValid => isValid)) {
      const apiRefs = [rowModels.probiotics.apiRef,
                       rowModels.prebiotics.apiRef,
                       rowModels.postbiotics.apiRef]
      for (let i = 0; i < apiRefs.length; i++) {
        let apiRef = apiRefs[i]
        let rowsInEditMode = apiRef.current?.state.editRows;
        if (rowsInEditMode) {
          Object.keys(rowsInEditMode).forEach((rowId) => {
            apiRef.current?.stopRowEditMode({id: rowId})
          })
        }
      }
      setIsSaving(true)
    }

  };

  React.useEffect(() => {
    const updateRecipe = async () => {
      if (isSaving) {
        let isError = false
        try {
          let verify = verifyRecipe(updatedRecipe)

          // The recipe has been altered to facilitate rendering so we need to take a clone of it
          // and prepare it for saving
          let clone = structuredClone(updatedRecipe)
          for (let i = 0; i < clone.probiotics.length; i++) {
            let id = getRowId(clone.probiotics[i])
            clone.probiotics[i].item = id
          }

          for (let i = 0; i < clone.prebiotics.length; i++) {
            let id = getRowId(clone.prebiotics[i])
            clone.prebiotics[i].item = id
          }

          for (let i = 0; i < clone.postbiotics.length; i++) {
            let id = getRowId(clone.postbiotics[i])
            clone.postbiotics[i].item = id
          }
          
          if (isAdd) {
            const response = await getGrpcClient().createRecipe({recipe: clone});
            setRecipeId(response.id)
            navigate(`/recipe?&recipeId=${response.id}`, { replace: true });
            setIsAdd(false)
          } else {
            const response = await getGrpcClient().updateRecipe({recipe: clone});
          }
        } catch (e) {
          isError = true
          setError(e.message);
          console.log(e);
        } finally {
          setIsSaving(false);
          if (!isError) {
            setRecipe(updatedRecipe)
            setEditable(false)
          } else {
            setErrorOpen(true);
          }
        }
        setIsSaving(false)
      }
    };
    updateRecipe();
  }, [isSaving, updatedRecipe]);

  const handleClose = () => () => {
    navigate(-1);
  }

  const [errorOpen, setErrorOpen] = React.useState(false)
  const [error, setError] = React.useState("")

  const handleErrorClose = () => {
    setErrorOpen(false)
  }

  const handleCreateRecipe = () => {
    navigate(`/recipeMix?recipeId=${recipeId}`);
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
          onClick={editable ? handleCancelRecipe : handleCreateRecipe}
          aria-label={editable ? "cancel" : "mix"}
        >
        {editable ? <CancelIcon /> : <BlenderIcon />}
        </IconButton>
        <IconButton
          edge="end"
          color="inherit"
          onClick={editable ? handleSaveClick() : handleEditClick() }
          aria-label={editable ? "save" : "edit"}
        >
          {editable ? <SaveIcon /> : <EditIcon />}
        </IconButton>
        <Delete recipeId={recipeId} setError={setError} setErrorOpen={setErrorOpen}/>
        <AlertDialog
          title="Error"
          content={error}
          open={errorOpen}
          onClose={handleErrorClose} />
      </Toolbar>
    </AppBar>
    <FormulationHelper
        recipe={editable ? updatedRecipe : recipe} 
        editable={editable} 
    />
    <Formulation 
        recipe={editable ? updatedRecipe : recipe} 
        editable={editable} 
        ingredientsByType={ingredientsByType}
        actionColumns={actionColumns}
        rowModels={rowModels}
        handleChange={handleChange}
    />
    </>
  )
}
