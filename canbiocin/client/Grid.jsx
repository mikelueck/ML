const React = require('React');
import { useNavigate } from 'react-router';

import { Box } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import Fab from '@mui/material/Fab';

import { useGrpc } from './GrpcContext';

import { getRowIdFromHash, 
         setRowId, 
         getGridState, 
         setGridState } from './hash_utils.js';

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


export function handleItemClick(navigate, rowId) {
  return (params) => {
    setRowId(navigate, rowId)
    params.stopPropagation()
  }
}

export function Grid({gridStateName, columns, rows, addScope, onClickAdd, getRowId}) {
  const [initialState, setInitialState] = React.useState({})
  const [isLoading, setIsLoading] = React.useState(true)
  const { hasScope } = useGrpc();

  const apiRef = useGridApiRef();

  const [selectionModel, setSelectionModel] = React.useState([])
  const [paginationModel, setPaginationModel] = React.useState({
    pageSize: 0,
    page: 0,
  })

  const navigate = useNavigate();

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

  const saveState = React.useCallback(() => {
    if (apiRef?.current?.exportState && localStorage) {
      const currentState = apiRef.current.exportState();
      setGridState(gridStateName, currentState)
    }
  }, [apiRef])

  React.useLayoutEffect(() => {
    const state = getGridState(gridStateName)
    apiRef.current.restoreState(state)

    // handle refresh and navigating away/refreshing
    window.addEventListener('beforeunload', saveState);

    return () => {
      // in case of an SPA remove the event-listener
      window.removeEventListener('beforeunload', saveState);
      saveState();
    };
  }, [apiRef, saveState]);

  return (
    <>
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
    />
    {onClickAdd && hasScope(addScope) ?
      <Fab 
        color='primary' 
        sx={{position:'absolute', bottom: 75, right: 16,}}
        onClick={onClickAdd}>
        <AddIcon />
      </Fab> : "" }
    </>
  )
}
