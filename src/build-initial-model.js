module.exports = function buildInitialModel(opts) {
  return {
    autocompletePlaceholder: 'Location or Restaurant',
    date: '2015-10-10',
    open: true,
    isDatePickerTop: opts.isElementInBottomHalf || 'false',
    isElementInBottomHalf: opts.isElementInBottomHalf || 'false',
    displayedDate: {
      month: opts.currentMonth,
      year: opts.currentYear
    },
    findATable: 'Find a Table',
    // locale: 'en-US',
    // language: 'en',
    locale: 'ja-JP',
    language: 'ja',
    partySize: 2,
    partySizeLargerParty: 'Larger party',
    partySizePlural: '2 people',
    partySizeSingular: '1 person',
    // should be the index of the td highlighted by the user's mouse
    highlightedDayIndex: null,
    selectedDate: {
      isSelected: true,
      year: 2015,
      month: opts.currentMonth,
      day: opts.currentDay
    },
    showLargerParty: true,
    showSearch: false,
    time: '23:30',
    timeOptions: [{ value: '23:30', displayValue: '23:30' }],
    timezoneOffset: -420,
    years: {}
  };
};
