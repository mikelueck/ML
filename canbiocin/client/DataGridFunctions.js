export function cancelDataGridEdit(apiRef, rowModesModel) {
  for (const id in rowModesModel) {
    apiRef.current.stopRowEditMode({ id: id, ignoreModifications: true });
  }
}

