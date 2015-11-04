module.exports = function buildViewModel() {
  return {
    currentMonth: 0,
    months: [{
      name: 'January 2015',
      days: [{
        name: '29'
        value: 29,
        enabled: false
      }, {
        name: '30'
        value: 30,
        enabled: false
      }, {
        name: '1'
        value: 1,
        enabled: true
      }]
    }]
  };
}
