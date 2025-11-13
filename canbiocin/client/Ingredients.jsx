const React = require('React');
import { useNavigate } from 'react-router';
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

import { OptionDialog } from './Dialog';

import { Link } from 'react-router';

import { useGrpc } from './GrpcContext';
import { scopes } from './scopes.js';

import { getRowIdFromHash, 
         setRowId, 
         getIngredientsGridState, 
         setIngredientsGridState } from './hash_utils.js';

import { DataGrid,
         useGridApiRef,
         GridRowModes,
         GridActionsCellItem,
         GridRowEditStopReasons,
         gridVisibleColumnDefinitionsSelector,
         gridExpandedSortedRowIdsSelector,
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

export default function () {
  const [initialState, setInitialState] = React.useState(true)
  const [isLoading, setIsLoading] = React.useState(true)
  const [rows, setRows] = React.useState([]);
  const { grpcRequest, hasScope } = useGrpc();

  const apiRef = useGridApiRef();

  const [selectionModel, setSelectionModel] = React.useState([])
  const [paginationModel, setPaginationModel] = React.useState({
    pageSize: 0,
    page: 0,
  })

  const navigate = useNavigate();

  const handleRowEditStop = (params, event) => {
    if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      event.defaultMuiPrevented = true;
    }
  };

  const findPageForId = (rowId, pageSize) => {
    const rowIndex = gridExpandedSortedRowIdsSelector(apiRef).findIndex(
      (id) => id === rowId,
    );
    if (rowIndex < 0) {
      return 0
    }
    return Math.floor(rowIndex / pageSize)
  }

  // This method is here to try and keep the selected row on the screen.
  // We initialize with page size = 0 so immediately Datagrid will 
  // recompute that because of 'autoPageSize'.
  // When someone resizes the window the page size changes and we readjust
  // What I have found is that it is important to not mess with pages
  // in this function directly or events fire on top of each other.
  // Instead we setTimeout to do the page change once this event has finished.
  const setPaginationModelAndMaybeChangePages = (m) => {
    if (paginationModel.pageSize == 0) {
      let rowId = getRowIdFromHash()
      if (rowId) {
        const timer = setTimeout(() => {
          let page = findPageForId(rowId, m.pageSize)
          apiRef.current.setPage(page)
          apiRef.current.selectRow(rowId, true)
        }, 200); // Adjust delay as needed
      }
    } else {
      if (m.pageSize == paginationModel.pageSize) {
        // we are just moving pages...let it happen
      } else {
        if (selectionModel.length > 0) {
          // Make sure the selected item is on the current page
          let page = findPageForId(selectionModel[0], m.pageSize)
          if (page != m.page) {
            const timer = setTimeout(() => {
              apiRef.current.setPage(page)
            })
          }
        }
      }
    }
    setPaginationModel(m)
  }


  React.useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await grpcRequest("listIngredients", {});
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

  const handleSelectionModelChange = (newSelectionModel) => {
    setSelectionModel(newSelectionModel)

    // Just single select
    if (newSelectionModel.length > 0) {
      const rowId = newSelectionModel[0]
      const rowIndex = gridExpandedSortedRowIdsSelector(apiRef).findIndex(
        (id) => id === rowId
      );

      const colIndex = 0

      setRowId(navigate, rowId)
    }
  };

  const handleIngredientClick = (ingredientId) => (params) => {
    setRowId(navigate, ingredientId)
    params.stopPropagation()
  }

  const saveState = React.useCallback(() => {
    if (apiRef?.current?.exportState && localStorage) {
      const currentState = apiRef.current.exportState();
      setIngredientsGridState(currentState)
    }
  }, [apiRef])

  React.useLayoutEffect(() => {
    console.log("useLayoutEffect")
    const state = getIngredientsGridState()
    apiRef.current.restoreState(state)

    // handle refresh and navigating away/refreshing
    window.addEventListener('beforeunload', saveState);

    return () => {
      // in case of an SPA remove the event-listener
      window.removeEventListener('beforeunload', saveState);
      saveState();
    };
  }, [apiRef, saveState]);

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
      editable: false,
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
        }}
        onClick={handleIngredientClick(getItemValue(params.row).id)}>
        {getItemValue(params.row).strain ? getItemValue(params.row).strain : getItemValue(params.row).name}
        </Link>
      ),
    },
    { field: 'stockBCfuG', 
      headerName: 'Stock B CFU/g', 
      editable: false,
      flex : 1.5,
      type: 'number',
      valueGetter: (value, row) => {
        return getItemValue(row).stockBCfuG;
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

  const onClickAdd = () => {
    setOpenAdd(true)
  }

  const [openAdd, setOpenAdd] = React.useState(false)
  const [addType, setAddType] = React.useState("")

  const CloseAdd = () => {
    setOpenAdd(false)
  }

  const TypeSelect = (ingredientType) => {
    setAddType(ingredientType)
  }

  const DoAdd = () => {
    setOpenAdd(false)
    navigate(`/ingredient?add=true&type=${addType}`);
  }

  return (
    <>
    <Box sx={{ width: '100%', height: '90vh' }}>
      <DataGrid
        autoPageSize
        apiRef={apiRef}
        onRowSelectionModelChange={handleSelectionModelChange}
        selectionModel={selectionModel}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModelAndMaybeChangePages}
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
          ...initialState,
        }}
        loading={isLoading}
        slotProps={{
          toolbar: { setRows },
        }}
      />
    </Box>
    <OptionDialog
      title="What type of ingredient?"
      content="Please select the type of ingredient you'd like to add."
      options={[
        {label: "Prebiotic", id:"prebiotic"},
        {label: "Probiotic", id:"probiotic"},
        {label: "Postbiotic", id:"postbiotic"},
        ]}
      open={openAdd}
      onClose={CloseAdd}
      onSelect={TypeSelect}
      onConfirm={DoAdd}
    />
    {hasScope(scopes.WRITE_INGREDIENT) ?
      <Fab 
        color='primary' 
        sx={{position:'absolute', bottom: 16, right: 16,}}
        onClick={onClickAdd}>
        <AddIcon />
      </Fab> : "" }
    </>
  )
}
