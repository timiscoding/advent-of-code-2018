const common = jest.requireActual("../common");

module.exports = {
  ...common,
  __DEBUG: false,
  getChalkInstance: () => common.getChalkInstance(false)
};
