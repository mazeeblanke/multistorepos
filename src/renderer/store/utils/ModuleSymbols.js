import pluralize from 'pluralize'

const ucFirst = s => s.charAt(0).toUpperCase() + s.slice(1)
const toCaps = s => s.toUpperCase()

export default function (model) {
  return {
    state: {
      OBJECTS: pluralize(model),
      SELECTED_OBJECT: `selected${ucFirst(model)}`
    },
    actions: {
      CREATE_OBJECT: `create${ucFirst(model)}`,
      EDIT_OBJECT: `edit${ucFirst(model)}`,
      LOAD_OBJECTS: `load${ucFirst(pluralize(model))}`,
      LOAD_OBJECT: `load${ucFirst(model)}`,
      CLEAR_SELECTED_OBJECT: `clearSelected${ucFirst(model)}`
    },
    mutations: {
      SET_OBJECTS: `SET_${toCaps(pluralize(model))}`,
      SET_SELECTED_OBJECT: `SET_SELECTED_${toCaps(model)}`,
      CLEAR_SELECTED_OBJECT: `CLEAR_SELECTED_${toCaps(model)}`,
      ADD_NEW_OBJECT: `ADD_NEW_${toCaps(model)}`
    }
  }
}
