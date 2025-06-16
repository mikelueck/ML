const React = require('React');

import { ToolbarButton } from '@mui/material';
import { GridToolbarContainer } from '@mui/x-data-grid';
import { Button } from '@mui/material';
import Tooltip from '@mui/material/Tooltip';

import { GridRowModes } from '@mui/x-data-grid';
import { Typography } from '@mui/material';

import AddIcon from '@mui/icons-material/Add';

export function EditToolbar(props) {
  const { setIngredients, setRowModesModel, editable } = props;

  const handleClick = () => {
    /*
    const id = "1234"
    setIngredients((oldRows) => [
      ...oldRows,
      { id, name: '', age: '', role: '', isNew: true },
    ]);
    setRowModesModel((oldModel) => ({
      ...oldModel,
      [id]: { mode: GridRowModes.Edit, fieldToFocus: 'name' },
    }));
    */
  };

  const foo = () => {
  }

  if (!editable) {
    return null
  }

  return (
    <GridToolbarContainer >
        <Button
          color="inherit"
          onClick={handleClick()}
          style={{ float: 'right' }}
        >
          <AddIcon fontSize="small" /> Add Ingredient
        </Button>
    </GridToolbarContainer>
  );
}


