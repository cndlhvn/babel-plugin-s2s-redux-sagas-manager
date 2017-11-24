module.exports = babel => {
  var t = babel.types;

  return {
    name: "s2s-redux-sagas-manager",
    visitor: {
      Program: {
        enter(path, state) {

        }
      }
    }
  }
}
