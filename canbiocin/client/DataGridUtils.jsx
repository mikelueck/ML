const React = require('React');

import { Typography } from '@mui/material';
import { moneyToString } from './money.js';

import { DataGrid } from '@mui/x-data-grid';

function NestedDataGrid({ data }) {
  if (!data) {
    return ""
  }

  return (<DataGrid
    rows={data.rows}
    columns={data.columns}
    slots={{
      columnHeaders: () => null,
    }}
    sx={{
      '.MuiDataGrid-filler': {
        display: 'none',
      },
      '.MuiDataGrid-virtualScroller::-webkit-scrollbar': {
        display: 'none',
      },
      '&.MuiDataGrid-root': {
        border: 'none', // Removes the outer border of the DataGrid
        overflowX: 'hidden',
      },
      '.MuiDataGrid-cell': {
        borderBottom: 'none', // Removes borders between cells (horizontal)
        fontWeight: 'lighter',
        padding: '2px',
      },
      '.MuiDataGrid-columnHeaders': {
        borderBottom: 'none', // Removes border below column headers
      },
      '.MuiDataGrid-footerContainer': {
        borderTop: 'none', // Removes border above the footer
      },
    }}
    getRowHeight={() => 'auto'}
    hideFooter
    disableColumnMenu
    disableColumnSorting
    autosizeOnMount
  />)
}

export function IngredientCellRender({params, itemGetter}) {

    let item = null
    let value = null
    if (itemGetter) {
      item = itemGetter(params.row)
      value = item.value
    } else if (params.row && params.row.item) {
      item = params.row.item
      value = params.row.item.value
    }

    let name = ""
    let data = null

    if (item.case == "probiotic") {
      let cols = [{
        field: "stockBCfuG",
        headerName:"stock",
      },
      {
        field: "costKg",
        headerName:"cost",
      }]

      name = value.strain
      data = {columns: cols,
              rows: [
                {id: 1,
                stockBCfuG: value.stockBCfuG + " B CFU/g", 
                costKg: value.costKg ? moneyToString(value.costKg, 2) + " / kg" : ""
              }]}
    } else if (item.case == "prebiotic" || item.case == "postbiotic") {
      let cols = [{
        field: "function",
        headerName:"function",
      },
      {
        field: "costKg",
        headerName:"cost",
      }]

      name = value.name
      data = {columns: cols,
              rows: [
                {id: 1,
                function: value.function ?  value.function : "",
                costKg: value.costKg ? moneyToString(value.costKg, 2) + " / kg" : "",
              }]}
                  
    } else if (item.case == "packaging") {
      let cols = [{
        field: 'cbCostPerContainer', 
        headerName:"cost",
      },]
// Figure this out
// sometimes we get the columns from the item other times we get it from the row

      name = value.name
      let cpc = null 
      if (value.cbCostPerContainer) {
        cpc = value.cbCostPerContainer
      } else if (params.row.cbCostPerContainer) {
        cpc = params.row.cbCostPerContainer
      }
      
      data = {columns: cols,
              rows: [
                {id: 1,
                cbCostPerContainer: cpc ? moneyToString(cpc, 2) + " / container" : "",
              }]}
    } else {
      name = value.name
    }

    return (
    <div>
      <Typography fontWeight="bold" variant="body1" component="span">
      {name}
      </Typography>
      <br />
      <NestedDataGrid data={data} />
    </div>
    )
}
