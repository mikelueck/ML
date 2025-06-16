const React = require('React');

import { ToolbarButton } from '@mui/material';
import { GridToolbarContainer } from '@mui/x-data-grid';
import { Button } from '@mui/material';
import Tooltip from '@mui/material/Tooltip';

import { GridRowModes } from '@mui/x-data-grid';
import { Typography } from '@mui/material';

import AddIcon from '@mui/icons-material/Add';

export function EditToolbar(props) {
  const { newRowFn, setIngredients, setRowModesModel, editable } = props;

  const handleClick = () => {
    
    let newIngredient = newRowFn();

    setIngredients((oldRows) => {
      return [
        ...oldRows, 
        newIngredient,
      ]
    });

    setRowModesModel((oldModel) => ({
      ...oldModel,
      [newIngredient.item.value.id]: { mode: GridRowModes.Edit, fieldToFocus: 'editNameField' },
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
          Add Ingredient
        </Button>
    </GridToolbarContainer>
  );
}


