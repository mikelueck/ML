const React = require('React');
import { useNavigate } from 'react-router';
import { timestampToDate } from './timestamp.js';
import { timestampToDateString } from './timestamp.js';
import { moneyToString, moneyToFloat, floatToMoney } from './money.js';

import { Box, Tooltip } from '@mui/material';

import { OptionDialog } from './Dialog';
import { Grid, handleItemClick } from './Grid';

import { Link } from 'react-router';

import { useGrpc } from './GrpcContext';
import { scopes } from './scopes.js';

import { PACKAGINGGRIDSTATE } from './hash_utils.js';

function getItemValue(row) {
  switch (getItemCase(row)) {
    case "container":
      return row.item.value.packaging
    case "packaging":
      return row.item.value
    case "shipping":
      return row.item.value.packaging
    default:
      return row.item.value
  }
}

function getItemCase(row) {
  return row.item.case
}

function getRowId(row) {
  return row.item.value.id
}

export default function () {
  const [isLoading, setIsLoading] = React.useState(true)
  const [rows, setRows] = React.useState([]);
  const { grpcRequest } = useGrpc();

  const navigate = useNavigate();

  const columns = [
    { field: 'id',
      headerName: 'ID', 
      editable: false,
      flex : 1,
      valueGetter: (value, row) => {
        return getRowId(row);
      },
    },
    { field: 'name',
      headerName: 'Name', 
      editable: false,
      sortable:true,
      type: 'string',
      flex : 3,
      valueGetter: (value, row) => {
        return getItemValue(row).name
      },
      renderCell: (params) => (
        <Link to={{
          pathname: "/packaging",
          search: `?type=${getItemCase(params.row)}&packagingId=${getItemValue(params.row).id}`, 
        }}
        onClick={handleItemClick(navigate, getItemValue(params.row).id)}>
        {getItemValue(params.row).name}
        </Link>
      ),
    },
    { field: 'type',
      headerName: 'Type', 
      editable: false,
      sortable:true,
      type: 'string',
      flex : 1.5,
      valueGetter: (value, row) => {
        let type = getItemCase(row)
        return type.charAt(0).toUpperCase() + type.slice(1);
      },
    },
    { field: 'unitsPackage', 
      headerName: 'Units / Package', 
      editable: false,
      flex : 1.5,
      type: 'number',
      valueGetter: (value, row) => {
        return getItemValue(row).unitsPackage
      },
    },
    { field: 'total_cost', 
      headerName: 'Total Cost', 
      editable: false,
      flex : 1.5,
      type: 'number',
      valueGetter: (value, row) => {
        return moneyToFloat(getItemValue(row).totalCost)
      },
      renderCell: (params) => (
        <>
        {moneyToString(getItemValue(params.row).totalCost, 2) }
        </>
      )
    },
    { field: 'unit_cost', 
      headerName: 'Unit Cost', 
      editable: false,
      flex : 1.5,
      type: 'number',
      valueGetter: (value, row) => {
        return moneyToFloat(getItemValue(row).totalCost) / getItemValue(row).unitsPackage
      },
      renderCell: (params) => (
        <>
        {moneyToString(floatToMoney(moneyToFloat(getItemValue(params.row).totalCost) / getItemValue(params.row).unitsPackage), 2) }
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

  React.useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await grpcRequest("listAllPackaging", {});
        setRows(response.packaging);
      } catch (error) {
        //setError(error);
        console.log(error);
      } finally {
        setIsLoading(false)
      }
    };
    fetchData();
  }, []);

  const onClickAdd = () => {
    setOpenAdd(true)
  }

  const [openAdd, setOpenAdd] = React.useState(false)
  const [addType, setAddType] = React.useState("")

  const CloseAdd = () => {
    setOpenAdd(false)
  }

  const TypeSelect = (packagingType) => {
    setAddType(packagingType)
  }

  const DoAdd = () => {
    setOpenAdd(false)
    navigate(`/packaging?add=true&type=${addType}`);
  }

  return (
    <>
    <Box sx={{ width: '100%', height: '90vh' }}>
      <Grid
        gridStateName={PACKAGINGGRIDSTATE}
        columns={columns}
        rows={rows}
        addScope={scopes.WRITE_OTHER}
        onClickAdd={onClickAdd}
        getRowId={getRowId} />
    </Box>
    <OptionDialog
      title="What type of packaging?"
      content="Please select the type of packaging you'd like to add."
      options={[
        {label: "Container", id:"container"},
        {label: "Packaging", id:"packaging"},
        {label: "Shipping", id:"Shipping"},
        ]}
      open={openAdd}
      onClose={CloseAdd}
      onSelect={TypeSelect}
      onConfirm={DoAdd}
    />
    </>
  )
}
