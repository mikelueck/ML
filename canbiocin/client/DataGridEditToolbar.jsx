const React = require('React');

import { ToolbarButton } from '@mui/material';
import { GridToolbarContainer } from '@mui/x-data-grid';
import { Button } from '@mui/material';
import Tooltip from '@mui/material/Tooltip';

import { GridRowModes } from '@mui/x-data-grid';
import { Typography } from '@mui/material';

import AddIcon from '@mui/icons-material/Add';

export function EditToolbar(props) {
  const { label, fieldToFocus, newRowFn, setRows, setRowModesModel, editable } = props;

  const handleClick = () => {
    
    let newRow = newRowFn();

    setRows((oldRows) => {
      return [
        ...oldRows, 
        newRow,
      ]
    });

    let id = ""

    if (newRow.id) {
      id = newRow.id
    } else if (newRow.item && newRow.item.value) {
      id = newRow.item.value.id
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


