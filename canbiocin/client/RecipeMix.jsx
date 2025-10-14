const React = require('React');
import { timestampToDate } from './timestamp.js';
import { timestampToDateTimeString } from './timestamp.js';
import { floatToMoney } from './money.js';
import { moneyToString } from './money.js';
import { moneyToFloat } from './money.js';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { InputDialog } from './Dialog';
import { valueToPrecision } from './utils.js';
import { ContainerDropdown } from './Dropdowns';

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
import BlenderIcon from '@mui/icons-material/Blender';

import { DataGrid,
         GridRowModes,
         GridActionsCellItem,
         GridRowEditStopReasons,
         TollbarButton, 
} from '@mui/x-data-grid';

function getItemValue(row) {
  return row.ingredient.item.value
}

function getRowId(row) {
  return getItemValue(row).id
}

const precision = 2;

const commonColumns = [
  { field: 'percent', 
    headerName: '', 
    valueGetter: (value, row) => {
      return row.percent * 100
    },
    flex: 1.5,
    renderHeader: () => (
      <strong>{'Amount in'}<br/>{'in Blend'}</strong>
    ),
    valueFormatter: (value) => {
      return valueToPrecision(value, precision, " %")
    },
  },
  { field: 'mg_serving', 
    headerName: 'mg/serving', 
    valueGetter: (value, row) => {
      return row.perservingMg
    },
    renderHeader: () => (
      <strong>{'mg/serving'}</strong>
    ),
    valueFormatter: (value) => {
      return valueToPrecision(value, precision)
    },
    flex: 1.5,
  },
  { field: 'amount_needed', 
    headerName: 'Amount Needed (kg)', 
    valueGetter: (value, row) => {
      return row.totalGrams / 1000
    },
    flex: 1.5,
    renderHeader: () => (
      <strong>{'Amount'}<br/>{'Needed (kg)'}</strong>
    ),
    valueFormatter: (value) => {
      return valueToPrecision(value, precision)
    },
  },
  { field: 'cb_cost_kg', 
    headerName: 'CB Cost/kg', 
    type: 'number',
    valueGetter: (value, row) => {
      return moneyToString(row.cbCostKg, precision, true);
    },
    flex: 1.5,
    renderHeader: () => (
      <strong>{'CanBiocin'}<br/>{'Cost/kg'}</strong>
    ),
    valueFormatter: (value) => {
      if (value.length > 0) {
        return '$ ' + value;
      }
      return ''
    },
  },
  { field: 'cb_cost_container', 
    headerName: 'CB Cost Container', 
    type: 'number',
    valueGetter: (value, row) => {
      return moneyToString(row.cbCostPerContainer, precision, true)
    },
    flex: 1.5,
    renderHeader: () => (
      <strong>{'CanBiocin'}<br/>{'CoGs/Container'}</strong>
    ),
    valueFormatter: (value) => {
      if (value.length > 0) {
        return '$ ' + value;
      }
      return ''
    },
  },
  { field: 'cb_total', 
    headerName: 'CB Total', 
    type: 'number',
    valueGetter: (value, row) => {
      return moneyToString(row.cbTotal, precision, true);
    },
    flex: 1.5,
    renderHeader: () => (
      <strong>{'Total'}<br/>{'CanBiocin'}<br/>{'CoGs/Order'}</strong>
    ),
    valueFormatter: (value) => {
      if (value.length > 0) {
        return '$ ' + value;
      }
      return ''
    },
  },
  { field: 'markup', 
    headerName: 'Markup', 
    valueGetter: (value, row) => {
      return row.markupPercent ?  row.markupPercent : ""
    },
    renderCell: (params) => (
      <>
      {params.row.markupPercent ? params.row.markupPercent + '%' : ""}
      </>
    ),
    renderHeader: () => (
      <strong>{'Markup'}</strong>
    ),
    flex: 1.5,
  },
  { field: 'client_total', 
    headerName: 'Client Total', 
    type: 'number',
    valueGetter: (value, row) => {
      return moneyToString(row.clientTotal, precision, true);
    },
    flex: 1.5,
    renderHeader: () => (
      <strong>{'Client'}<br/>{'CoGs/'}<br/>{'Order'}</strong>
    ),
    valueFormatter: (value) => {
      return '$ ' + value;
    },
  },
]

const probioticColumns = [
  { field: 'strain',
    headerName: 'Strain', 
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
    valueGetter: (value, row) => {
      return row.desiredCfuG
    },
    flex: 1,
    renderHeader: () => (
      <strong>{'Desired'}<br/>{'M CFU/g'}</strong>
    ),
  },
  ...commonColumns,
];

const prebioticColumns = [
  { field: 'name',
    headerName: 'Name', 
    sortable:true,
    valueGetter: (value, row) => {
      return getItemValue(row).name;
    },
    flex: 6,
    renderHeader: () => (
      <strong>{'Name'}</strong>
    ),
  },
  ...commonColumns
];

const computeTotals = (ingredients, rows) => {
  if (ingredients.length == 0) {
    return
  }
  let desiredCfuG = 0;
  let percent = 0;
  let mgServing = 0;
  let totalGrams = 0;
  let cbCostPerContainer = 0;
  let cbTotal = 0;
  let clientTotal = 0;

  ingredients.map((i) => {
    desiredCfuG += i.desiredCfuG
    percent += i.percent
    mgServing += i.perservingMg
    totalGrams += i.totalGrams
    cbCostPerContainer += moneyToFloat(i.cbCostPerContainer)
    cbTotal += moneyToFloat(i.cbTotal)
    clientTotal += moneyToFloat(i.clientTotal)
  })

  let markupPercent = Math.floor(((clientTotal / cbTotal) - 1)*100)

  rows.push(
  {
  // This is mimicing the shape of a pb.IngredientDetails
  ingredient: {item: {value: {id: "Total", strain: "Total", name: "Total"}}},
  desiredCfuG: desiredCfuG,
  percent: percent,
  perservingMg: mgServing,
  totalGrams: totalGrams,
  cbCostPerContainer: floatToMoney(cbCostPerContainer),
  cbTotal: floatToMoney(cbTotal),
  markupPercent: markupPercent,
  clientTotal: floatToMoney(clientTotal),
  })
}

function IngredientRows({title, columnDef, ingredients, type}) {
  const getRowsByType = (rows, type) => {
    let output = [];
    rows.map((row) => {
      if (row.ingredient.item.case == type) {
        output.push(row)
      }
    })
    return output;
  }

  let rows = getRowsByType(ingredients,type)

  computeTotals(rows, rows)

  if (rows.length == 0) {
    return "" 
  }

  
  return (
      <Box sx={{ width: '100%' }}>
      <Typography variant="h5" align="left">
        {title}
      </Typography>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
      <DataGrid
        rows={rows}
        getRowId={getRowId}
        columns={columnDef}
        hideFooter
        disableColumnMenu
        disableColumnSorting
      />
      {/* Disable column functionally to support a Total row.  TODO could use DataGridPremium*/}
      </div>
      </Box>
  )
}

function TotalRow({title, columnDef, ingredients}) {
  let rows = []

  computeTotals(ingredients, rows)

  if (rows.length == 0) {
    return "" 
  }
  
  return (
      <Box sx={{ width: '100%' }}>
      <Typography variant="h5" align="left">
        {title}
      </Typography>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
      <DataGrid
        rows={rows}
        getRowId={getRowId}
        columns={columnDef}
        hideFooter
        disableColumnMenu
        disableColumnSorting
      />
      {/* Disable column functionally to support a Total row.  TODO could use DataGridPremium*/}
      </div>
      </Box>
  )
}

function RecipeMix({recipe}) {

  if (recipe == null) {
    return (
        <>
        "Error"
        </>
    )
  }

  return (
    <>
    <Grid container rowSpacing={1} columnSpacing={{ xs:1, sm: 2, md: 3 }} sx={{ p: 2 }}spacing={2}>
      <Field
          id='id'
          label='ID' 
          value={recipe.recipe.id}
          size="small"
          variant="standard"
      />
      <Field
          id='name'
          label='Name' 
          value={recipe.recipe.name}
          size="small"
          variant="standard"
      />
      <Field
          id='overage'
          label='Probiotic Overage %' 
          value={recipe.recipe.probioticOveragePercent}
          size="small"
          variant="standard"
          type="number"
          units="%"
      />
    </Grid>
    
    <Box sx={{ m:1 }}>
      <TotalRow title="Totals" columnDef={prebioticColumns} ingredients={recipe.ingredients} />

      <IngredientRows title="Probiotics" columnDef={probioticColumns} ingredients={recipe.ingredients} type="probiotic" />
      <IngredientRows title="Prebiotics" columnDef={prebioticColumns} ingredients={recipe.ingredients} type="prebiotic" />
      <IngredientRows title="Postbiotics" columnDef={prebioticColumns} ingredients={recipe.ingredients} type="postbiotic" />
    </Box>
    </>
  )
}

export default function () {
  let initSize = 10000
  const [isLoading, setIsLoading] = React.useState(true)
  const [servingGrams, setServingGrams] = React.useState(1)
  const [totalGrams, setTotalGrams] = React.useState(initSize)
  const [searchParams, setSearchParams] = useSearchParams();
  const [container, setContainer] = React.useState(null);
  const [numContainers, setNumContainers] = React.useState(1)
  const [gramsPerContainer, setGramsPerContainer] = React.useState(initSize)
  const [discountPercent, setDiscountPercent] = React.useState(0)
  const [recipe, setRecipe] = React.useState(null)
  const [isSaving, setIsSaving] = React.useState(false)
  const [isDeleting, setIsDeleting] = React.useState(false)
  const [saveNameOpen, setSaveNameOpen] = React.useState(false)

  const recipeId = searchParams.get('recipeId')
  const savedRecipeId = searchParams.get('savedRecipeId')
  const navigate = useNavigate();

  const handleClose = () => () => {
    navigate(-1);
  }

  const handleTotalGramsChange = (event) => {
    setTotalGrams(event.target.value)
    updateNumContainers(event.target.value, servingGrams, gramsPerContainer)
  }

  const handleContainerChange = (event) => {
    setGramsPerContainer(event.sizeG)
    setContainer(event)
    updateNumContainers(totalGrams, servingGrams, event)
  }

  const updateNumContainers = (total, servingSize, container) => {
    let g_cont = container ? container.sizeG : initSize

    let num_servings_cont = Math.floor(g_cont / servingSize)

    setNumContainers(Math.ceil(total / (num_servings_cont * servingSize)))
  }


  const handleServingGramsChange = (event) => {
    setServingGrams(event.target.value)
    setServingsPerContainer(Math.floor(gramsPerContainer / event.target.value))
    updateNumContainers(totalGrams, event.target.value, container)
  }

  const handleDiscountPercentChange = (event) => {
    setDiscountPercent(event.target.value)
  }

  function ContainerFieldOrDropdown({recipe, editable}) {
    if (editable) {
      return (
      <ContainerDropdown
        value={recipe ? recipe.container : ""}
        onChange={handleContainerChange}
        editable={!savedRecipeId}
      />
      )
    } else {
      return (
      <Field
          id='container'
          label='Container' 
          value={recipe && recipe.container ? `${recipe.container.name} - ${recipe.container.sizeG}g` : ""}
          size="small"
          type="string"
          variant="standard"
          editable={false}
      />
      )
    }
  }



  const handleSaveClick = () => {
    if (recipe) {
      if (recipe.name) {
        setIsSaving(true)
      } else {
        setSaveNameOpen(true)
      }
    }
  }

  const handleSaveClickChange = (value) => {
    recipe.name = value
  }

  const handleSaveNameClose = () => {
    setSaveNameOpen(false)
  }

  const handleSaveNameConfirm = () => {
    if (recipe.name) {
      setSaveNameOpen(false)
      setIsSaving(true)
      return true
    }
    return false
  }

  React.useEffect(() => {
    const saveRecipeMix = async () => {
      if (isSaving) {
        let isError = false
        let isAdd = !recipe.id
        try {
          if (isAdd) {
            const response = await getGrpcClient().createSavedRecipe({recipe: recipe});
            recipe.id = response.id
          } else {
            const response = await getGrpcClient().updateSavedRecipe({recipe: recipe});
          }
        } catch (e) {
          isError = true
          setError(e.message);
          console.log(e)
        } finally {
          setIsSaving(false)
          if (isError) {
            setErrorOpen(true);
          } else {
            navigate(`/recipeMix?&savedRecipeId=${recipe.id}`, { replace: true })
          }
        }
      }
    }
    saveRecipeMix()
  }, [isSaving, recipe]);

  const handleDeleteClick = () => {
    if (savedRecipeId) {
        setIsDeleting(true)
    }
  }

  React.useEffect(() => {
    const deleteRecipeMix = async () => {
      if (isDeleting) {
        let isError = false
        try {
            const response = await getGrpcClient().deleteSavedRecipe({id: savedRecipeId});
        } catch (e) {
          isError = true
          setError(e.message);
          console.log(e)
        } finally {
          setIsDeleting(false)
          if (isError) {
            setErrorOpen(true);
          } else {
            navigate(`/recipe?recipeId=${recipe.recipe.id}`, { replace: true })
          }
        }
      }
    }
    deleteRecipeMix()
  }, [isDeleting, savedRecipeId]);



  React.useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // If we have a savedRecipeId we load it here
        if (savedRecipeId && !recipe) {
          const response = await getGrpcClient().getSavedRecipe(
              {savedRecipeId: savedRecipeId});
          let r = response.recipe
          setRecipe(r)
          setServingGrams(r.servingSizeGrams)
          setTotalGrams(r.totalGrams)
          setContainer(r.container)
          setDiscountPercent(r.discountPercent)
          updateNumContainers(r.totalGrams, r.servingSizeGrams, r.container)
        } else if (!savedRecipeId) {
          const response = await getGrpcClient().calculateRecipe(
              {recipeId: recipeId, 
               servingSizeGrams: servingGrams, 
               totalGrams: totalGrams,
               container: container,
               discountPercent: discountPercent });
          setRecipe(response.recipeDetails)
        }
      } catch (error) {
        //setError(error);
        console.log(error);
      } finally {
        setIsLoading(false)
      }
    };
    fetchData();
  }, [savedRecipeId, recipeId, servingGrams, totalGrams, container, discountPercent]);

  function SaveToolbar() {
    if (savedRecipeId) {
      return (<></>)
    }
    return (
        <IconButton
          edge="end"
          color="inherit"
          onClick={handleSaveClick}
          aria-label={"save"}
        >
          <SaveIcon />
        </IconButton>
    )
  }

  function DeleteToolbar() {
    if (!savedRecipeId) {
      return (<></>)
    }
    return (
        <IconButton
          edge="end"
          color="inherit"
          onClick={handleDeleteClick}
          aria-label={"delete"}
        >
          <DeleteIcon />
        </IconButton>
    )
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
        <Box
            sx={{
                display: 'flex', // Enable flexbox
                alignItems: 'flex-end', // Align items to the bottom (flex-end)
                gap: 1, // Optional: Add spacing between the words
                padding: 1}}>
        <Typography variant="h3" component="span">
          {recipe ? recipe.name : ""}
        </Typography>
        <Typography variant="body1" component="span">
          {(recipe && recipe.name) ? timestampToDateTimeString(recipe.time) : ""}
        </Typography>
        </Box>
        <Box sx={{ flexGrow: 1}} />
        <SaveToolbar />
        <DeleteToolbar />
        <InputDialog
          title="Formulation name"
          content="Please provide a name for the formulation"
          onChange={handleSaveClickChange}
          open={saveNameOpen}
          onClose={handleSaveNameClose}
          onConfirm={handleSaveNameConfirm} />
      </Toolbar>
    </AppBar>
    <Grid container rowSpacing={1} columnSpacing={{ xs:1, sm: 2, md: 3 }} sx={{ p: 2 }} spacing={2}>
      <Field
          id='serving_size_grams'
          label='Serving size grams' 
          value={servingGrams}
          size="small"
          type="number"
          variant="standard"
          onChange={handleServingGramsChange}
          editable={!savedRecipeId}
      />
      <Field
          id='total_grams'
          label='Total grams' 
          value={totalGrams}
          size="small"
          type="number"
          variant="standard"
          onChange={handleTotalGramsChange}
          editable={!savedRecipeId}
      />
    </Grid>
    <Grid container rowSpacing={1} columnSpacing={{ xs:1, sm: 2, md: 3 }} sx={{ p: 2 }} spacing={2}>
      <ContainerFieldOrDropdown
        recipe={recipe}
        editable={!savedRecipeId} />
      <Field
          id='servings_per_container'
          label='Servings per container' 
          value={container ? Math.floor(container.sizeG / servingGrams) : Math.floor(initSize / servingGrams) }
          size="small"
          type="number"
          variant="standard"
          editable={false}
      />
      <Field
          id='num_containers'
          label='# containers' 
          value={numContainers}
          size="small"
          type="number"
          variant="standard"
          editable={false}
      />
    </Grid>
    <Grid container rowSpacing={1} columnSpacing={{ xs:1, sm: 2, md: 3 }} sx={{ p: 2 }} spacing={2}>
      <Field
          id='discount'
          label='Discount Percent' 
          value={discountPercent}
          size="small"
          type="number"
          variant="standard"
          onChange={handleDiscountPercentChange}
          editable={!savedRecipeId}
          units="%"
      />
    </Grid>
    <RecipeMix recipe={recipe} />
    </>
  )
}
