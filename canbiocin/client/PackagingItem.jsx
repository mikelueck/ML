const React = require('React');

import { Link, useNavigate, useSearchParams } from 'react-router';
import { NewFormItem, PropsProvider, DROPDOWN, DATEPICKER } from './FormItem';
import { EditToolbar } from './DataGridEditToolbar';
import { ConfirmDialog } from './Dialog';
import { AlertDialog } from './Dialog';
import { SppDropdown } from './Dropdowns';
import { CategoryDropdown } from './Dropdowns';
import { emptyPackaging } from './utils.js';
import { emptyShippingOption } from './utils.js';
import { cancelDataGridEdit } from './DataGridFunctions.js';

import { useGrpc } from './GrpcContext';
import { scopes } from './scopes.js';

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

import { DataGrid,
         useGridApiRef,
         GridRowModes,
         GridActionsCellItem,
         GridEditInputCell,
         GridRowEditStopReasons,
} from '@mui/x-data-grid';


import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import CancelIcon from '@mui/icons-material/Cancel';

const validateNumber = (params) => {
  const hasError = params.props.value <= 0;
  let msg = ""
  if (hasError) {
    msg = "Must be greater than 0"
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

function getItemPackagingValue(packaging) {
  switch (getItemCase(packaging)) {
    case "container":
      return getContainer(packaging).packaging
    case "packaging":
      return packaging.item.value
    case "shipping":
      return packaging.item.value.packaging
    default:
      return packaging.item.value
  }
}

function getItemValue(packaging) {
  return packaging.item.value
}

function getContainer(packaging) {
  if (packaging && getItemCase(packaging) == "container") {
    return packaging.item.value
  }
  return null
}

function getItemCase(p) {
  return p.item.case
}

const commonFields = {  
  "id": true,
  "name": true,
  "totalCost": true,
  "unitsPackage": true,
  // TODO "supplier" : true,
  "mostRecentQuoteDate": true,
  "notes": true,
}

const fieldsByType = {
  "packaging": {...commonFields},
  "container": {...commonFields, "sizeG": true},
  "shipping": {...commonFields},
}

function ShippingOptions({newRowFn, editable, shippingOptions, shippingOptionsById, apiRef, setShippingOptions, rowModesModel, setRowModesModel, onRowModesModelChange, onRowEditStop, processRowUpdate, fieldToFocus }) {
  let optionsNames = []

  for (let i of shippingOptionsById.values()) {
    optionsNames.push(i.packaging.name)
  }

  const columnDef = [
    { field: 'name',
      headerName: 'Name', 
      editable: editable, 
      sortable:true,
      valueGetter: (value, row) => {
        if (shippingOptionsById.has(row.shippingId)) {
          return shippingOptionsById.get(row.shippingId).packaging.name
        }
        return "<unknown>"
      },
      valueOptions: optionsNames,
      type: "singleSelect",
      flex: 4,
      renderHeader: () => (
        <strong>{'Name'}</strong>
      ),
    },
    { field: 'numContainers',
      headerName: 'Count', 
      editable: editable, 
      sortable:true,
      valueGetter: (value, row) => {
        return row.numContainers
      },
      type: "number",
      flex: 1,
      preProcessEditCellProps: validateNumber,
      renderEditCell: renderEditCell,
      renderHeader: () => (
        <strong>{'Count'}</strong>
      ),
    },
  ]

  const handleRowCancelClick = (id) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View, ignoreModifications: true } });
  }

  const handleRowEditClick = (id) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
  }    

  const handleRowDeleteClick = (id) => () => {
    for (let i = 0; i < shippingOptions.length; i++) {
      if (shippingOptions[i].shippingId == id) {
        let clone = structuredClone(shippingOptions)
        clone.splice(i, 1)
        setShippingOptions(clone)
        return
      }  
    }  
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

    
  const onProcessRowUpdateError = (e) => {
    alert("ProcessRowUpdateError fixme")
    console.log(e)
  };  
    
  const getRowId = (row) => {
    return row.shippingId
  }
    
  return ( 
    <Box sx={{ width: '100%' }}>
    <Typography variant="h5" align="left">
      Shipping Options
    </Typography>
    <div style={{ display: 'flex', flexDirection: 'column' }}>
    <DataGrid
      apiRef={apiRef}
      rows={shippingOptions}
      getRowId={getRowId}
      columns={columnDef.concat(editable ? actionColumns(true) : [])}
      editMode="row"
      rowModesModel={rowModesModel}
      onRowModesModelChange={onRowModesModelChange}
      onRowEditStop={onRowEditStop}
      processRowUpdate={processRowUpdate}
      onProcessRowUpdateError={onProcessRowUpdateError}
      slots={{ toolbar: EditToolbar }}
      slotProps={{
        toolbar: { label: "Add Shipping Option",
                   fieldToFocus: fieldToFocus,
                   newRowFn: newRowFn,
                   setRows: setShippingOptions,
                   setRowModesModel: setRowModesModel,
                   editable: editable },
      }}
      hideFooter
      showToolbar
    />
    </div>
    </Box>
  )                
}                  

function Packaging({packageType, packaging, editable, handleChange}) {
  const [isLoading, setIsLoading] = React.useState(false)
  const [errorOpen, setErrorOpen] = React.useState(false)
  const [error, setError] = React.useState("")
  const { grpcRequest, hasScope } = useGrpc();

  const handleErrorClose = () => {
    setErrorOpen(false)
  }

  const getShippingOptions = (p) => {
    if (p && getItemCase(p) == "container") {
      return getContainer(p).shippingOptions
    }
    return []
  }

  const setPackagingShippingOptions = (options) => {
    if (packaging && getItemCase(packaging) == "container") {
      getContainer(packaging).shippingOptions = options
      setShippingOptions(options)
      handleChange()
    }
  }

  const apiRef = useGridApiRef()
  const [shippingOptionsRowModesModel, setShippingOptionsRowModesModel] = React.useState({}) 
  const [allShippingOptions, setAllShippingOptions] = React.useState([]);
  const [shippingOptionsById, setShippingOptionsById] = React.useState(new Map());
  const [shippingOptions, setShippingOptions] = React.useState([])

  React.useEffect(() => {
    const cancelEdit = async () => {
      if (!editable && Object.keys(shippingOptionsRowModesModel).length) {
        cancelDataGridEdit(apiRef, shippingOptionsRowModesModel) 
      }
    } 
    cancelEdit();
  }, [editable])

  React.useEffect(() => {
    const setOptions = async () => {
      setShippingOptions(getShippingOptions(packaging))
    };
    setOptions();
  }, [packaging]);

  const handleShippingOptionsRowModesModelChange = (newRowModesModel) => {
    setShippingOptionsRowModesModel(newRowModesModel)
  }

  const handleRowEditStop = (params, event) => {
    if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      event.defaultMuiPrevent = true;
    }         
  }             

  const addNewOption = (options) => (rowsOrFn) => {
    if (typeof rowsOrFn === 'function') {
      
      let newShippingOption = rowsOrFn(options)
      setPackagingShippingOptions(newShippingOption)
    } else {
      setPackagingShippingOptions(rowsOrFn)
    }     
  }

  const processRowUpdate = (newRow) => {
    // Can probably do something better here than copying things around
    let clone = structuredClone(shippingOptions);
  
    let index = -1;
    for (let i = 0; i < clone.length; i++) {
      if (newRow.id == clone[i].id) {
        index = i
        break
      }
    } 
    
    if (index >= 0 && index < clone.length) {
      let oldShippingOptions;
    
      const rowIsNew = newRow.isNew
    
      if (newRow.shippingId && newRow.shippingId != clone[index].shippingId) {
        // They changed the type of the packaging
        let updatedShippingOption = shippingOptionsById.get(newRow.shippingId)
        if (updatedShippingOption) {
          oldPackaging = clone[index]
          newRow = newRow
        } else {
          console.log(`An shipping option was selected but we couldn't find it ${newRow.shippingId}`);
        }
      }
      clone.splice(index, 1, newRow)
      // maybe some verification here?

      // We update the updatedRecipe even if it isn't valid so that it renders correctly
      setPackagingShippingOptions(clone)
    } else {
      console.log(`Couldn't find shipping options to update for ${newRow}`)
      Promise.reject();
    }

    // Write the shipping options back to the original packaging object
    if (getItemCase(packaging) == "container") {
      getContainer(packaging).shippingOptions = clone
    } else {
      console.log("handleRowEditStop doesn't have a container")
    }
    handleChange()
   
    const updatedRow = { ...newRow, isNew: false };
    return updatedRow;
  };

  const newRowFn = () => { 
    let newOption = emptyShippingOption(); 
    newOption.isNew = true 

    // Prefill the item with the first element in the list
    // Prefill the item with the first element in the list
    for (let i = 0; i < allShippingOptions.length; i++) {
      let alreadyUsed = false
      for (let j = 0; j < getContainer(packaging).shippingOptions.length; j++) {
        if (allShippingOptions[i].id == getContainer(packaging).shippingOptions[j].id) {
          alreadyUsed = true
        }
      }
      if (!alreadyUsed) {
        newOption.shippingId = allShippingOptions[i].id
        // So that stuff in EditToolbar works properly
        newOption.id = allShippingOptions[i].id
        return newOption;
      }
    } 
        
    console.log("This container is already using all the shipping options so adding a new row doesn't make sense")
    newOption.shippingId = allShippingOptions[0].id
    // So that stuff in EditToolbar works properly
    newOption.id = allShippingOptions[0].id
      
    return newOption; 
  }     

  React.useEffect(() => {
    const fetchShipping = async () => {
      let isError = false
      setIsLoading(true);
      try {
        const response = await grpcRequest("listShipping", {});
        let shippingOptions = []
        let idMap = new Map()
        for (let i = 0; i < response.shipping.length; i++) {
          let value = response.shipping[i]

          idMap.set(value.id, value);
          shippingOptions.push(value)
        }
        // Sort each type
        shippingOptions.sort((a,b) => {
          return a.packaging.name.localeCompare(b.packaging.name)
        })

        setAllShippingOptions(shippingOptions)
        setShippingOptionsById(idMap)
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
    fetchShipping();
  }, []);

  if (packaging == null) {
    return (
        <>
        "Not Found"
        </>
    )
  }

  const MyNewFormItem = ({field, label, type, units, renderItem, extra_params = {}}) => {
      let props_provider = PropsProvider(getItemValue(packaging), editable, handleChange)
      return NewFormItem({field, label, type, units, renderItem, props_provider, extra_params});
  }

  const MyNewFormItemPackaging = ({field, label, type, units, renderItem, extra_params = {}}) => {
      let props_provider = PropsProvider(getItemPackagingValue(packaging), editable, handleChange)
      return NewFormItem({field, label, type, units, renderItem, props_provider, extra_params});
  }

  const isContainer = (getContainer(packaging) != null)
  return (
    <>
    <Grid container rowSpacing={1} columnSpacing={{ xs:1, sm: 2, md: 3 }} sx={{ p: 2 }} spacing={4}>
      {MyNewFormItemPackaging({field:'name'})}
    </Grid>
    <Grid container rowSpacing={1} columnSpacing={{ xs:1, sm: 2, md: 3 }} sx={{ p: 2 }} spacing={4}>
      {MyNewFormItemPackaging({field:'totalCost', label: 'Total Cost', type: 'money'})}
      {MyNewFormItemPackaging({field:'unitsPackage', label: 'Units / Package', type: 'number'})}
    </Grid>
    <Grid container rowSpacing={1} columnSpacing={{ xs:1, sm: 2, md: 3 }} sx={{ p: 2 }} spacing={4}>
      {MyNewFormItemPackaging({
        field: 'mostRecentQuoteDate', 
        label: 'Most Recent Quote Date',
        type:DATEPICKER,
        extra_params: {
          openTo:"day",
          slotProps:{ textField: { variant: 'standard' } },
          readOnly:!editable,
        }})}
    </Grid>
    <Grid container rowSpacing={1} columnSpacing={{ xs:1, sm: 2, md: 3 }} sx={{ p: 2 }} spacing={4}>
      {MyNewFormItemPackaging({field:'notes', extra_params:{multiline: true, rows: 4}})}
    </Grid>
    { isContainer && 
      <>
      <Grid container rowSpacing={1} columnSpacing={{ xs:1, sm: 2, md: 3 }} sx={{ p: 2 }} spacing={4}>
        <ShippingOptions
            title="Packaging"
            newRowFn={newRowFn}
            editable={editable}
            shippingOptions={shippingOptions}
            setShippingOptions={addNewOption(shippingOptions)}
            shippingOptionsById={shippingOptionsById}
            apiRef={apiRef}
            rowModesModel={shippingOptionsRowModesModel}
            setRowModesModel={setShippingOptionsRowModesModel}
            onRowModesModelChange={handleShippingOptionsRowModesModelChange}
            onRowEditStop={handleRowEditStop}
            processRowUpdate={processRowUpdate}
            fieldToFocus="name"
        />           
      </Grid> 
      <Grid container rowSpacing={1} columnSpacing={{ xs:1, sm: 2, md: 3 }} sx={{ p: 2 }} spacing={4}>
        {MyNewFormItem({field:'sizeG', label: 'Size', type: 'number', units: 'g'})}
      </Grid>
      </>
    }
    </>
  )
}

function Delete({packagingId, packagingType}) {
  if (!packagingId || packagingId.length == 0) {
    return null
  }
  const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false)
  const [isDeleting, setIsDeleting] = React.useState(false)
  const navigate = useNavigate();
  const { grpcRequest, hasScope } = useGrpc();

  const handleDeleteClick = () => {
    setDeleteConfirmOpen(true);
  };
  const handleDeleteConfirmClose = () => {
    setDeleteConfirmOpen(false);
  }

  const handleDeleteConfirm = () => {
    setIsDeleting(true); // Should trigger useEffect
  }

  React.useEffect(() => {
    const deletePackaging = async () => {
      if (isDeleting) {
        let isError = false
        try {
          const response = await grpcRequest("deletePackagingItem", {id: packagingId, type: packagingType});
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
    deletePackaging();
  }, [isDeleting, packagingId]);

  return(
        <>
        <IconButton
          edge="end"
          color="inherit"
          onClick={handleDeleteClick}
          aria-label="delete"
        >
          <DeleteIcon />
        </IconButton>
        <ConfirmDialog
          title="Delete Packaging"
          content="Are you sure you want to delete this packaging item?"
          open={deleteConfirmOpen}
          onClose={handleDeleteConfirmClose}
          onConfirm={handleDeleteConfirm} />
        </>
   )
}

export default function () {
  const [editable, setEditable] = React.useState(false);

  const [searchParams, setSearchParams] = useSearchParams();

  const [packaging, setPackaging] = React.useState(null);
  const [updatedPackaging, setUpdatedPackaging] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(true)

  const [packagingId, setPackagingId] = React.useState(searchParams.get('packagingId'))

  const [isAdd, setIsAdd] = React.useState(searchParams.get('add'))

  const { grpcRequest, hasScope } = useGrpc();

  const packagingType = searchParams.get('type').toLowerCase()
  const navigate = useNavigate();

  const handleEditClick = () => {
    let clone = structuredClone(packaging)
    setUpdatedPackaging(clone)
    setEditable(true)
  };

  const handleSaveClick = () => {
    // Make sure the object is valid
    if (Object.values(formValid.current).every(isValid => isValid)) {
      setEditable(false)
      setIsSaving(true)
    } else {
      setError("Please check that the fields have appropriate values.")
      setErrorOpen(true)
    }
  };

  const handleClose = () => {
    if (!isAdd && editable) {
      setEditable(false)
    } else {
      navigate(-1);
    }
  }

  let refObj = {}
  Object.keys(fieldsByType[packagingType]).forEach((key) => {
    let isValid = false
    if (key == "id") {
      // The id field is not editable and doesn't need validation
      isValid = true
    }
    refObj[key] = isValid
  })

  const formValid = React.useRef(refObj)

  const handlePackagingChange = (key, isValid) => {
    if (key) {
      formValid.current[key] = isValid
    }
    setUpdatedPackaging(updatedPackaging)
  }

  const [isSaving, setIsSaving] = React.useState(false)
  
  const [errorOpen, setErrorOpen] = React.useState(false)
  const [error, setError] = React.useState("")

  React.useEffect(() => {
    const updatePackaging = async () => {
      if (isSaving) {
        let isError = false
        try {
          if (isAdd) {
            const response = await grpcRequest("createPackagingItem", {packaging: updatedPackaging});
            setPackagingId(response.id)
            navigate(`/packaging?type=${packagingType}&packagingId=${response.id}`, { replace: true });
            setIsAdd(false)
          } else {
            const response = await grpcRequest("updatePackagingItem", {packaging: updatedPackaging});
          }
        } catch (e) {
          isError = true
          setError(e.message);
          console.log(e);
        } finally {
          setIsSaving(false);
          if (!isError) {
            setPackaging(updatedPackaging)
          } else {
            setErrorOpen(true);
          }
        }
        setIsSaving(false)
      }
    };
    updatePackaging();
  }, [isSaving, updatedPackaging]);

  React.useEffect(() => {
    const triggerAddEdit = async () => {
      if (isAdd && packaging) {
        // Force us into edit mode
        handleEditClick()
      }
    };
    triggerAddEdit()
  }, [packaging]);

  React.useEffect(() => {
    const fetchData = async () => {
      if (!packagingId) {
        // make empty packaging
        setPackaging(emptyPackaging(packagingType))
        return
      }
      setIsLoading(true);
      try {
        const response = await grpcRequest("getPackagingItem", {type: packagingType, id: packagingId});
        let i = response.packaging

        setPackaging(i);
      } catch (error) {
        setError(error);
        console.log(error);
      } finally {
        setIsLoading(false)
      }
    };
    fetchData();
  }, [packagingId]);


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
          onClick={handleClose}
          aria-label="close"
        >
          <CloseIcon />
        </IconButton>
        <Box sx={{ flexGrow: 1}} />
        <IconButton
          edge="end"
          color="inherit"
          onClick={editable ? handleSaveClick : handleEditClick }
          aria-label={editable ? "save" : "edit"}
        >
          {editable ? <SaveIcon /> : <EditIcon />}
        </IconButton>
        <Delete packagingId={packagingId} packagingType={packagingType} />
        <AlertDialog
          title="Error"
          content={error}
          open={errorOpen}
          onClose={handleErrorClose} />

      </Toolbar>
    </AppBar>
    <Packaging packagingType={packagingType} packaging={editable ? updatedPackaging : packaging} editable={editable} handleChange={handlePackagingChange} />
    </>
  )
}
