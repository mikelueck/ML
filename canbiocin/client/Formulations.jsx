const React = require('React');
import { useNavigate } from 'react-router';
import { timestampToDate } from './timestamp.js';
import { moneyToString } from './money.js';

import { Box, Tooltip } from '@mui/material';

import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import Fab from '@mui/material/Fab';

import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Close';

import { Link } from 'react-router';

import { FormulationDialog } from './Formulation';

import { useGrpc } from './GrpcContext';
import { scopes } from './scopes.js';

import { DataGrid,
         GridRowModes,
         GridRowEditStopReasons,
         Toolbar,
         TollbarButton, 
} from '@mui/x-data-grid';

function getIngredientName(ingredient) {
  if (ingredient) {
      return ingredient.item.value.strain ? ingredient.item.value.strain : ingredient.item.value.name;
  }
  return ""
}

function IngredientFilterSelect({changeFilterValue, ingredientFilter}) {
  const [isLoading, setIsLoading] = React.useState(false)
  const [ingredients, setIngredients] = React.useState([]);
  const [value, setValue] = React.useState(ingredientFilter);
  const { grpcRequest, hasScope } = useGrpc();

  const handleFilterChange = (event, newValue) => {
    let value = ""
    if (newValue) {
      value = newValue.item.value.id;
    }
    changeFilterValue(value)
    setValue(newValue)
  }

  React.useEffect(() => {
    const fetchIngredients = async () => {
      setIsLoading(true);
      try {
        const response = await grpcRequest("listIngredients", {});
        response.ingredients.sort((a, b) => {
          if (a && b) {
            let compare = -b.item.case.localeCompare(a.item.case)
            if (compare == 0) {
              let aName = getIngredientName(a)
              let bName = getIngredientName(b)
              return -bName.localeCompare(aName)
      
            }
            return compare
          }
          return 0
        })
        setIngredients(response.ingredients)
      } catch (error) {
        console.log(error);
      } finally {
      setIsLoading(false);
      }
    };
    fetchIngredients();
  }, []);

  const getFilterItems = (ingredients, content = []) => {
    if (!ingredients.length) return content;

    ingredients.map((ingredient) => content.push(<MenuItem value={ingredient.item.value.id}>{ingredient.item.value.strain ? ingredient.item.value.strain : ingredient.item.value.name}</MenuItem>))
    return content;
  }
  
  const getIngredientLabel = (ingredient) => {
    getIngredientName(ingredient)
  }

  const filteredIngredients = (ingredients, state) => {
    let matchedIngredients = [];
    ingredients.map((ingredient) => {
      let name = getIngredientName(ingredient).toLowerCase()
      if (ingredient && name.includes(state.inputValue.toLowerCase())) {
        matchedIngredients.push(ingredient);
      }
    })
    return matchedIngredients;
  }

  const groupBy = (option) => {
    if (option) {
      return option.item.case.toUpperCase();
    }
    return ""
  }
  if (!hasScope(scopes.READ_INGREDIENT)) {
    return ""
  }

  return (
    <>
    <Autocomplete
      componentsProps={{ popper: { style: { width: 'fit-content' } } }}
      sx={{ width: 300 }}
      id="recipe-filter-select"
      options={ingredients}
      value={value}
      getOptionLabel={getIngredientName}
      renderInput={(params) => <TextField {...params} label="Ingredient Filter" variant="outlined" />}
      onChange={handleFilterChange}
      selectOnFocus
      clearOnBlur
      filterOptions={filteredIngredients}
      groupBy={groupBy}
      size='small'
    />
    </>
  )
}

export default function () {
  const [isLoading, setIsLoading] = React.useState(true)
  const [rows, setRows] = React.useState([]);
  const [ingredientFilter, setIngredientFilter] = React.useState("");
  const { grpcRequest, hasScope } = useGrpc();

  const handleFilterChange = (value) => {
    setIngredientFilter(value)
  }
    
  const navigate = useNavigate();
    
  const onClickAdd = () => {
    navigate(`/recipe?add=true`);
  }

  React.useEffect(() => {
    const fetchRecipes = async () => {
      setIsLoading(true);
      try {
        const response = await grpcRequest("listRecipes", {ingredientId: ingredientFilter });
        setRows(response.recipes);
      } catch (error) {
        //setError(error);
        console.log(error);
      } finally {
        setIsLoading(false)
      }
    };
    fetchRecipes();
  }, [ingredientFilter]);

  const columns = [
    { field: 'id',
      headerName: 'ID', 
      editable: false,
      flex: 4,
      type: 'string',
    },
    { field: 'name',
      headerName: 'Name', 
      sortable:true,
      flex: 8,
      type: 'string',
      valueGetter: (value, row) => {
        return row.name
      },
      renderCell: (params) => (
        <Link to={{
          pathname: "/recipe",
          search: `?recipeId=${params.row.id}`, 
        }}>
        {params.row.name}
        </Link>
      ),
    },
  ];

  return (
    <>
    <Box sx={{ m:1 }}>
      <IngredientFilterSelect
        changeFilterValue={handleFilterChange}
        ingredientFilter={ingredientFilter} />
    </Box>
    <Box sx={{ height: 800, width: '100%' }}>
      <DataGrid
        onCellDoubleClick={(params, event) => {
          if (!event.ctrlKey) {
            event.defaultMuiPrevented = true;
          }
        }}
        rows={rows}
        columns={columns}
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: 20,
            },
          },
        }}
        pageSizeOptions={[20]}
      />
    </Box>
    {hasScope(scopes.WRITE_RECIPE) ?
      <Fab 
        color='primary' 
        sx={{position:'absolute', bottom: 16, right: 16,}}
        onClick={onClickAdd}>
        <AddIcon />
      </Fab> : "" }
    </>
  )
}
