var hg = require('mercury');
var pickerForm = require('./components/picker-form');
var utils = require('./utils');
var merge = require('ramda/src/merge');

var now = new Date();
var currentDay = now.getDay();
var currentMonth = now.getMonth();
var currentYear = now.getFullYear();
var generateMonth = utils.generateMonthFactory(currentDay, currentMonth, currentYear);

var h = hg.h;

function setMonth(collection, month, year) {
  collection[year] = collection[currentYear] || {};
  collection[year][month] = generateMonth(month, year);
}

function buildInitialViewModel(opts) {

  var initialViewModel = {
    autocompletePlaceholder: 'Location or Restaurant',
    date: '2015-10-10',
    viewportDimensions: hg.struct({
      width: hg.value(opts.viewportDimensions.width),
      height: hg.value(opts.viewportDimensions.height)
    }),
    position: hg.struct({
      x: hg.value(opts.position.x),
      y: hg.value(opts.position.y)
    }),
    displayedDate: hg.struct({
      month: hg.value(currentMonth),
      year: hg.value(currentYear)
    }),
    findATable: 'Find a Table',
    language: 'en',
    partySize: 2,
    partySizeLargerParty: 'Larger party',
    partySizePlural: '2 people',
    partySizeSingular: '1 person',
    // should be the index of the td highlighted by the user's mouse
    highlightedDayIndex: hg.value(null),
    selectedDate: hg.struct({
      isSelected: hg.value(true),
      year: hg.value(2015),
      month: hg.value(currentMonth),
      day: hg.value(currentDay)
    }),
    showLargerParty: true,
    showSearch: false,
    time: '23:30',
    timeOptions: [{ value: '23:30', displayValue: '23:30' }],
    timezoneOffset: -420,
    years: {}
  };

  setMonth(initialViewModel.years, currentMonth, currentYear);
  return initialViewModel;
}

function nextMonth(state) {
  var nextDate = utils.getNextDate(state.viewModel.displayedDate.month(), state.viewModel.displayedDate.year());
  setMonth(state.viewModel.years, nextDate.month, nextDate.year);
  state.viewModel.displayedDate.set(nextDate);
}

function lastMonth(state) {
  var lastDate = utils.getLastDate(state.viewModel.displayedDate.month(), state.viewModel.displayedDate.year());
  setMonth(state.viewModel.years, lastDate.month, lastDate.year);
  state.viewModel.displayedDate.set(lastDate);
}

function mouseoutDay(state, dayIndex) {
  state.viewModel.highlightedDayIndex.set(null);
}

function mouseoverDay(state, dayIndex) {
  state.viewModel.highlightedDayIndex.set(dayIndex);
}

function getInitialAppState(opts) {
  return hg.state({
    viewModel: hg.struct(buildInitialViewModel(opts)),
    channels: {
      mouseoverDay: mouseoverDay,
      mouseoutDay: mouseoutDay,
      // resizeViewport: resizeViewport,
      // scroll: scroll,
      nextMonth: nextMonth,
      lastMonth: lastMonth
    }
  });
}

function render(state) {
  return pickerForm(state);
}

var additionalEvents = ['mouseover', 'mouseout'];

function app(elem, observ, render, opts) {
  if (!elem) {
    throw new Error(
      'Element does not exist. ' +
      'Mercury cannot be initialized.');
  }

  var delegator = hg.Delegator(opts);
  for (i = 0; i < additionalEvents.length; i++) {
    delegator.listenTo(additionalEvents[i]);
  }


  var loop = hg.main(observ(), render, merge({
    diff: hg.diff,
    create: hg.create,
    patch: hg.patch
  }, opts));

  elem.appendChild(loop.target);

  return observ(loop.update);
}

function getPosition(element) {
    var xPosition = 0;
    var yPosition = 0;

    while(element) {
        xPosition += (element.offsetLeft - element.scrollLeft + element.clientLeft);
        yPosition += (element.offsetTop - element.scrollTop + element.clientTop);
        element = element.offsetParent;
    }
    return { x: xPosition, y: yPosition };
}

function getViewportDimensions() {
  var elem = (document.compatMode === "CSS1Compat") ?
      document.documentElement :
      document.body;

  return {
    height: elem.clientHeight,
    width: elem.clientWidth
  };
}

module.exports = {
  render: function(selector) {
    var el = document.querySelector(selector);

    var opts = {
      viewportDimensions: getViewportDimensions(),
      position: getPosition(el)
    };
    var state = getInitialAppState(opts);

    // window.addEventListener("optimizedScroll", function() {
    //   var position = getPosition(el);
    //   var viewportDimensions = getViewportDimensions();
    // });

    app(el, state, render);
  }
};

// <% var extraCssClass = showSearch ? " with-search" : ""; %>
// <div class="dtp-picker hide dtp-lang-<%- language + extraCssClass %>">
//   <form class="dtp-picker-form">
//     <% if (timezoneOffset != null) %>
//       <input type="hidden" name="timezoneOffset"/>
//     <% } %>
//     <input type="text" class="date-picker dtp-picker-selector"/>
//     <select class="time-picker hide">
//       <% for (var i = 1; i < (showLargerParty ? 22 : 21); i++) { %>
//         <% isSelected = i === partySize; %>
//         <% var displayValue = partySizePlural.replace('{0}', i); %>

//         <% if (i === 1) { %>
//           <% displayValue = partySizeSingular.replace('{0}', i); %>
//         <% } else if(i === 21)  { %>
//           <% displayValue = partySizeLargerParty; %>
//         <% } %>

//         <% if(isSelected) %>
//           <option value=<%- i %> selected="selected"> <option>
//         <% else %>
//           <option value=<%- i %>> <%- displayValue %> <option>
//         <% } %>
//       <% } %>
//       <!-- incomplete -->
//     </select>
//     <input type="submit" class="button dtp-picker-button"/>
//   </form>
// </div>


/**
 * Dtp - binds actions to events and sets the proper js to style menus
 *
 */

// OT.createNS('OT.Common.Dtp');

// OT.Common.Dtp = (function($, _, moment){
//   'use strict';

//   var selectors = {
//     partySizePicker: '.party-size-picker',
//     timePicker: '.time-picker',
//     datePicker: '.date-picker',
//     searchText: '.dtp-picker-search',
//     dtpForm: '.dtp-picker-form',
//     timezoneOffset: 'input[name="timezoneOffset"]'
//   };

//   var DTP_COOKIE_IDENTIFIER = "OT_dtp_values",
//       DTP_COOKIE_MAXAGE = 365*24*60*60*1000;

//   var tabIndexCounter = 0,
//       _validateDateTime = true,
//       _shouldEmitChangedEvent = true;

//   var cookies = {
//     get: function(key){
//       var cookied = OT.Common.Cookies.get(DTP_COOKIE_IDENTIFIER);
//       return typeof(key) === 'string' ? ((!!cookied && !!cookied[key]) ? cookied[key] : undefined): cookied;
//     },
//     set: function(values){
//       var cookiedValues = {};
//       cookiedValues[DTP_COOKIE_IDENTIFIER] = _.pick(values, 'covers', 'datetime');

//       return OT.Common.Cookies.set(cookiedValues, DTP_COOKIE_MAXAGE);
//     }
//   };

//   var getMetroOffset = function($dtp){
//     var metroOffset = 0,
//         $dtpOffset = $dtp ? $dtp.find(selectors.timezoneOffset) : [];

//     if($dtpOffset.length > 0){
//       metroOffset = $dtpOffset.val();
//     } else if(!!pageData && pageData.headerTimezoneOffset){
//       metroOffset = pageData.headerTimezoneOffset;
//     }

//     return metroOffset;
//   };

//   var getMetroDateTime = function($dtp){
//     return moment().utc().add(getMetroOffset($dtp), 'm');
//   };

//   var setTabIndexes = function(inputs, startIndex){
//     inputs.partySizePicker.attr("tabindex", startIndex + 1);
//     inputs.datePicker.attr("tabindex", startIndex + 2);
//     inputs.timePicker.attr("tabindex", startIndex + 3);
//     inputs.searchText.attr("tabindex", startIndex + 4);
//     inputs.searchButton.attr("tabindex", startIndex + 5);

//     return startIndex + 5;
//   };

//   var setHighlighting = function(formInputs, labelInputs){

//     var highlightOnFocus = function($formInput, $labelInput){
//       $formInput.focus(function(){
//         $labelInput.addClass('highlighted');
//       });
//     };

//     var unhighlightOnBlur = function($formInput, $labelInput){
//       $formInput.blur(function(){
//         $labelInput.removeClass('highlighted');
//       });
//     };

//     _.forEach(labelInputs, function($labelInput, key){
//       highlightOnFocus(formInputs[key], $labelInput);
//       unhighlightOnBlur(formInputs[key], $labelInput);
//     });
//   };

//   var dtp = {
//     init: function(dtpSelector){

//       $(dtpSelector).each(function(){

//         var $dtp = $(this);

//         // ensure the dtp is hidden before rendering it
//         $dtp.addClass("hide");

//         // inits and renders all the components
//         var metroDateTime = getMetroDateTime($dtp),
//             minDate = OT.Common.Helpers.getMinimumDate(metroDateTime),
//             $timePicker = $dtp.find(selectors.timePicker).OTselect("init"),
//             $partySizePicker = $dtp.find(selectors.partySizePicker).OTselect("init"),
//             $datepicker = $dtp.find(selectors.datePicker).OTdatepicker("init", minDate),
//             $searchText = $dtp.find(selectors.searchText),
//             $form = $dtp.find(selectors.dtpForm),
//             dateTimeValidator = new OT.Common.Helpers.dateTimeValidator();

//         var selectInitValueFor = {
//           covers: function(){

//             var isValid = function(val){
//               return !!val && val<=21 && val>0;
//             };

//             var valueWasSupplied = !$partySizePicker.OTselect("info").unselectedOnInit,
//                 suppliedValue = valueWasSupplied ? $partySizePicker.OTselect("get") : null,
//                 defaultValue = 2;

//             if(!isValid(suppliedValue)){
//               var cookiedValue = cookies.get('covers'),
//                   coversValue = isValid(cookiedValue) ? cookiedValue : defaultValue;

//               $partySizePicker.OTselect("select", coversValue);
//             }
//           },
//           dateTime: function(){

//             var metroDateTime = getMetroDateTime($dtp),
//                 metroDate = metroDateTime.format("YYYY-MM-DD"),
//                 metroTime = metroDateTime.format("HH:mm");

//             var isValid = function(date, time){
//               if(!date || !time){
//                 return false;
//               }

//               var validated = dateTimeValidator.get(date, time, metroDate, metroTime);

//               return validated.date === date && validated.time === time;
//             };

//             var suppliedValue = {
//               time: $timePicker.OTselect("info").unselectedOnInit ? null : $timePicker.OTselect("get"),
//               date: $datepicker.OTdatepicker("getOriginalValue")
//             };

//             var setValues = (function(originalDate, originalTime){
//               return function(newValues){
//                 if(originalDate !== newValues.date){
//                   $datepicker.OTdatepicker("set", newValues.date);
//                 }

//                 if(originalTime !== newValues.time){
//                   $timePicker.OTselect("select", newValues.time);
//                 }
//               };
//             })(suppliedValue.date, suppliedValue.time);

//             if(!isValid(suppliedValue.date, suppliedValue.time)){
//               var cookiedDateTimeValue = cookies.get('datetime'),
//                   splitted = !!cookiedDateTimeValue ? cookiedDateTimeValue.split(" ") : [],
//                   cookiedValue = splitted.length === 0 ? undefined : {
//                     date: splitted[0],
//                     time: splitted[1]
//                   };

//               if(!cookiedValue){
//                 setValues(dateTimeValidator.get(suppliedValue.date, suppliedValue.time, metroDate, metroTime));
//               } else if(isValid(cookiedValue.date, cookiedValue.time)){
//                 setValues(cookiedValue);
//               } else {
//                 setValues(dateTimeValidator.get(cookiedValue.date, cookiedValue.time, metroDate, metroTime));
//               }
//             }
//           }
//         };

//         var hidePastTimes = function(){

//           $timePicker.OTselect("showAll");

//           var metroDateTime = getMetroDateTime($dtp),
//               metroDate = metroDateTime.format("YYYY-MM-DD"),
//               metroTime = metroDateTime.format("HH:mm"),
//               currentDate = $datepicker.OTdatepicker("get", 'yyyy-mm-dd'),
//               availability = OT.Common.Helpers.timeSlotsAvailability(),
//               availableTimeSlots = availability.get(currentDate, metroDate, metroTime),
//               timeOptions = $timePicker.find("option");

//           for(var i = 0; i < timeOptions.length; i++){
//             var $option = $(timeOptions[i]),
//                 value = $option.attr("value");

//             if(!_.contains(availableTimeSlots, value)){
//               $timePicker.OTselect("hide", value);
//             }
//           }
//         };

//         var fixDateTimeValues = function(callback){
//           if(!_validateDateTime){
//             return callback();
//           }

//           var metroDateTime = getMetroDateTime($dtp),
//               metroDate = metroDateTime.format("YYYY-MM-DD"),
//               metroTime = metroDateTime.format("HH:mm"),
//               currentTime = $timePicker.OTselect("get"),
//               currentDate = $datepicker.OTdatepicker("get", 'yyyy-mm-dd'),
//               validDateTime = dateTimeValidator.get(currentDate, currentTime, metroDate, metroTime);

//           if(currentDate !== validDateTime.date){
//             $datepicker.OTdatepicker("set", validDateTime.date);
//           } else if(currentTime !== validDateTime.time){
//             $timePicker.OTselect("select", validDateTime.time);
//           } else if(typeof(callback) === 'function'){
//             callback();
//           }
//         };

//         var formInputs = {
//           partySizePicker: $partySizePicker.find("select"),
//           datePicker: $datepicker.find("input"),
//           timePicker: $timePicker.find("select"),
//           searchText: $searchText,
//           searchButton: $form.find("input.button")
//         };

//         var labelInputs = {
//           partySizePicker: $partySizePicker.find("a"),
//           datePicker: $datepicker.find("a"),
//           timePicker: $timePicker.find("a"),
//           searchText: $searchText
//         };

//         // sets unique tabIndexes to the controls in order to enable switching via keyboard tabs
//         tabIndexCounter = setTabIndexes(formInputs, tabIndexCounter);

//         // binds focus/blur events to controls in order to enable label highlighting when mouse click/keyboard tab switching
//         setHighlighting(formInputs, labelInputs);

//         // sets initial values
//         selectInitValueFor.covers();
//         selectInitValueFor.dateTime();
//         hidePastTimes();

//         // Events bindings
//         var getSearchObj = function(){
//           var covers = $partySizePicker.OTselect("get"),
//               selectedTime = $timePicker.OTselect("get"),
//               selectedDate = $datepicker.OTdatepicker("get", "yyyy-mm-dd"),
//               dateTime = selectedDate + " " + selectedTime,
//               searchText = $searchText.length > 0 ? $searchText.val() : false;

//           return {
//             covers: covers,
//             datetime: dateTime,
//             searchText: searchText,
//             sender: $dtp
//           };
//         };

//         var onDTPChanged = function(){
//           if(_shouldEmitChangedEvent){
//             hidePastTimes();
//             var searchObj = getSearchObj();
//             cookies.set(searchObj);
//             OT.Events.fire("dtp:change", searchObj);
//           }
//         };

//         var searchTextValue = $searchText.length > 0 ? $searchText.val() : false;
//         $searchText.keyup(function(){
//           var newValue = $searchText.length > 0 ? $searchText.val() : false;

//           if(newValue !== searchTextValue){
//             searchTextValue = newValue;
//             onDTPChanged();
//           }
//         });

//         $form.submit(function(e){
//           e.preventDefault();
//           OT.Events.fire("dtp:search", getSearchObj());
//           return false;
//         });

//         OT.Events.on("datepicker:change", function(e, data){
//           if(data.sender.is($datepicker)){
//             fixDateTimeValues(onDTPChanged);
//           }
//         });

//         OT.Events.on("select:change", function(e, data){
//           if(data.sender.is($timePicker)){
//             fixDateTimeValues(onDTPChanged);
//           } else if(data.sender.is($partySizePicker)){
//             onDTPChanged();
//           }
//         });

//         // all done - make it visible
//         $dtp.removeClass("hide");
//         OT.Events.fire("dtp:rendered", getSearchObj());
//       });
//     },

//     set: function($dtp, obj){

//       obj = obj || {};

//       var partyChanged = false,
//           timeChanged = false,
//           dateChanged = false,
//           searchChanged = false,
//           $partySizePicker = $dtp.find(selectors.partySizePicker),
//           $datePicker = $dtp.find(selectors.datePicker),
//           $timePicker = $dtp.find(selectors.timePicker),
//           $searchText = $dtp.find(selectors.searchText),
//           fieldsChanged = 0,
//           fieldsToChange = 0;

//       if(!!obj.covers){
//         if($partySizePicker.OTselect("get").toString() !== obj.covers.toString()){
//           partyChanged = true;
//           fieldsToChange++;
//         }
//       }

//       if(!!obj.date){
//         if($datePicker.OTdatepicker("get", "yyyy-mm-dd").toString() !== obj.date.toString()){
//           dateChanged = true;
//           fieldsToChange++;
//         }
//       }

//       if(!!obj.time){
//         if($timePicker.OTselect("get").toString() !== obj.time.toString()){
//           timeChanged = true;
//           fieldsToChange++;
//         }
//       }

//       if(typeof(obj.searchText) !== 'undefined'){
//         searchChanged = true;
//         fieldsToChange++;
//       }

//       var updateChangeEventEmitterCheck = function(){
//         _shouldEmitChangedEvent = (fieldsToChange - fieldsChanged) < 2;
//       };

//       updateChangeEventEmitterCheck();

//       if(partyChanged){
//         $partySizePicker.OTselect("select", obj.covers);
//         fieldsChanged++;
//         updateChangeEventEmitterCheck();
//       }

//       if(dateChanged){
//         if(timeChanged){
//           _validateDateTime = false;
//         }
//         $datePicker.OTdatepicker("set", obj.date);
//         fieldsChanged++;
//         updateChangeEventEmitterCheck();
//       }

//       if(timeChanged){
//         _validateDateTime = true;
//         $timePicker.OTselect("showAll");
//         $timePicker.OTselect("select", obj.time);
//         fieldsChanged++;
//         updateChangeEventEmitterCheck();
//       }

//       if(searchChanged){
//         if(obj.searchText === false){
//           $searchText.val('').parent().addClass("hide").parent().removeClass("with-search");
//         } else {
//           $searchText.val(obj.searchText).parent().removeClass("hide").parent().addClass("with-search");
//         }
//         fieldsChanged++;
//         updateChangeEventEmitterCheck();
//       }
//     }
//   };

//   $.fn.OTdtp = function(action, param){

//     this.each(function(){
//       var $this = $(this);

//       if(action === "init"){
//         return dtp.init($this);
//       } else if(action === "set"){
//         return dtp.set($this, param);
//       }
//     });
//   };

//   return dtp;
// })(jQuery, _, moment);
// OT.createNS('OT.Common.DatePicker');

// OT.Common.DatePicker = (function($, moment){
//   'use strict';

//   var getLabelValue = function($dp){

//     var selectedDay = $dp.get('highlight', 'yyyy-mm-dd'),
//         today = moment().format('YYYY-MM-DD'),
//         tomorrow = moment().add(1, 'days').format('YYYY-MM-DD'),
//         isToday = (today === selectedDay),
//         isTomorrow = (tomorrow === selectedDay),
//         textLabel = $dp.get();

//     if(OT.Common.TestObject.isActive('todaytomorrow')){
//       if(isToday){
//         return OT.SRS.today;
//       } else if(isTomorrow) {
//         return OT.SRS.tomorrow;
//       }
//     }

//     return textLabel;
//   };

//   var datepicker = {
//     get: function($datepicker, optionalFormat){
//       var $datepickerInput = $datepicker.find('input'),
//           $picker = $datepickerInput.pickadate('picker');

//       if(!!optionalFormat){
//         return $picker.get('select', optionalFormat);
//       }

//       return $picker.get('select');
//     },
//     getOriginalValue: function($datepicker){
//       return $datepicker.find('input').attr('data-value');
//     },
//     init: function($datepicker, minDate){

//       var cssClass = $datepicker.attr('class'),
//           dateValue = $datepicker.val(),
//           $parent = $datepicker.parent(),
//           isJapanese = false,
//           calendarStartsSunday = (typeof(OT) !== 'undefined' && !!OT.SRS) ? !!OT.SRS.calendarStartsSunday : true;

//       var template = function(dateValue){

//         return '<div class="' + cssClass + '">' +
//                '  <a class="dtp-picker-selector-link date-label dtp-picker-label">' + dateValue + '</a>' +
//                '  <input type="text" name="datepicker" class="datepicker dtp-picker-select" data-value="' + dateValue + '" />' +
//                '</div>';
//       };

//       if(dateValue === ''){
//         dateValue = moment().format('YYYY-MM-DD');
//       }

//       $datepicker.after(template(dateValue));
//       $datepicker.remove();
//       $datepicker = $parent.find('.' + cssClass.replace(/ /g, '.'));

//       var $label = $datepicker.find('.date-label'),
//           $datePickerInput = $datepicker.find('input');

//       if(OT.SRS.lang){
//         setupLanguage(OT.SRS.lang);
//         if(OT.SRS.lang === 'ja'){
//           isJapanese = true;
//         }
//       }

//       var fixJapaneseYearMonthLabel = function(){
//         // In case of Japanese, we display Year first + 年 + month on the month's label.

//         var $headerYear = $datepicker.find('.picker__year'),
//             $headerMonth = $datepicker.find('.picker__month'),
//             $parent = $headerMonth.parent(),
//             outerHtml = function($el){ return $('<div />').append($el.clone()).html(); },
//             newHeaderContent = outerHtml($headerYear) + outerHtml($headerMonth);

//         $headerYear.remove();
//         $headerMonth.remove();
//         $parent.prepend(newHeaderContent);
//         $headerYear = $datepicker.find('.picker__year');

//         var headerYearText = $headerYear.text();

//         if(headerYearText.indexOf('年') < 0){
//           $headerYear.text(headerYearText + '年');
//         }
//       };

//       var closeDpIfOpened = function($dp){
//         if(!!$dp.get('open')){
//           $dp.close();
//         }
//       };

//       var getRenderPosition = function(){
//         var calendarHeight = 290,
//             labelHeight = $datePickerInput.height(),
//             datePickerOffset = parseInt($datepicker.offset().top, 10),
//             bodyScroll = (document.documentElement && document.documentElement.scrollTop) || document.body.scrollTop,
//             $body = $('body'),
//             bodyHeight = $body.height(),
//             marginBottom = bodyScroll + bodyHeight - labelHeight - datePickerOffset,
//             marginTop = datePickerOffset - bodyScroll;

//         return marginTop < calendarHeight ? 'down' : (marginBottom >= calendarHeight ? 'down' : 'up');
//       };

//       $datePickerInput.pickadate({
//         firstDay: calendarStartsSunday ? 0 : 1,
//         min: minDate ? moment(minDate).toDate() : new Date(),
//         formatSubmit: 'yyyy-mm-dd',
//         hiddenPrefix: 'submit_',
//         hiddenSuffix: '',
//         today: '',
//         clear: '',
//         format: OT.Common.Helpers.getDateFormatJS(),
//         onStart: function () {
//           var thisDatepicker = this;
//           $label.text(getLabelValue(thisDatepicker));

//           OT.Events.on('menus:cleared', function(){
//             if($label.hasClass('picker-opening')){
//               $label.removeClass('picker-opening');
//             } else {
//               closeDpIfOpened(thisDatepicker);
//             }
//           });
//         },

//         onOpen: function(){
//           if(isJapanese){
//             fixJapaneseYearMonthLabel();
//           }

//           $label.addClass('picker-opening');
//           OT.Common.Menus.closeAllMenus();
//           $label.addClass('menu-opened');

//           var $cal = $datepicker.find('.picker'),
//               renderPosition = getRenderPosition();

//           $cal.removeClass('up').removeClass('down').addClass(renderPosition);
//         },
//         onClose: function(){
//           $label.removeClass('menu-opened');
//         },
//         onSet: function(){
//           $label.text(getLabelValue(this));
//           OT.Events.fire('datepicker:change', { sender: $datepicker });

//           if(isJapanese){
//             fixJapaneseYearMonthLabel();
//           }
//         }
//       });

//       return $datepicker;
//     },
//     refresh: function($datepicker){
//       var $datepickerInput = $datepicker.find('input');

//       if($datepickerInput.length === 0){
//         return;
//       }

//       var $dp = $datepickerInput.pickadate('picker');

//       if($dp.length === 0){
//         return;
//       }

//       var $label = $datepicker.find('.date-label');

//       if($label.length === 0){
//         return;
//       }

//       $label.text(getLabelValue($dp));
//     },
//     set: function($datepicker, value, format){
//       var $datepickerInput = $datepicker.find('input'),
//           optionalFormat = format || { format: 'yyyy-mm-dd' };

//       return $datepickerInput.pickadate('picker').set('select', value, optionalFormat);
//     }
//   };

//   var setupLanguage = function(lang){
//     if(lang === 'es'){
//       $.extend($.fn.pickadate.defaults, {
//         monthsFull: [ 'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre' ],
//         monthsShort: [ 'ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic' ],
//         weekdaysFull: [ 'domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado' ],
//         weekdaysShort: [ 'dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb' ],
//         today: 'hoy',
//         clear: 'borrar',
//         labelMonthNext: 'Mes próximo',
//         labelMonthPrev: 'Mes anterior'
//       });
//     } else if(lang === 'ja'){
//       $.extend($.fn.pickadate.defaults, {
//         monthsFull: [ '1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月' ],
//         monthsShort: [ '1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月' ],
//         weekdaysFull: [ '日', '月', '火', '水', '木', '金', '土' ],
//         weekdaysShort: [ '日', '月', '火', '水', '木', '金', '土' ],
//         today: '今日',
//         clear: '消去',
//         labelMonthNext: '次月',
//         labelMonthPrev: '前月'
//       });
//     } else if(lang === 'fr'){
//       $.extend($.fn.pickadate.defaults, {
//         monthsFull: [ 'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre' ],
//         monthsShort: [ 'Jan', 'Fev', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aou', 'Sep', 'Oct', 'Nov', 'Dec' ],
//         weekdaysFull: [ 'Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi' ],
//         weekdaysShort: [ 'Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam' ],
//         today: 'Aujourd\'hui',
//         clear: 'Effacer',
//         labelMonthNext: 'Mois suivant',
//         labelMonthPrev: 'Mois précédent'
//       });
//     } else if(lang === 'de'){
//       $.extend($.fn.pickadate.defaults, {
//         monthsFull: [ 'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember' ],
//         monthsShort: [ 'Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez' ],
//         weekdaysFull: [ 'Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag' ],
//         weekdaysShort: [ 'So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa' ],
//         today: 'Heute',
//         clear: 'Löschen',
//         labelMonthNext: 'Nächste',
//         labelMonthPrev: 'Früher'
//       });
//     }
//   };

//   $.fn.OTdatepicker = function(action, param, param2){

//     var $this = this;

//     if(action === 'init'){
//       return datepicker.init($this, param);
//     } else if(action === 'get'){
//       return datepicker.get($this, param);
//     } else if(action === 'getOriginalValue'){
//       return datepicker.getOriginalValue($this, param);
//     } else if(action === 'refresh'){
//       return datepicker.refresh($this);
//     } else if(action === 'set'){
//       return datepicker.set($this, param, param2);
//     }

//     return this;
//   };

//   return {
//     init: datepicker.init,
//     get: datepicker.get,
//     getOriginalValue: datepicker.getOriginalValue,
//     set: datepicker.set
//   };

// })(jQuery, moment);
//
//
// 'use strict';

// var moment = require('moment');
// var request = require('request');
// var _ = require('underscore');

// var languages = require('./languages');
// var offsets = require('./offsets');

// var get = {
//   date: function(dateTime){
//     return !!dateTime ? moment(dateTime).format('YYYY-MM-DD') : '';
//   },
//   localisedTime: function(time, theme, lang){
//     var dateTime = moment('2001-01-01T' + time),
//         formattedTime = dateTime.format('HH:mm');

//     return (!!theme.match('com|mx') && lang !== 'fr') ? dateTime.format('h:mm') + ' ' + dateTime.format('A') : formattedTime;
//   },
//   partySize: function(partySize, showLargerParty){
//     partySize = !!partySize ? (partySize === '20+' ? 21 : parseInt(partySize, 10)) : 0;
//     return (!showLargerParty && partySize === 21) ? 0 : partySize;
//   },
//   time: function(dateTime){
//     return !!dateTime ? moment(dateTime.replace('Z', '')).format('HH:mm') : '';
//   }
// };

// var themesAndLangs = {
//   com: ['en', 'fr'],
//   couk: ['en'],
//   de: ['de', 'en'],
//   ie: ['en'],
//   jp: ['ja', 'en'],
//   mx: ['es', 'en'],
//   au: ['en']
// };

// var cached = {};

// module.exports.data = function(context, callback){

//   var isAcceptLanguageValid = _.isArray(context.acceptLanguage) && !_.isEmpty(context.acceptLanguage) && !!context.acceptLanguage[0].code,
//       parsedLanguage = isAcceptLanguageValid ? context.acceptLanguage[0].code : '*',
//       themeArg = context.params.theme,
//       theme = (!!themeArg && _.has(themesAndLangs, themeArg)) ? themeArg : 'com',
//       langsForTheme = themesAndLangs[theme],
//       language = _.contains(langsForTheme, parsedLanguage) ? parsedLanguage : langsForTheme[0],
//       showSearch = context.params.showSearch || false,
//       cacheFlushTimeout = 10 * 60 * 1000;

//   var getTimezonesData = function(cb){
//     if(!!cached.timezones){
//       cb(null, cached.timezones);
//     } else {
//       var dataApiUrl = context.plugins.discover('oc-core-data') || undefined;

//       if(!!dataApiUrl){
//         dataApiUrl += '/oc/dtp';

//         request({
//           url: dataApiUrl,
//           timeout: 3000
//         }, function(err, res, body){
//           if(err || res.statusCode !== 200){ return cb(err, offsets); }
//           try {
//             var value = JSON.parse(body);
//             cached.timezones = value;

//             setTimeout(function(){
//               cached.timezones = null;
//             }, cacheFlushTimeout);

//             cb(null, value);
//           } catch(e){
//             cb(e, offsets);
//           }
//         });
//       } else {
//         cb('service not discovered', offsets);
//       }
//     }
//   };

//   getTimezonesData(function(err, data){

//     var offsetsForTheme = data[theme],
//         offsetsForLang = _.contains(_.keys(offsetsForTheme), language) ? offsetsForTheme[language] : offsetsForTheme[_.keys(offsetsForTheme)[0]],
//         offset = offsetsForLang.default;

//     if(!!context.params.metroId && !!offsetsForLang.exceptions && !!offsetsForLang.exceptions[context.params.metroId]){
//       offset = offsetsForLang.exceptions[context.params.metroId];
//     }

//     var __ = function(term){
//       var dictionary = languages[language];
//       return _.has(dictionary, term) ? dictionary[term] : '';
//     };

//     var searchPlaceholder = (!!showSearch && !!context.params.searchPlaceholder) ? context.params.searchPlaceholder : __('textPlaceholder'),
//         showLargerParty = context.params.showLargerParty === false ? false : true,
//         timeOptions = [];

//     for(var i = 0; i<24; i++){
//       var value = (i < 10 ? '0' : '') + i + ':00',
//           halfValue = (i < 10 ? '0' : '') + i + ':30';

//       timeOptions.push({
//         value: value,
//         displayValue: get.localisedTime(value, theme, language)
//       });

//       timeOptions.push({
//         value: halfValue,
//         displayValue: get.localisedTime(halfValue, theme, language)
//       });
//     }

//     callback(null, {
//       showSearch: context.params.showSearch || false,
//       time: get.time(context.params.dateTime),
//       date: get.date(context.params.dateTime),
//       partySize: get.partySize(context.params.partySize, showLargerParty),
//       timeOptions: timeOptions,
//       partySizeSingular: __('partySingular'),
//       partySizePlural: __('partyPlural'),
//       partySizeLargerParty: __('partyLarger'),
//       findATable: __('findATable'),
//       autocompletePlaceholder: searchPlaceholder,
//       timezoneOffset: offset,
//       language: language,
//       showLargerParty: showLargerParty
//     });
//   });
// };
//mixin partySizeDisplayValue(isSelected, i)
  // - var displayValue = partySizePlural.replace('{0}', i);
  // - if(i === 1)
  //   - displayValue = partySizeSingular.replace('{0}', i);
  // - else if(i === 21)
  //   - displayValue = partySizeLargerParty;
  // - if(isSelected)
  //   option(value=i, selected="selected") #{displayValue}
  // - else
  //   option(value=i) #{displayValue}

// - var extraCssClass = showSearch ? " with-search" : "";
// div(class="dtp-picker hide dtp-lang-" + language + extraCssClass)
  // form.dtp-picker-form
  //   - if (timezoneOffset != null)
  //     input(type="hidden", name="timezoneOffset", value=timezoneOffset)
  //   select.party-size-picker.hide
  //     - for (var i = 1; i < (showLargerParty ? 22 : 21); i++)
  //       +partySizeDisplayValue((i === partySize), i)
  //   input.date-picker.dtp-picker-selector(value=date, type="text")
  //   select.time-picker.hide
  //     - for (var i = 0; i < timeOptions.length; i++){
  //       - var displayValue = timeOptions[i]["displayValue"];
  //       - var value = timeOptions[i]["value"];
  //       - var isSelected = value === time;
  //       - if(isSelected)
  //         option(value=value, selected="selected") #{displayValue}
  //       - else
  //         option(value=value) #{displayValue}
  //     - }
  //   - if(showSearch){
  //     div.dtp-picker-search-container
  //       div.dtp-picker-search-icon.icon-search
  //       input.dtp-picker-search(type="text", name="searchText", value="", placeholder=autocompletePlaceholder, data-bind="")
  //   - }
  //   input.button.dtp-picker-button(type="submit", value=findATable)
  //
  //
  // //   /**
 // * Select - transform an html select with options to a new designed one,
 // * with styling, menus, handlers, etc.
 // *
 // */

// OT.createNS('OT.Common.Select');

// OT.Common.Select = (function($, _){
  // 'use strict';

  // var _data = {};

  // var template = function(m){

  //   var t =  '<div class="' + m.cssClass + ' dtp-picker-selector select-native'+ (m.unselectedOnInit ? " unselected-on-init" : '') +'">' +
  //            '  <a class="select-label dtp-picker-selector-link" tabindex="-1">' + m.selectedValue + '</a>' +
  //            '  <select name="' + m.name + '">';

  //   for(var i = 0; i < m.options.length; i++){
  //     var option =  m.options[i],
  //         isChecked = option.selected ? " selected=\"selected\"" : '';

  //     t += '    <option value="' + option.value + '"' + isChecked + '>' + option.display + '</option>';
  //   }

  //   t += '  </select>' +
  //        '</div>';

  //   return t;
  // };

  // var getUniqueName = function(){
  //   var c = 0,
  //       name = "Select_" + c;

  //   while($("select[name='" + name + "']").length > 0){
  //     c++;
  //     name = "Select_" + c;
  //   }

  //   return name;
  // };

  // var getSelectModel = function($select){

  //   var outerHtml = function($el){ return $("<div />").append($el.clone()).html(); },
  //       unselectedOnInit = false;

  //   var name = getUniqueName(),
  //       model = {
  //         name: name,
  //         cssClass: $select.attr("class") || "",
  //         unselectedOnInit: false,
  //         options: _.map($select.find("option"), function(option){
  //           var $option = $(option),
  //               selected = $option.prop('selected');

  //           if(!!selected && outerHtml($option).indexOf("selected") === -1){
  //             unselectedOnInit = true;
  //           }

  //           return {
  //             display: $option.text(),
  //             value: $option.val(),
  //             selected: selected
  //           };
  //         })
  //       };

  //   _data[name] = model.options;

  //   var selected = _.findWhere(model.options, { selected: true });
  //   model.selectedValue = !!selected ? selected.display : '';

  //   if(model.selectedValue === '' || unselectedOnInit){
  //     model.unselectedOnInit = true;
  //   }

  //   return model;
  // };

  // var transformSelect = function($select){
  //   $select.addClass("hide");

  //   var $parent = $select.parent(),
  //       model = getSelectModel($select);

  //   $select.after(template(model));
  //   $select.remove();

  //   var $newSelect = $parent.find("." + model.cssClass.replace(/ /g, '.')),
  //       $label = $newSelect.find(".select-label");

  //   $label.text(model.selectedValue);
  //   $newSelect.removeClass("hide");

  //   return $newSelect;
  // };

  // var select = {

  //   get: function($select){
  //     return $select.find("select").val();
  //   },

  //   hide: function($select, values){
  //     if(!_.isArray(values)){
  //       values = [values];
  //     }

  //     _.forEach(values, function(value){
  //       var optionToHide = $select.find("option[value='" + value + "']");
  //       if(optionToHide.length > 0){
  //         optionToHide.remove();
  //       }
  //     });
  //   },

  //   info: function($select){
  //     return {
  //       unselectedOnInit: $select.hasClass("unselected-on-init")
  //     };
  //   },

  //   init: function($select){
  //     var $newSelect = transformSelect($select),
  //         $label = $newSelect.find(".select-label"),
  //         previousValue = $newSelect.find("select").val();

  //     var refresh = function($select, checkIfChanged){
  //       var selectedValue = $select.val(),
  //           $selectedOption = $select.find("option[value='" + selectedValue + "']"),
  //           selectedDisplayValue = $selectedOption.text();

  //       if(!checkIfChanged || previousValue !== selectedValue){
  //         $label.text(selectedDisplayValue);
  //         previousValue = selectedValue;
  //         OT.Events.fire("select:change", { sender: $select.parent() });
  //       }
  //     };

  //     $newSelect.find('select').on('change', function(){
  //       return refresh($(this));
  //     }).on('keyup', function(){
  //       return refresh($(this), true);
  //     });

  //     return $newSelect;
  //   },

  //   select: function($select, value){
  //     var $selectedOption = $select.find("option[value='" + value + "']"),
  //         $label = $select.find(".select-label");

  //     $select.find("option").removeAttr("selected");
  //     $select.find("select").val(value);
  //     $label.text($selectedOption.text());

  //     OT.Events.fire("select:change", { sender: $select });
  //   },

  //   showAll: function($select){
  //     var selectName = $select.find("select").attr("name"),
  //         initialOptions = _data[selectName] || [],
  //         newOptions = "";

  //     for(var i = 0; i < initialOptions.length; i++){
  //       var option = initialOptions[i];
  //       if($select.find("option[value='" + option.value + "']").length === 0){
  //         newOptions += "<option value='" + option.value + "'>" + option.display + "</option>";
  //       }
  //     }

  //     if(newOptions.length > 0){
  //       $select.find("select").prepend(newOptions);
  //     }
  //   }
  // };

  // $.fn.OTselect = function(action, param){
  //   if(!!select[action]){
  //     return select[action](this, param);
  //   }

  //   return this;
  // };

  // return {
  //   init: select.init,
  //   get: select.get,
  //   select: select.select
  // };

// })(jQuery, _);
