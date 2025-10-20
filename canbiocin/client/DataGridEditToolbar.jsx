const React = require('React');

import { ToolbarButton } from '@mui/material';
import { GridToolbarContainer } from '@mui/x-data-grid';
import { Button } from '@mui/material';
import Tooltip from '@mui/material/Tooltip';

import { GridRowModes } from '@mui/x-data-grid';
import { Typography } from '@mui/material';

import AddIcon from '@mui/icons-material/Add';

export function EditToolbar(props) {
  const { label, fieldToFocus, newRowFn, setIngredients, setRowModesModel, editable } = props;

  const handleClick = () => {
    
    let newIngredient = newRowFn();

    setIngredients((oldRows) => {
      return [
        ...oldRows, 
        newIngredient,
      ]
    });

    let id = ""

    if (newIngredient.id) {
      id = newIngredient.id
    } else if (newIngredient.item && newIngredient.item.value) {
      id = newIngredient.item.value.id
    }

    setRowModesModel((oldModel) => ({
      ...oldModel,
      [id]: { mode: GridRowModes.Edit, fieldToFocus: fieldToFocus },
    }));
  };

  if (!editable) {
    return null
  }

  return (
    <GridToolbarContainer >
        <Button
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleClick}
          style={{ float: 'right' }}
        >
          {label ? label : "Add Ingredient"}
        </Button>
    </GridToolbarContainer>
  );
}


