const { create } = require('@bufbuild/protobuf')
const recipe_pb = require('../proto/recipe_pb.js');
const probiotic_pb = require('../proto/probiotics_pb.js');
const prebiotic_pb = require('../proto/prebiotics_pb.js');
const postbiotic_pb = require('../proto/postbiotics_pb.js');
const supplier_pb = require('../proto/supplier_pb.js');
const money_pb = require('../proto/money_pb.js');
import { timestampToDate } from './timestamp.js';
import { dateToTimestamp } from './timestamp.js';

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

export const verifyIngredient = (i, field, newValue) => {
  let type = i.item.case
  let name = getNameForIngredient(i)

  switch (type) {
    case 'probiotic':
      let cfuG = i.cfuG;
      if (field == "cfuG" && newValue) {
        cfuG = newValue
      }
      if ( i.item.value.stockCfuG < cfuG) {
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

export const emptyIngredient = (type) => {
  let i = create(recipe_pb.IngredientSchema, {})
  if (type == "probiotic") {
    i.item = {value: emptyProbiotic(), case: "probiotic"}
  } else if (type == "prebiotic") {
    i.item = {value: emptyPrebiotic(), case: "prebiotic"}
  } else if (type == "postbiotic") {
    i.item = {value: emptyPostbiotic(), case: "postbiotic"}
  } else {  
    alert(`TODO emptyIngredient ${type}`)
  }
  return i
}
