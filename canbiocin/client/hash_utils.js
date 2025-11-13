const NUMTABS=3;
const ROWID = "rowId"
const INGREDIENTGRIDSTATE = "ingredientGridState"

export function getTabFromHash(hash) {
  if (hash.length > 1) {
    let tab = hash.substring(1, 2)
    let index = parseInt(tab)
    if (!isNaN(index) && index < NUMTABS) {
      return index;
    }
  }
  return 0;
}

function getJsonFromHash() {
  let h = window.location.hash
  let tab = getTabFromHash(h)

  // Strip off the tab portion
  let result = {};
  result.tab = tab;

  if (h.indexOf("&") >= 0) {
    var query = h.substr(h.indexOf("&")+1);

    query.split("&").forEach(function(part) {
      var item = part.split("=");
      result[item[0]] = decodeURIComponent(item[1]);
    });
  }

  return result;
}

function getHashFromJson(json) {
  let h = [`#${json.tab}`];
  Object.entries(json).forEach(([key, value]) => {
    let v = encodeURIComponent(value)
    h.push(`${key}=${v}`)
  });
  return h.join('&')
}

export function setRowId(navigate, rowId) {
    let h = window.location.hash

    let json = getJsonFromHash()

    json[ROWID] = rowId

    let newH = getHashFromJson(json)
    if (h != newH) {
      navigate({hash: getHashFromJson(json)}, { replace: true })
    }
}

export function getRowIdFromHash() {
    let json = getJsonFromHash()
  
    if (ROWID in json) {
      return json[ROWID]
    }
    return ""
}

export function setIngredientsGridState(state) {
    if (localStorage) {
      const serializedState = JSON.stringify(state, (key, value) => 
        typeof value === 'bigint' ? value.toString() : value)
      localStorage.setItem(INGREDIENTGRIDSTATE, serializedState)
    } else {
      console.log("localStorage not available")
    }
}

export function getIngredientsGridState() {
    if (localStorage) {
      console.log("getting")
      const state = localStorage.getItem(INGREDIENTGRIDSTATE)
      return (state ? JSON.parse(state) : {});
    } else {
      console.log("localStorage not available")
    }
    return null
}

export function clearIngredientsGridState() {
    localStorage.removeItem(INGREDIENTGRIDSTATE)
}
