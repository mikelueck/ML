const React = require('React');
import { useNavigate } from 'react-router';
import { timestampToDate } from './timestamp.js';
import { timestampToDateString } from './timestamp.js';
import { moneyToString } from './money.js';

import { Box, Tooltip } from '@mui/material';

import { OptionDialog } from './Dialog';
import { Grid, handleItemClick } from './Grid';

import { Link } from 'react-router';

import { useGrpc } from './GrpcContext';
import { scopes } from './scopes.js';

import { INGREDIENTGRIDSTATE } from './hash_utils.js';

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
        onClick={handleItemClick(navigate, getItemValue(params.row).id)}>
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
      <Grid
        gridStateName={INGREDIENTGRIDSTATE}
        columns={columns}
        rows={rows}
        addScope={scopes.WRITE_INGREDIENT}
        onClickAdd={onClickAdd}
        getRowId={getRowId} />
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
    </>
  )
}
