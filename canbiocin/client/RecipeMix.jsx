const React = require('React');
import { timestampToDate } from './timestamp.js';
import { timestampToDateTimeString } from './timestamp.js';
import { floatToMoney } from './money.js';
import { moneyToString } from './money.js';
import { moneyToFloat } from './money.js';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { InputDialog } from './Dialog';
import { AlertDialog } from './Dialog';
import { emptyIngredientForType } from "./utils.js";
import { valueToPrecision } from './utils.js';
import { getNameForIngredient } from './utils.js';
import { ContainerDropdown } from './Dropdowns';
import { ShippingDropdown } from './Dropdowns';
import { IngredientCellRender } from './DataGridUtils';
import { ConfirmDialog } from './Dialog';

import { EditToolbar } from './DataGridEditToolbar';

import { useGrpc } from './GrpcContext';
import { scopes } from './scopes.js';

import { Field } from './Field';

import { AppBar,
         Box, 
         CircularProgress,
         Dialog,
         DialogTitle,
         Grid,
         IconButton,
         Toolbar,
         Tooltip,
         Typography } from '@mui/material';

import CloseIcon from '@mui/icons-material/Close';
import CancelIcon from '@mui/icons-material/Cancel';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import BlenderIcon from '@mui/icons-material/Blender';

import { DataGrid,
         useGridApiRef,
         GridRowModes,
         GridActionsCellItem,
         GridEditInputCell,
         GridRowEditStopReasons,
         TollbarButton, 
} from '@mui/x-data-grid';

function getItemValue(row) {
  return row.ingredient.item.value
}

function getRowId(row) {
  if (row.ingredient.item.case == "packaging") {
    return getItemValue(row).item.value.id
  } 
  return getItemValue(row).id
}

const precision = 2;

const renderDualCell = (params) => {
  return (
    <>
    <Grid container>
    <Typography variant="span">
      {`(${params.value.cb})\u00A0/\u00A0`}
    </Typography>
    <Typography fontWeight="bold" color="primary" variant="span">
      {`${params.value.client}`}
    </Typography>
    </Grid>
    </>
  )
}

const commonColumns = (columnsToShow, currencyRate) => { return [
  ...(columnsToShow.has('percent') ? [{ field: 'percent', 
    headerName: '', 
    align: 'center',
    headerAlign: 'center',
    valueGetter: (value, row) => {
      return row.percent * 100
    },
    flex: 1.5,
    renderHeader: () => (
      <Grid container>
      <Typography fontWeight="bold" variant="span">
       {'Amount\u00A0in\u00A0'} 
      </Typography>
      <Typography fontWeight="bold" variant="span">
        {'Blend'}
      </Typography>
      </Grid>
    ),
    valueFormatter: (value) => {
      return valueToPrecision(value, precision, " %")
    },
  }] : []),
  ...(columnsToShow.has('mg_serving') ? [{ field: 'mg_serving', 
    headerName: 'mg/serving', 
    align: 'center',
    headerAlign: 'center',
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
  }] : []),
  ...(columnsToShow.has('amount_needed') ? [{ field: 'amount_needed', 
    headerName: 'Amount Needed (kg)', 
    align: 'center',
    headerAlign: 'center',
    valueGetter: (value, row) => {
      return row.totalGrams / 1000
    },
    flex: 1.5,
    renderHeader: () => (
      <Grid container>
      <Typography fontWeight="bold" variant="span">
       {'Amount\u00A0'} 
      </Typography>
      <Typography fontWeight="bold" variant="span">
        {'Needed\u00A0'}
      </Typography>
      <Typography fontWeight="bold" variant="span">
        {'(kg)'}
      </Typography>
      </Grid>
    ),
    valueFormatter: (value) => {
      return valueToPrecision(value, precision)
    },
  }] : []),
  ...(columnsToShow.has('cost_container') ? [{ field: 'cost_container', 
    headerName: 'Cost Container', 
    align: 'center',
    headerAlign: 'center',
    type: 'string',
    valueGetter: (value, row) => {
      return {cb: moneyToString(row.cbCostPerContainer, precision, false),
              client: moneyToString(row.clientCostPerContainer, precision, false),           }
    },
    flex: 2,
    renderHeader: () => (
      <Grid container>
      <Typography fontWeight="bold" variant="span">
       {'Cost\u00A0/\u00A0'} 
      </Typography>
      <Typography fontWeight="bold" variant="span">
        {'Container'}
      </Typography>
      </Grid>
    ),
    renderCell: renderDualCell,
  }] : []),
  ...(columnsToShow.has('cb_cost_container') ? [{ field: 'cb_cost_container', 
    headerName: 'CB Cost Container', 
    align: 'center',
    headerAlign: 'center',
    type: 'number',
    valueGetter: (value, row) => {
      return moneyToString(row.cbCostPerContainer, precision, true)
    },
    flex: 1.5,
    renderHeader: () => (
      <Grid container>
      <Typography fontWeight="bold" variant="span">
       {'CanBiocin\u00A0'} 
      </Typography>
      <Typography fontWeight="bold" variant="span">
        {'CoGs/Container'}
      </Typography>
      </Grid>
    ),
    valueFormatter: (value) => {
      if (value.length > 0) {
        return '$\u00A0' + value;
      }
      return ''
    },
  }] : []),
  ...(columnsToShow.has('cost_serving') ? [{ field: 'cost_serving', 
    headerName: 'Cost Serving', 
    align: 'center',
    headerAlign: 'center',
    type: 'string',
    valueGetter: (value, row) => {
      return {cb: moneyToString(row.cbCostPerServing, 4, false),
              client: moneyToString(row.clientCostPerServing, 4, false),           }
    },
    flex: 2,
    renderHeader: () => (
      <Grid container>
      <Typography fontWeight="bold" variant="span">
       {'Cost\u00A0/\u00A0'} 
      </Typography>
      <Typography fontWeight="bold" variant="span">
        {'Serving'}
      </Typography>
      </Grid>
    ),
    renderCell: renderDualCell,
  }] : []),
  ...(columnsToShow.has('cb_cost_serving') ? [{ field: 'cb_cost_serving', 
    headerName: 'CB Cost Serving', 
    align: 'center',
    headerAlign: 'center',
    type: 'number',
    valueGetter: (value, row) => {
      return moneyToString(row.cbCostPerServing, 4, true)
    },
    flex: 1.5,
    renderHeader: () => (
      <strong>{'CanBiocin'}<br/>{'CoGs/Serving'}</strong>
    ),
    valueFormatter: (value) => {
      if (value.length > 0) {
        return '$\u00A0' + value;
      }
      return ''
    },
  }] : []),
  ...(columnsToShow.has('client_cost_container') ? [{ field: 'client_cost_container', 
    headerName: 'Client Cost Container', 
    align: 'center',
    headerAlign: 'center',
    type: 'number',
    valueGetter: (value, row) => {
      return moneyToString(row.clientCostPerContainer, precision, true)
    },
    flex: 1.5,
    renderHeader: () => (
      <strong>{'Client'}<br/>{'CoGs/Container'}</strong>
    ),
    valueFormatter: (value) => {
      if (value.length > 0) {
        return '$\u00A0' + value;
      }
      return ''
    },
  }] : []),
  ...(columnsToShow.has('total') ? [{ field: 'total', 
    headerName: 'Order Total', 
    align: 'center',
    headerAlign: 'center',
    type: 'string',
    valueGetter: (value, row) => {
      return {cb: moneyToString(row.cbTotal, precision, false),
              client: moneyToString(row.clientTotal, precision, false),           }
    },
    flex: 2,
    renderHeader: () => (
      <strong>{'Order Total'}</strong>
    ),
    renderCell: renderDualCell,
  }] : []),
  ...(columnsToShow.has('cb_total') ? [{ field: 'cb_total', 
    headerName: 'CB Total', 
    align: 'center',
    headerAlign: 'center',
    type: 'number',
    valueGetter: (value, row) => {
      return moneyToString(row.cbTotal, precision, true);
    },
    flex: 1.5,
    renderHeader: () => (
      <Grid container>
      <Typography fontWeight="bold" variant="span">
       {'Total\u00A0'} 
      </Typography>
      <Typography fontWeight="bold" variant="span">
        {'CanBiocin\u00A0'}
      </Typography>
      <Typography fontWeight="bold" variant="span">
        {'CoGs/Order'}
      </Typography>
      </Grid>
    ),
    valueFormatter: (value) => {
      if (value.length > 0) {
        return '$\u00A0' + value;
      }
      return ''
    },
  }] : []),
  ...(columnsToShow.has('client_total') ? [{ field: 'client_total', 
    headerName: 'Client Total', 
    align: 'center',
    headerAlign: 'center',
    type: 'number',
    valueGetter: (value, row) => {
      return moneyToString(row.clientTotal, precision, true);
    },
    flex: 1.5,
    renderHeader: () => (
      <Grid container>
      <Typography fontWeight="bold" variant="span">
       {'Total Client\u00A0'} 
      </Typography>
      <Typography fontWeight="bold" variant="span">
        {'CoGs/Order'}
      </Typography>
      </Grid>
    ),
    valueFormatter: (value) => {
      return '$\u00A0' + value;
    },
  }] : []),
  ...(columnsToShow.has('client_total_currency') && currencyRate != 0 && currencyRate != 1.0 ? [{ field: 'client_total_currency', 
    headerName: 'Client Total $US', 
    align: 'center',
    headerAlign: 'center',
    type: 'number',
    valueGetter: (value, row) => {
      return moneyToString(row.clientTotalCurrency, precision, true);
    },
    flex: 1.5,
    renderHeader: () => (
      <Grid container>
      <Typography fontWeight="bold" variant="span">
       {'$US Client\u00A0'} 
      </Typography>
      <Typography fontWeight="bold" variant="span">
        {'CoGs/Order'}
      </Typography>
      </Grid>
    ),
    renderCell: (params) => {
      return (
        <>
        <Typography fontWeight="bold" color="primary" variant="span">
          {`$\u00A0${params.value}`}
        </Typography>
        </>
      )
    }
  }] : []),
]}

const probioticColumns = (columnsToShow, currencyRate) => { return [
  { field: 'strain',
    headerName: 'Strain', 
    sortable:true,
    valueGetter: (value, row) => {
      return getItemValue(row).strain;
    },
    flex: 3,
    renderHeader: () => (
      <strong>{'Strain'}</strong>
    ),
    renderCell:(params) => (<IngredientCellRender 
                                params={params} 
                                itemGetter={(row) => {
                                  return row.ingredient.item
                                }}/>)
  },
  { field: 'isMe', 
    headerName: 'Is ME?', 
    align: 'center',
    headerAlign: 'center',
    valueGetter: (value, row) => {
      return row.isMe
    },
    flex: 1,
    type: 'boolean',
    renderHeader: () => (
      <strong>{'Is Me?'}</strong>
    ),
  },
  { field: 'desiredBCfuG', 
    headerName: 'Desired B CFU/g', 
    align: 'center',
    headerAlign: 'center',
    valueGetter: (value, row) => {
      return row.desiredBCfuG
    },
    flex: 1,
    type: 'number',
    renderHeader: () => (
      <Grid container>
      <Typography fontWeight="bold" variant="span">
       {'Desired\u00A0'} 
      </Typography>
      <Typography fontWeight="bold" variant="span">
        {'B\u00A0BCFU/g'}
      </Typography>
      </Grid>
    ),
  },
  ...commonColumns(columnsToShow, currencyRate),
]};

const prebioticColumns = (columnsToShow, currencyRate) => { return [
  { field: 'name',
    headerName: 'Name', 
    sortable:true,
    valueGetter: (value, row) => {
      return getItemValue(row).name;
    },
    flex: 4,
    renderHeader: () => (
      <strong>{'Name'}</strong>
    ),
    renderCell:(params) => (<IngredientCellRender 
                                params={params} 
                                itemGetter={(row) => {
                                  return row.ingredient.item
                                }}/>)
  },
  ...commonColumns(columnsToShow, currencyRate)
]};

const packagingColumns = (columnsToShow, currencyRate) => { return [
  { field: 'name',
    headerName: 'Name', 
    sortable:true,
    valueGetter: (value, row) => {
      return getNameForIngredient(row.ingredient);
    },
    flex: 6,
    renderHeader: () => (
      <strong>{'Name'}</strong>
    ),
    renderCell:(params) => (<IngredientCellRender 
                                params={params} 
                                itemGetter={(row) => {
                                  return row.ingredient.item
                                }}/>)
  },
  { field: 'amount_needed', 
    headerName: 'Number Needed', 
    valueGetter: (value, row) => {
      return row.totalGrams
    },
    flex: 1.5,
    renderHeader: () => (
      <Grid container>
      <Typography fontWeight="bold" variant="span">
       {'Number\u00A0'} 
      </Typography>
      <Typography fontWeight="bold" variant="span">
        {'Needed'}
      </Typography>
      </Grid>
    ),
    valueFormatter: (value) => {
      return valueToPrecision(value, precision)
    },
  },
  ...commonColumns(columnsToShow, currencyRate)
]}

const computeTotals = (ingredients, rows) => {
  if (ingredients.length == 0) {
    return
  }
  let desiredBCfuG = 0;
  let percent = 0;
  let mgServing = 0;
  let totalGrams = 0;
  let cbCostPerContainer = 0;
  let clientCostPerContainer = 0;
  let cbTotal = 0;
  let clientTotal = 0;
  let clientTotalCurrency = 0;

  ingredients.map((i) => {
    desiredBCfuG += i.desiredBCfuG
    percent += i.percent
    mgServing += i.perservingMg
    totalGrams += i.totalGrams
    cbCostPerContainer += moneyToFloat(i.cbCostPerContainer)
    clientCostPerContainer += moneyToFloat(i.clientCostPerContainer)
    cbTotal += moneyToFloat(i.cbTotal)
    clientTotal += moneyToFloat(i.clientTotal)
    clientTotalCurrency += moneyToFloat(i.clientTotalCurrency)
  })

  rows.push(
  {
  // This is mimicing the shape of a pb.IngredientDetails
  ingredient: {item: {value: {id: "Total", strain: "Total", name: "Total"}}},
  desiredBCfuG: desiredBCfuG,
  percent: percent,
  perservingMg: mgServing,
  totalGrams: totalGrams,
  cbCostPerContainer: floatToMoney(cbCostPerContainer),
  clientCostPerContainer: floatToMoney(clientCostPerContainer),
  cbTotal: floatToMoney(cbTotal),
  clientTotal: floatToMoney(clientTotal),
  clientTotalCurrency: floatToMoney(clientTotalCurrency),
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
        getRowHeight={() => 'auto'}
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

  // Add a few extra columns that are valuable but not needed
  // everywhere
  let servingSizeG = Math.round(rows[0].perservingMg/1000)

  rows[0].cbCostPerServing = floatToMoney(servingSizeG / rows[0].totalGrams * moneyToFloat(rows[0].cbTotal))
  rows[0].clientCostPerServing = floatToMoney(servingSizeG / rows[0].totalGrams * moneyToFloat(rows[0].clientTotal))

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
        getRowHeight={() => 'auto'}
        hideFooter
        disableColumnMenu
        disableColumnSorting
      />
      {/* Disable column functionally to support a Total row.  TODO could use DataGridPremium*/}
      </div>
      </Box>
  )
}

function PackagingSelect({title, columnDef, newRowFn, editable, packaging, apiRef, setPackaging, rowModesModel, setRowModesModel, onRowModesModelChange, onRowEditStop, processRowUpdate, fieldToFocus }) {

  const onProcessRowUpdateError = (e) => {
    alert("ProcessRowUpdateError fixme")
    console.log(e)
  };
  
  const getRowId = (row) => {
    return row.id
  }

  return (
    <Box sx={{ width: '100%', m:1 }}>
    <Typography variant="h5" component="div">
      {title}
    </Typography>
    <div style={{ display: 'flex', flexDirection: 'column' }}>
    <DataGrid
      apiRef={apiRef}
      rows={packaging}
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
        toolbar: { label: "Add Packaging",
                   fieldToFocus: fieldToFocus,
                   newRowFn: newRowFn,
                   setRows: setPackaging, 
                   setRowModesModel: setRowModesModel, 
                   editable: editable },
      }}
      hideFooter
      showToolbar
      disableColumnMenu
      disableColumnSorting
    />
    </div>
    </Box>
  )
}

function RecipeMix({recipe, currencyRate}) {
  let totalColsToShow = new Map()
  totalColsToShow.set('mg_serving')
  totalColsToShow.set('amount_needed')
  totalColsToShow.set('cost_container')
  totalColsToShow.set('total')
  totalColsToShow.set('total')
  totalColsToShow.set('client_total_currency')
  totalColsToShow.set('cost_serving')

  let colsToShow = new Map()
  colsToShow.set('percent')
  colsToShow.set('mg_serving')
  colsToShow.set('amount_needed')
  colsToShow.set('cb_cost_container')
  colsToShow.set('cb_total')

  let packagingColsToShow = new Map()
  packagingColsToShow.set('cb_cost_container')
  packagingColsToShow.set('cb_total')

  let blendingColsToShow = new Map()
  blendingColsToShow.set('cb_cost_container')
  blendingColsToShow.set('cb_total')
  

  if (recipe == null) {
    return ""
  }

  return (
    <>
    <Box 
      sx={{
        borderRadius: 2,
        border: 4,
        borderColor: 'primary.main',
        m: 1,
      }}>
    <Grid container rowSpacing={1} columnSpacing={{ xs:1, sm: 2, md: 3 }} sx={{ p: 2 }} spacing={2}>
      <Field
          id='name'
          label='Name' 
          value={recipe.recipe.name}
          size="small"
          variant="standard"
      />
      <Field
          id='overage'
          label='Probiotic Overage' 
          value={recipe.recipe.probioticOveragePercent}
          size="small"
          variant="standard"
          type="number"
          units="%"
      />
    </Grid>
    
      <Box sx={{ m:2 }}>
      <TotalRow 
          title="Totals" 
          columnDef={prebioticColumns(totalColsToShow, currencyRate)} 
          ingredients={recipe.ingredients} />

      </Box>
      <Box sx={{ m:2 }}>
      <IngredientRows 
          title="Probiotics" 
          columnDef={probioticColumns(colsToShow, currencyRate)} 
          ingredients={recipe.ingredients} type="probiotic" />
      </Box>
      <Box sx={{ m:2 }}>
      <IngredientRows 
          title="Prebiotics" 
          columnDef={prebioticColumns(colsToShow, currencyRate)} 
          ingredients={recipe.ingredients} type="prebiotic" />
      </Box>
      <Box sx={{ m:2 }}>
      <IngredientRows 
          title="Postbiotics" 
          columnDef={prebioticColumns(colsToShow, currencyRate)} 
          ingredients={recipe.ingredients} type="postbiotic" />
      </Box>
      <Box sx={{ m:2 }}>
      <IngredientRows 
          title="Packaging" 
          columnDef={packagingColumns(packagingColsToShow, currencyRate)} 
          ingredients={recipe.ingredients} type="packaging" />
      </Box>
      <Box sx={{ m:2 }}>
      <IngredientRows 
          title="Milling/Blending/Packaging" 
          columnDef={packagingColumns(blendingColsToShow, currencyRate)} 
          ingredients={recipe.ingredients} type="blending" />
      </Box>
      </Box>
    </>
  )
}

const editNameField = "edittedName";

const ContainerFieldOrDropdown = React.memo(function ContainerFieldOrDropdown({recipe, editable, onContainerChange}) {
  const containerValue = React.useMemo(() => {
    return recipe?.container || null;
  }, [recipe?.container?.id, recipe?.container?.packaging?.name]);

  const displayValue = React.useMemo(() => {
    return recipe?.container?.packaging?.name || "";
  }, [recipe?.container?.packaging?.name]);
    
  if (editable) {
    return (
    <ContainerDropdown
      label=''
      value={containerValue}
      onChange={onContainerChange}
      editable={editable}
    />
    )
  } else {
    return (
    <Field
        id='container'
        label='' 
        value={displayValue}
        size="small"
        type="string"
        variant="standard"
        editable={false}
    />
    )
  }
}, (prevProps, nextProps) => {
  // Custom comparison: only re-render if editable, container, or onChange changes
  if (prevProps.editable !== nextProps.editable) return false;
  if (prevProps.onContainerChange !== nextProps.onContainerChange) return false;
  
  const prevContainer = prevProps.recipe?.container;
  const nextContainer = nextProps.recipe?.container;
  
  // If both are null/undefined, they're equal
  if (!prevContainer && !nextContainer) return true;
  
  // If one is null and the other isn't, they're different
  if (!prevContainer || !nextContainer) return false;
  
  // Compare by id and packaging name
  return prevContainer.id === nextContainer.id && 
         prevContainer.packaging?.name === nextContainer.packaging?.name;
});

const ShippingFieldOrDropdown = React.memo(function ShippingFieldOrDropdown({recipe, editable, onShippingChange}) {
  const shippingValue = React.useMemo(() => {
    return recipe?.shipping || null;
  }, [recipe?.shipping?.id, recipe?.shipping?.packaging?.name]);

  const displayValue = React.useMemo(() => {
    return recipe?.shipping?.packaging?.name || "";
  }, [recipe?.shipping?.packaging?.name]);
    
  if (!recipe?.container) {
    return ""
  }
  if (editable) {
    return (
    <ShippingDropdown
      label=''
      value={shippingValue}
      container={recipe?.container}
      onChange={onShippingChange}
      editable={editable}
    />
    )
  } else {
    return (
    <Field
        id='shipping'
        label=''
        value={displayValue}
        size="small"
        type="string"
        variant="standard"
        editable={false}
    />
    )
  }
}, (prevProps, nextProps) => {
  // Custom comparison: only re-render if editable, shipping, or onChange changes
  if (prevProps.editable !== nextProps.editable) return false;
  if (prevProps.onShippingChange !== nextProps.onShippingChange) return false;
  
  let prev = prevProps.recipe?.container;
  let next = nextProps.recipe?.container;
  
  // If both are null/undefined, they're equal
  if (!prev && !next) return true;
  
  // If one is null and the other isn't, they're different
  if (!prev || !next) return false;

  if (prev.id !== next.id) return false

  prev = prevProps.recipe?.shipping;
  next = nextProps.recipe?.shipping;
  
  // If both are null/undefined, they're equal
  if (!prev && !next) return true;
  
  // If one is null and the other isn't, they're different
  if (!prev || !next) return false;
  
  // Compare by id
  return prev.id === next.id
});

export default function () {
  let initSizeG = 10000
  const [isLoading, setIsLoading] = React.useState(true)
  const [servingGrams, setServingGrams] = React.useState(1)
  const [totalGrams, setTotalGrams] = React.useState(initSizeG)
  const [searchParams, setSearchParams] = useSearchParams();
  const [container, setContainer] = React.useState(null);
  const [shipping, setShipping] = React.useState(null);
  const [packagingItems, setPackagingItems] = React.useState([]);
  const [numContainers, setNumContainers] = React.useState(1)
  const [containerSizeG, setContainerSizeG] = React.useState(initSizeG)
  const [targetMargin, setTargetMargin] = React.useState(65)
  const [currencyRate, setCurrencyRate] = React.useState(0.77)
  const [recipe, setRecipe] = React.useState(null)
  const [isSaving, setIsSaving] = React.useState(false)
  const [savedRecipeName, setSavedRecipeName] = React.useState("")
  const [savedRecipeTime, setSavedRecipeTime] = React.useState("")
  const [saveNameOpen, setSaveNameOpen] = React.useState(false)
  const [packagingList, setPackagingList] = React.useState([]);
  const [packagingByName, setPackagingByName] = React.useState(new Map());

  const [errorOpen, setErrorOpen] = React.useState(false)
  const [error, setError] = React.useState("")
  const { grpcRequest } = useGrpc();

  const handleErrorClose = () => {
    setErrorOpen(false)
  }


  const recipeId = searchParams.get('recipeId')
  const savedRecipeId = searchParams.get('savedRecipeId')
  const navigate = useNavigate();

  const [editable, setEditable] = React.useState(!savedRecipeId)

  const handleClose = () => () => {
    navigate(-1);
  }

  const updateNumContainers = React.useCallback((total, servingSize, contSizeG) => {
    let num_servings_cont = Math.floor(contSizeG / servingSize)

    setNumContainers(Math.ceil(total / (num_servings_cont * servingSize)))
  }, []);

  const handleTotalGramsChange = (event) => {
    setTotalGrams(event.target.value)
    updateNumContainers(event.target.value, servingGrams, containerSizeG)
  }

  const handleContainerChange = React.useCallback((event) => {
    setContainer(event)
    setShipping(null)
    let size = containerSizeG
    if (event.sizeG) {
      setContainerSizeG(event.sizeG)
      size = event.sizeG
    }
    updateNumContainers(totalGrams, servingGrams, size)
  }, [totalGrams, servingGrams, containerSizeG, updateNumContainers])

  const handleShippingChange = React.useCallback((event) => {
    setShipping(event)
  }, [])

  const handleContainerSizeChange = (event) => {
    setContainerSizeG(event.target.value)
    updateNumContainers(totalGrams, servingGrams, event.target.value)
  }


  const handleServingGramsChange = (event) => {
    setServingGrams(event.target.value)
    updateNumContainers(totalGrams, event.target.value, containerSizeG)
  }

  const handleTargetMarginChange = (event) => {
    setTargetMargin(event.target.value)
  }

  const handleCurrencyRateChange = (event) => {
    setCurrencyRate(event.target.value)
  }

  const handleSaveClick = () => {
    if (recipe) {
      if (recipe.name) {
        setIsSaving(true)
      } else {
        setSaveNameOpen(true)
      }
      if (!recipe.container || !recipe.shipping) {
        setError("Warning: You are saving a recipe but you haven't selected a container or shipping packaging")
        setErrorOpen(true)
      }
    }
  }

  const handleSaveClickChange = (value) => {
    recipe.name = value
    setSavedRecipeName(value)
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


  const packagingApiRef = useGridApiRef();
  const[packagingRowModesModel, setPackagingRowModesModel] = React.useState({});

  const handlePackagingRowModesModelChange = (newRowModesModel) => {
    setPackagingRowModesModel(newRowModesModel)
  }       

  const verifyPackaging = (list) => {
    let map = new Map()
    for (let i = 0; i < list.length; i++) {
      if (map.has(list[i].id)) {
        return false
      }
      map.set(list[i].id)
    }
    return true
  }

  const processRowUpdate = (newRow) => {
    // Can probably do something better here than copying things around
    let clone = structuredClone(packagingItems);

    let index = -1;
    for (let i = 0; i < clone.length; i++) {
      if (newRow.id == clone[i].id) {
        index = i
        break
      }
    }

    if (index >= 0 && index < clone.length) {
      let oldPackaging;

      const rowIsNew = newRow.isNew

      if (newRow[editNameField] && newRow[editNameField] != clone[index][editNameField]) {
        // They changed the type of the packaging
        let updatedPackaging = packagingByName.get(newRow[editNameField])
        if (updatedPackaging) {
          oldPackaging = clone[index]
          newRow = updatedPackaging
        } else {
          console.log(`An ingredient was selected but we couldn't find it ${newRow[editNameField]}`);
        }
      }
      clone.splice(index, 1, newRow)
      let verify = verifyPackaging(clone)
      if (!verify && oldPackaging) {
        // Datagrid behaves badly if two rows have the same id
        clone.splice(index, 1, oldPackaging)
      }
      if (!verify && rowIsNew) {
        // if the new row is an addition and the recipe can't verify properly then we just delete the ingredient
        clone.splice(index, 1)
        Promise.reject();
      }
      // We update the updatedRecipe even if it isn't valid so that it renders correctly
      setPackagingItems(clone)
    } else {
      console.log(`Couldn't find ingredients to update for ${newRow}`)
      Promise.reject();
    }
    
    const updatedRow = { ...newRow, isNew: false };
    return updatedRow;
  };

  const packagingRowModels = {
    apiRef: packagingApiRef,
    rowModesModel:packagingRowModesModel,
    setRowModesModel: setPackagingRowModesModel,  
    onModesModelChange: handlePackagingRowModesModelChange,
    processRowUpdate: processRowUpdate
  }

  const handleRowCancelClick = (id) => () => {
    const [rowModesModel, setRowModesModel] = [packagingRowModels.rowModesModel, packagingRowModels.setRowModesModel] 
  
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View, ignoreModifications: true } });
  }

  const handleRowEditClick = (id) => () => {
    const [rowModesModel, setRowModesModel] = [packagingRowModels.rowModesModel, packagingRowModels.setRowModesModel] 
        
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
  }     

  const handleRowEditStop = (params, event) => {
    if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      event.defaultMuiPrevent = true;
    }         
  }             

  const handleRowDeleteClick = (id) => () => {
    for (let i = 0; i < packagingItems.length; i++) {
      if (packagingItems[i].id == id) {
        let clone = structuredClone(packagingItems)
        clone.splice(i, 1)
        setPackagingItems(clone)
        return
      }   
    }   
  }   


  const setPackaging = (packagingItems) => (rowsOrFn) => {
    if (typeof rowsOrFn === 'function') {
      
      let newPackaging = rowsOrFn(packagingItems)
      setPackagingItems(newPackaging)
    } else {
      setPackagingItems(rowsOrFn)
    }     
  }

  const packagingCols = (editable) => {
    let names = Array.from(packagingByName.keys())

    return [{ field: editNameField,
      headerName: 'Name',
      editable: editable,
      sortable:true,
      valueGetter: (value, row) => {
        if (!row) return ""
        return row.name;
      },
      valueOptions: names,
      type: "singleSelect",
      flex: 3,
      renderHeader: () => (
        <strong>{'Name'}</strong>
      ),
    },]
  }

  const actionColumns = (editable) => {
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
      const isInEditMode = packagingRowModels.rowModesModel?.[id]?.mode === GridRowModes.Edit;
          
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

  const newRowFn = () => {
    // Prefill the item with the first element in the list
    for (let i = 0; i < packagingList.length; i++) {
      let alreadyUsed = false
      for (let j = 0; j < packagingItems.length; j++) {
        if (packagingItems[j].name == packagingList[i].name) {
          alreadyUsed = true
        }
      }
      if (!alreadyUsed) {
        let clone = structuredClone(packagingList[i])
        clone.isNew = true
        return clone;
      }
    } 
        
    console.log("This recipe is already using all the ingredients so adding a new row doesn't make sense")
    
    let clone = structuredClone(packagingList[0])
    clone.isNew = true
    return clone
  }



  React.useEffect(() => {
    const fetchPackaging = async () => {
      let isError = false
      setIsLoading(true);
      try {
        const response = await grpcRequest("listPackaging", {});
        let packagingList = []
        let nameMap = new Map()
        for (let i = 0; i < response.packaging.length; i++) {
          let value = response.packaging[i]

          nameMap.set(value.name, value);
          packagingList.push(value)
        }
        // Sort each type 
        packagingList.sort((a,b) => {
          return a.name.localeCompare(b.name)
        })

        setPackagingList(packagingList)
        setPackagingByName(nameMap)
      } catch (error) {
        isError = true
        setError(error);
        setErrorOpen(true)
        console.log(error);
      } finally {
        if (isError) {
          setErrorOpen(true);
        }
        setIsLoading(false)
      }
    };
    fetchPackaging();
  }, []);

  const updateNewRecipeFields = (r) => {
    setRecipe(r)
    setSavedRecipeName(r.name)
    setSavedRecipeTime(timestampToDateTimeString(r.time))
    setServingGrams(r.servingSizeGrams)
    setTotalGrams(r.totalGrams)
    setContainer(r.container)
    setShipping(r.shipping)
    setPackagingItems(r.packaging)
    setTargetMargin(r.targetMargin)
    setCurrencyRate(r.currencyRate)
    setContainerSizeG(r.containerSizeGrams)
    updateNumContainers(r.totalGrams, r.servingSizeGrams, r.containerSizeGrams)
  }

  React.useEffect(() => {
    const saveRecipeMix = async () => {
      if (isSaving) {
        let isError = false
        let isAdd = !savedRecipeId
        try {
          recipe.packaging = packagingItems
          if (isAdd) {
            const response = await grpcRequest("createSavedRecipe", {recipe: recipe});
            recipe.id = response.id
          } else {
            recipe.id = savedRecipeId
            const response = await grpcRequest("updateSavedRecipe", {recipe: recipe});
          }
        } catch (e) {
          isError = true
          setError(e.message);
          console.log(e)
        } finally {
          let id = recipe.id
          setRecipe(null) // This forces reloading of the recipe mostly to get the right timestamp
          setEditable(false)
          setIsSaving(false)
          if (isError) {
            setErrorOpen(true);
          } else {
            navigate(`/recipeMix?&savedRecipeId=${id}`, { replace: true })
          }
        }
      }
    }
    saveRecipeMix()
  }, [isSaving, recipe]);

  const handleEditClick = () => {
    setEditable(true)
  }


  React.useEffect(() => {
    if (editable || !recipe) {
      // Start the isLoading spinner ASAP
      setIsLoading(true)
    }
    const handler = setTimeout(() => {
      const fetchData = async () => {
        try {
          // If we have a savedRecipeId we load it here
          if (editable || !recipe) {
            setIsLoading(true)
            if (savedRecipeId && !editable) {
              const response = await grpcRequest("getSavedRecipe",
                  {savedRecipeId: savedRecipeId});
              let r = response.recipe
              updateNewRecipeFields(r)
            } else if (containerSizeG > 0) {
              const response = await grpcRequest("calculateRecipe",
                  {recipeId: recipe && recipe.recipe.id ? recipe.recipe.id : recipeId, 
                   servingSizeGrams: servingGrams, 
                   totalGrams: totalGrams,
                   container: container,
                   shipping: shipping,
                   packaging: packagingItems,
                   containerSizeGrams: containerSizeG,
                   targetMargin: targetMargin,
                   currencyRate: currencyRate });
              response.recipeDetails.name = savedRecipeName
              setRecipe(response.recipeDetails)
              setIsLoading(false)
            }
          }
        } catch (error) {
          //setError(error);
          console.log(error);
        } finally {
          setIsLoading(false)
        }
      };
      fetchData();
    }, 500) // 500ms debounce time
    return () => {
      clearTimeout(handler)
    }
    
  }, [savedRecipeId, recipeId, editable, servingGrams, totalGrams, container, shipping, packagingItems, containerSizeG, targetMargin, currencyRate]);

  function SaveToolbar() {
    const { hasScope } = useGrpc();

    if (!hasScope(scopes.SAVE_RECIPE)) {
      return ""
    }
    
    if (!editable) {
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

  function DeleteToolbar({savedRecipeId}) {
    const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false)
    const [isDeleting, setIsDeleting] = React.useState(false)

    const { hasScope } = useGrpc();

    const handleDeleteClick = () => {
      setDeleteConfirmOpen(true);
    };

    const handleDeleteConfirmClose = () => {
      setDeleteConfirmOpen(false);
    }

    const handleDeleteConfirm = () => {
      setDeleteConfirmOpen(false);
      setIsDeleting(true)
    }

    if (!hasScope(scopes.SAVE_RECIPE)) {
      return ""
    }

    React.useEffect(() => {
      const deleteRecipeMix = async () => {
        if (isDeleting) {
          let isError = false
          try {
              const response = await grpcRequest("deleteSavedRecipe", {savedRecipeId: savedRecipeId});
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

    if (editable) {
      return (<></>)
    }
    return (
        <>
        <IconButton
          edge="end"
          color="inherit"
          onClick={handleEditClick}
          aria-label={"edit"}
        >
          <EditIcon />
        </IconButton>
        <IconButton
          edge="end"
          color="inherit"
          onClick={handleDeleteClick}
          aria-label={"delete"}
        >
          <DeleteIcon />
        </IconButton>
        <ConfirmDialog
          title="Delete Saved Formulation"
          content="Are you sure you want to delete this formulation?"
          open={deleteConfirmOpen}
          onClose={handleDeleteConfirmClose}
          onConfirm={handleDeleteConfirm} />
        </>
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
          {savedRecipeName}
        </Typography>
        <Typography variant="body1" component="span">
          {savedRecipeTime}
        </Typography>
        </Box>
        <Box sx={{ flexGrow: 1}} />
        <SaveToolbar />
        <DeleteToolbar savedRecipeId={savedRecipeId}/>
        <InputDialog
          title="Formulation name"
          content="Please provide a name for the formulation"
          onChange={handleSaveClickChange}
          open={saveNameOpen}
          onClose={handleSaveNameClose}
          onConfirm={handleSaveNameConfirm} />
        <AlertDialog
          title="Error"
          content={error}
          open={errorOpen}
          onClose={handleErrorClose} />
      </Toolbar>
    </AppBar>
    <Box 
      sx={{
        borderRadius: 2,
        backgroundColor: 'primary.light',
        m: 1,
        p: 1,
      }}>
    <Grid container spacing={2} sx={{ m:2}}>
    <Grid container 
      size={6} 
      columnSpacing={{ xs:1, sm: 2, md: 3 }} 
      spacing={2}  
      sx={{ p: 2, 
            backgroundColor: 'white',
            justifyContent: "flex-start" 
      }}>

    <Grid container rowSpacing={1} columnSpacing={{ xs:1, sm: 2, md: 3 }} sx={{ p: 2 }} spacing={2}>
      <Field
          id='targetMargin'
          label='Target Margin' 
          value={targetMargin}
          size="small"
          type="number"
          variant="standard"
          onChange={handleTargetMarginChange}
          editable={editable}
          units="%"
      />
      <Field
          id='currencyRate'
          label='US$ Currency' 
          value={currencyRate}
          size="small"
          type="number"
          variant="standard"
          onChange={handleCurrencyRateChange}
          editable={editable}
      />
    </Grid>
    <Grid container rowSpacing={1} columnSpacing={{ xs:1, sm: 2, md: 3 }} sx={{ p: 2 }} spacing={2}>
    <Field
        id='serving_size_grams'
        label='Serving size grams' 
        value={servingGrams}
        size="small"
        type="number"
        variant="standard"
        onChange={handleServingGramsChange}
        editable={editable}
        units="g"
    />
    <Field
        id='total_grams'
        label='Total grams' 
        value={totalGrams}
        size="small"
        type="number"
        variant="standard"
        onChange={handleTotalGramsChange}
        editable={editable}
        units="g"
    />
    </Grid>
    </Grid>
    <Grid container size={6} columnSpacing={{ xs:1, sm: 2, md: 3 }} spacing={2} sx={{ p: 2, justifyContent: "flex-end" }}>
    <Field
        id='servings_per_container'
        label='Servings per container' 
        value={Math.floor(containerSizeG / servingGrams)}
        size="small"
        type="number"
        sx={{ // This is a long label so we add some extra styles
        // This seems to make the whole field longer
        // Target the InputLabel root
        '& .MuiInputLabel-root': {
          whiteSpace: 'normal', // Allow text to wrap
          wordBreak: 'break-word', // Break long words if necessary
          // You might need to adjust top padding/margin for multi-line labels
          // depending on your font size and number of lines
          top: '0', 
          maxHeight: 'unset',
          // Additional styling for when the label is focused/shrunk might be needed
          '&.MuiInputLabel-shrink': {
            whiteSpace: 'nowrap', // Keep it nowrap when shrunk (standard Material Design behavior)
          },
        },
        // Adjust the input area padding to prevent overlap with a multi-line label
        '& .MuiOutlinedInput-root': {
            paddingTop: '25px', // Increase top padding to accommodate a multi-line label
        }
        }}
        variant="filled"
        editable={false}
        disabled
    />
    <Field
        id='num_containers'
        label='# containers' 
        value={numContainers}
        size="small"
        type="number"
        variant="filled"
        editable={false}
        disabled
    />
    </Grid>
    </Grid>
    <Typography variant="h4" align="left" sx={{ m:2 }}>
      Packaging and Shipping
    </Typography>
    <Grid 
        container 
        sx={{
          backgroundColor: 'white',
          '--Grid-borderWidth': '1px',
          borderTop: 'var(--Grid-borderWidth) solid',
          borderLeft: 'var(--Grid-borderWidth) solid',
          borderColor: 'divider',
          '& > div': {
            borderRight: 'var(--Grid-borderWidth) solid',
            borderBottom: 'var(--Grid-borderWidth) solid',
            borderColor: 'divider',
          },
          m:1,
        }}>
    <Grid container size={6} rowSpacing={1} columnSpacing={{ xs:1, sm: 2, md: 3 }} >
      <Grid container rowSpacing={1} columnSpacing={{ xs:1, sm: 2, md: 3 }} sx={{ m:1 }} >
      <Grid item size={12}>
      <Typography variant="h5" component="div">
        Container
      </Typography>
      </Grid>
      <Grid container size={12} rowSpacing={2}>
      <ContainerFieldOrDropdown
        recipe={recipe}
        editable={editable}
        onContainerChange={handleContainerChange} />
      <Field
          id='container_size_g'
          label='Container size grams' 
          value={containerSizeG}
          size="small"
          type="number"
          variant="standard"
          editable={editable}
          units="g"
          onChange={handleContainerSizeChange}
      />
      </Grid>
      </Grid>
      <Grid container size={12} rowSpacing={1} columnSpacing={{ xs:1, sm: 2, md: 3 }} sx={{ m:1 }} >
      <Grid item size={12}>
      <Typography variant="h5" component="div">
        Shipping
      </Typography>
      </Grid>
      <Grid item size={12}>
      <ShippingFieldOrDropdown
          recipe={recipe}
          editable={editable}
          onShippingChange={handleShippingChange} />
      </Grid>
      </Grid>
    </Grid>
    <Grid size={6} container rowSpacing={1} columnSpacing={{ xs:1, sm: 2, md: 3 }} >
      <PackagingSelect 
          title="Packaging" 
          newRowFn={newRowFn}
          columnDef={packagingCols(editable).concat(editable ? actionColumns(true, packagingRowModels) : [])} 
          editable={editable}
          packaging={packagingItems}
          setPackaging={setPackaging(packagingItems)}
          apiRef={packagingRowModels.apiRef}
          rowModesModel={packagingRowModels.rowModesModel}
          setRowModesModel={packagingRowModels.setRowModesModel}
          onRowModesModelChange={packagingRowModels.onModesModelChange}
          onRowEditStop={packagingRowModels.handleRowEditStop}
          processRowUpdate={packagingRowModels.processRowUpdate}
          fieldToFocus={editNameField}
      />
    </Grid>
    </Grid>
    </Box>
    <Typography variant="h4" align="left" sx={{ m:2 }}>
      Details:
    </Typography>
    {isLoading ? 
      <CircularProgress /> :
      <RecipeMix recipe={recipe} currencyRate={currencyRate} />
    }
    </>
  )
}
