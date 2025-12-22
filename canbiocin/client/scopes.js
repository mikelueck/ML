export const scopes = {
  READ_RECIPE : "read:recipes",
  WRITE_RECIPE : "write:recipes",
  SAVE_RECIPE : "save:recipes",
  DEL_RECIPE : "delete:recipes",
  READ_INGREDIENT : "read:ingredients",
  WRITE_INGREDIENT : "write:ingredients",
  DEL_INGREDIENT : "delete:ingredients",
  READ_OTHER : "read:other",
  WRITE_OTHER : "write:other",
  DEL_OTHER : "delete:other",
}

var funcToScope = new Map()
funcToScope.set("listIngredients", scopes.READ_INGREDIENT)
funcToScope.set("getIngredient", scopes.READ_INGREDIENT)
funcToScope.set("createIngredient", scopes.WRITE_INGREDIENT)
funcToScope.set("updateIngredient", scopes.WRITE_INGREDIENT)
funcToScope.set("deleteIngredient", scopes.DEL_INGREDIENT)

funcToScope.set("listProbioticSpp", scopes.READ_INGREDIENT)
funcToScope.set("listPrebioticCategory", scopes.READ_INGREDIENT)

funcToScope.set("listRecipes", scopes.READ_RECIPE)
funcToScope.set("getRecipe", scopes.READ_RECIPE)
funcToScope.set("deleteRecipe", scopes.DEL_RECIPE)
funcToScope.set("updateRecipe", scopes.WRITE_RECIPE)
funcToScope.set("createRecipe", scopes.WRITE_RECIPE)

funcToScope.set("listSavedRecipes", scopes.READ_RECIPE)
funcToScope.set("getSavedRecipe", scopes.READ_RECIPE)
funcToScope.set("createSavedRecipe", scopes.SAVE_RECIPE)
funcToScope.set("updateSavedRecipe", scopes.SAVE_RECIPE)
funcToScope.set("deleteSavedRecipe", scopes.SAVE_RECIPE)
funcToScope.set("calculateRecipe", scopes.SAVE_RECIPE)

funcToScope.set("listContainers", scopes.READ_OTHER)
funcToScope.set("listPackaging", scopes.READ_OTHER)
funcToScope.set("listShipping", scopes.READ_OTHER)
funcToScope.set("updateContainer", scopes.WRITE_OTHER)
funcToScope.set("updatePackaging", scopes.WRITE_OTHER)
funcToScope.set("updateShipping", scopes.WRITE_OTHER)
funcToScope.set("createContainer", scopes.WRITE_OTHER)
funcToScope.set("createPackaging", scopes.WRITE_OTHER)
funcToScope.set("createShipping", scopes.WRITE_OTHER)
funcToScope.set("deleteContainer", scopes.DEL_OTHER)
funcToScope.set("deletePackaging", scopes.DEL_OTHER)
funcToScope.set("deleteShipping", scopes.DEL_OTHER)

funcToScope.set("listAllPackaging", scopes.READ_OTHER)


export function scopeForMethod(f) {
  if (funcToScope.has(f)) {
    return funcToScope.get(f)
  }
  return ""
}

export function allScopes() {
  let allScopes = new Map();

  for (const key of funcToScope.keys()) {
    allScopes.set(funcToScope.get(key))
  }
  return Array.from(allScopes.keys()).join(" ")
}
