const React = require('React');
import { timestampToDate } from './timestamp.js';
import { timestampToDateString } from './timestamp.js';
import { moneyToString } from './money.js';

import { Box, Tooltip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Close';
import Fab from '@mui/material/Fab';

import { Link } from 'react-router';

import { getGrpcClient } from './grpc.js';

import { DataGrid,
         GridRowModes,
         GridActionsCellItem,
         GridRowEditStopReasons,
         Toolbar,
         TollbarButton, 
} from '@mui/x-data-grid';

function getItemValue(row) {
  return row.item.value
}

function getItemCase(row) {
  return row.item.case
}

function getRowId(row) {
  return getItemValue(row).id
}

export function Ingredients() {
  const [isLoading, setIsLoading] = React.useState(true)
  const [rows, setRows] = React.useState([]);

  const handleRowEditStop = (params, event) => {
    if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      event.defaultMuiPrevented = true;
    }
  };

  React.useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await getGrpcClient().listIngredients({});
        setRows(response.ingredients);
      } catch (error) {
        //setError(error);
        console.log(error);
      } finally {
        setIsLoading(false)
      }
    };
    fetchData();
  }, []);

  const columns = [
    { field: 'id',
      headerName: 'ID', 
      editable: false,
      flex : 1,
      valueGetter: (value, row) => {
        return getItemValue(row).id;
      },
    },
    { field: 'name',
      headerName: 'Name', 
      editable: true, 
      sortable:true,
      type: 'string',
      flex : 3,
      valueGetter: (value, row) => {
        return getItemValue(row).strain ? getItemValue(row).strain : getItemValue(row).name
      },
      renderCell: (params) => (
        <Link to={{
          pathname: "/ingredient",
          search: `?type=${getItemCase(params.row)}&ingredientId=${getItemValue(params.row).id}`, 
        }}>
        {getItemValue(params.row).strain ? getItemValue(params.row).strain : getItemValue(params.row).name}
        </Link>
      ),
    },
    { field: 'stockCfuG', 
      headerName: 'Stock M CFU/g', 
      editable: true,
      flex : 1.5,
      type: 'number',
      valueGetter: (value, row) => {
        return getItemValue(row).stockCfuG;
      },
    },
    { field: 'costKg', 
      headerName: 'Cost / kg', 
      editable: false,
      flex : 1.5,
      type: 'number',
      valueGetter: (value, row) => {
        return moneyToString(getItemValue(row).costKg, 2, true);
      },
      renderCell: (params) => (
        <>
        {moneyToString(getItemValue(params.row).costKg, 2)}
        </>
      )
    },
    { field: 'supplierName', 
      headerName: 'Supplier', 
      editable: false, 
      flex : 2,
      type: 'string',
      valueGetter: (value, row) => {
        let v = getItemValue(row)
        if (v.supplier) {
          return v.supplier.name
        } 
        return ""
      },
    },
    { field: 'mostRecentQuoteDate',
      headerName: 'Most Recent Quote', 
      editable: false,
      flex : 1.5,
      type: 'date',
      valueGetter: (value, row) => {
        return timestampToDate(getItemValue(row).mostRecentQuoteDate);
      },
      renderCell: (params) => (
        <>
        {timestampToDateString(getItemValue(params.row).mostRecentQuoteDate)}
        </>
      )
    },
  ];

  return (
    <>
    <Box sx={{ height: 800, width: '100%' }}>
      <DataGrid
        onCellDoubleClick={(params, event) => {
          if (!event.ctrlKey) {
            event.defaultMuiPrevented = true;
          }
        }}
        rows={rows}
        getRowId={getRowId}
        columns={columns}
        editMode="row"
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: 20,
            },
          },
        }}
        pageSizeOptions={[20]}
        slotProps={{
          toolbar: { setRows },
        }}
      />
    </Box>
    <Fab color='primary' sx={{position:'absolute', bottom: 16, right: 16,}}>
      <AddIcon />
    </Fab>
    </>
  )
}
