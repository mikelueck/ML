const React = require('React');
import { timestampToDate } from './timestamp.js';
import { floatToMoney } from './money.js';
import { moneyToString } from './money.js';
import { moneyToFloat } from './money.js';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { ConfirmDialog } from './Dialog';
import { AlertDialog } from './Dialog';
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
      return getItemValue(row).markupPercent ? getItemValue(row).markupPercent : ""
    },
    renderCell: (params) => (
      <>
      {getItemValue(params.row).markupPercent ? getItemValue(params.row).markupPercent + '%' : ""}
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

function RecipeMix({recipeId, servingSizeGrams, totalGrams }) {
  const [isLoading, setIsLoading] = React.useState(true)
  const [recipeMix, setRecipeMix] = React.useState(null);

  React.useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await getGrpcClient().calculateRecipe(
            {recipeId: recipeId, 
             servingSizeGrams: servingSizeGrams, 
             totalGrams: totalGrams });
        
        setRecipeMix(response.recipeDetails);
      } catch (error) {
        //setError(error);
        console.log(error);
      } finally {
        setIsLoading(false)
      }
    };
    fetchData();
  }, [recipeId, servingSizeGrams, totalGrams]);

  if (recipeMix == null) {
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
          value={recipeMix.recipe.id}
          size="small"
          variant="standard"
      />
      <Field
          id='name'
          label='Name' 
          value={recipeMix.recipe.name}
          size="small"
          variant="standard"
      />
      <Field
          id='overage'
          label='Probiotic Overage %' 
          value={recipeMix.recipe.probioticOveragePercent}
          size="small"
          variant="standard"
          type="number"
          units="%"
      />
    </Grid>
    
    <Box sx={{ m:1 }}>
      <TotalRow title="Totals" columnDef={prebioticColumns} ingredients={recipeMix.ingredients} />

      <IngredientRows title="Probiotics" columnDef={probioticColumns} ingredients={recipeMix.ingredients} type="probiotic" />
      <IngredientRows title="Prebiotics" columnDef={prebioticColumns} ingredients={recipeMix.ingredients} type="prebiotic" />
      <IngredientRows title="Postbiotics" columnDef={prebioticColumns} ingredients={recipeMix.ingredients} type="postbiotic" />
    </Box>
    </>
  )
}

export default function () {
  let initSize = 10000
  const [servingGrams, setServingGrams] = React.useState(1)
  const [totalGrams, setTotalGrams] = React.useState(initSize)
  const [searchParams, setSearchParams] = useSearchParams();
  const [servingsPerContainer, setServingsPerContainer] = React.useState(initSize)
  const [numContainers, setNumContainers] = React.useState(1)
  const [gramsPerContainer, setGramsPerContainer] = React.useState(initSize)

  const recipeId = searchParams.get('recipeId')
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
    setServingsPerContainer(Math.floor(event.sizeG / servingGrams))
    updateNumContainers(totalGrams, servingGrams, event.sizeG)
  }

  const updateNumContainers = (total, servingSize, g_cont) => {
    let num_servings_cont = Math.floor(g_cont / servingSize)

    setNumContainers(Math.ceil(total / (num_servings_cont * servingSize)))
  }


  const handleServingGramsChange = (event) => {
    setServingGrams(event.target.value)
    setServingsPerContainer(Math.floor(gramsPerContainer / event.target.value))
    updateNumContainers(totalGrams, event.target.value, gramsPerContainer)
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
          editable={true}
      />
      <Field
          id='total_grams'
          label='Total grams' 
          value={totalGrams}
          size="small"
          type="number"
          variant="standard"
          onChange={handleTotalGramsChange}
          editable={true}
      />
    </Grid>
    <Grid container rowSpacing={1} columnSpacing={{ xs:1, sm: 2, md: 3 }} sx={{ p: 2 }} spacing={2}>
      <ContainerDropdown
        onChange={handleContainerChange}
      />
      <Field
          id='servings_per_container'
          label='Servings per container' 
          value={servingsPerContainer}
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
    <RecipeMix recipeId={recipeId} servingSizeGrams={servingGrams} totalGrams={totalGrams} />
    </>
  )
}
