const { create } = require('@bufbuild/protobuf')
const recipe_pb = require('../proto/recipe_pb.js');
const probiotic_pb = require('../proto/probiotics_pb.js');
const prebiotic_pb = require('../proto/prebiotics_pb.js');
const postbiotic_pb = require('../proto/postbiotics_pb.js');
const other_pb = require('../proto/other_pb.js');
const supplier_pb = require('../proto/supplier_pb.js');
const money_pb = require('../proto/money_pb.js');
import { timestampToDate } from './timestamp.js';
import { dateToTimestamp } from './timestamp.js';
import { floatToMoney } from './money.js';

export const valueToPrecision = (n, p, suffix, prefix) => {
    if (n == null) {
      return '';
    }
    let output = [];
    if (prefix) {
      output.push(prefix)
    }
    output.push(n.toFixed(p))
    if (suffix) {
      output.push(suffix)
    }
    return output.join('')
}

export const getNameForIngredient = (i) => {
  if (!i) {
    return null
  }  

  let type = i.item.case

  switch (type) {
    case 'probiotic':
      return i.item.value.strain
      break;
    case 'prebiotic':
    case 'postbiotic':
      return i.item.value.name
      break;
    default:
      alert(`missing type: ${type}`)
      return null
  }
}

export const getGroupForIngredient = (i) => {
  if (!i) {
    return null
  }  

  let type = i.item.case

  switch (type) {
    case 'probiotic':
      return i.item.value.spp
      break;
    case 'prebiotic':
      return i.item.value.category
      break
    case 'postbiotic':
      return i.item.value.function
      break;
    default:
      alert(`missing type: ${type}`)
      return null
  }
}

export const verifyIngredient = (i, field, newValue) => {
  let type = i.item.case
  let name = getNameForIngredient(i)

  switch (type) {
    case 'probiotic':
      let bCfuG = i.bCfuG;
      if (field == "bCfuG" && newValue) {
        bCfuG = newValue
      }
      if ( i.item.value.stockBCfuG < bCfuG) {
        return `Your desired CFU/g is too high for "${name}".`
      }
      break;
    case 'prebiotic':
    case 'postbiotic':
      let mgServing = i.mgServing;
      if (field == "mgServing" && newValue) {
        mgServing = newValue
      }
      if (mgServing > 1000) {
        return `Your mg / serving is too high for <strong>${name}</strong>`
      }
      break;
    default:
      alert(`missing type: ${type}`)
      return null
  }
}

const emptyTS = () => {
  return dateToTimestamp(new Date())
}

const emptyMoney = () => {
  return create(money_pb.MoneySchema, {});
}

const emptySupplier = () => {
  return create(supplier_pb.SupplierSchema, {
      createdAt : emptyTS(),
      updatedAt : emptyTS(),
      productCategories : [],
      })
};

export const emptyProbiotic = () => {
  return create(probiotic_pb.ProbioticSchema, {
      costKg: emptyMoney(),
      costShippingKg: emptyMoney(),
      supplier: emptySupplier(),
      mostRecentQuoteDate: emptyTS(),
      kgPerMeKg: 0.22,
      costOfMe: floatToMoney(118.91),
      })
}

export const emptyPrebiotic = () => {
  return create(prebiotic_pb.PrebioticSchema, {
      costKg: emptyMoney(),
      costShippingKg: emptyMoney(),
      supplier: emptySupplier(),
      mostRecentQuoteDate: emptyTS(),
      })
}

export const emptyPostbiotic = (p) => {
  return create(postbiotic_pb.PostbioticSchema, {
      costKg: emptyMoney(),
      costShippingKg: emptyMoney(),
      supplier: emptySupplier(),
      mostRecentQuoteDate: emptyTS(),
      })
}

export const emptyPackagingIngredient = (p) => {
  return create(other_pb.PackagingSchema, {
      totalCost: emptyMoney(),
      supplier: emptySupplier(),
      mostRecentQuoteDate: emptyTS(),
      })
}

export const emptyIngredient = (type) => {
  let i = create(recipe_pb.IngredientSchema, {})
  if (type == "probiotic") {
    i.item = {value: emptyProbiotic(), case: "probiotic"}
  } else if (type == "prebiotic") {
    i.item = {value: emptyPrebiotic(), case: "prebiotic"}
  } else if (type == "postbiotic") {
    i.item = {value: emptyPostbiotic(), case: "postbiotic"}
  } else if (type == "packaging") {
    i.item = {value: emptyPackaging(), case: "packaging"}
  } else {  
    alert(`TODO emptyIngredient ${type}`)
  }
  return i
}

export const emptyIngredientForType = (type) => {
  if (type == "probiotic") {
    return emptyProbioticIngredient()
  } else if (type == "prebiotic") {
    return emptyPrebioticIngredient()
  } else if (type == "postbiotic") {
    return emptyPostbioticIngredient()
  } else if (type == "packaging") {
    return emptyPackagingIngredient()
  } else {  
    alert(`TODO emptyIngredient ${type}`)
  }
}

export const emptyProbioticIngredient = () => {
  return create(recipe_pb.ProbioticIngredientSchema, {})
}

export const emptyPrebioticIngredient = () => {
  return create(recipe_pb.PrebioticIngredientSchema, {})
}

export const emptyPostbioticIngredient = () => {
  return create(recipe_pb.PostbioticIngredientSchema, {})
}

export const emptyRecipe = () => {
  return create(recipe_pb.RecipeSchema, {})
}
