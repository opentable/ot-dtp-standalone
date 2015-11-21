module.exports = function update(model, action) {
  switch (action.type) {
    case 'increment':
      model.count = model.count + 1;
      return model;

    default:
      return model;
  }
};
