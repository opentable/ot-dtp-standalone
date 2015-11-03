var h = require('mercury').h;
var buildStyle = require('../build-style');

var styles = {
  picker: buildStyle({
    float: 'left',
    height: '48px',
    lineHeight: '19.2px',
    width: '157.797px',
  }),
  pickerLink: buildStyle({}, ['pickerLabel']),
  select: buildStyle({
    alignItems: 'center',
    backgroundColor: 'rgb(255, 255, 255)',
    borderBottomColor: 'rgb(166, 166, 166)',
    borderBottomLeftRadius: '0px',
    borderBottomRightRadius: '0px',
    borderBottomStyle: 'solid',
    borderBottomWidth: '1px',
    borderImageOutset: '0px',
    borderImageRepeat: 'stretch',
    borderImageSlice: '100%',
    borderImageSource: 'none',
    borderImageWidth: '1',
    borderLeftColor: 'rgb(166, 166, 166)',
    borderLeftStyle: 'solid',
    borderLeftWidth: '1px',
    borderRightColor: 'rgb(166, 166, 166)',
    borderRightStyle: 'solid',
    borderRightWidth: '1px',
    borderTopColor: 'rgb(166, 166, 166)',
    borderTopLeftRadius: '0px',
    borderTopRightRadius: '0px',
    borderTopStyle: 'solid',
    borderTopWidth: '1px',
    boxSizing: 'border-box',
    color: 'rgb(51, 51, 51)',
    cursor: 'pointer',
    display: 'block',
    height: '48px',
    letterSpacing: 'normal',
    lineHeight: '19.2px',
    marginBottom: '0px',
    marginLeft: '0px',
    marginRight: '0px',
    marginTop: '0px',
    opacity: '0',
    overflowX: 'visible',
    overflowY: 'visible',
    position: 'absolute',
    textAlign: 'start',
    textIndent: '0px',
    textRendering: 'auto',
    textShadow: 'none',
    textTransform: 'none',
    top: '0px',
    whiteSpace: 'pre',
    width: '157.797px',
    wordSpacing: '0px',
    writingMode: 'lr-tb',
    zIndex: '2',
  }),
  option: buildStyle({
    color: 'rgb(51, 51, 51)',
    cursor: 'pointer',
    display: 'block',
    height: 'auto',
    letterSpacing: 'normal',
    lineHeight: 'normal',
    minHeight: '19.2px',
    paddingBottom: '1px',
    paddingLeft: '2px',
    paddingRight: '2px',
    paddingTop: '0px',
    textAlign: 'start',
    textIndent: '0px',
    textShadow: 'none',
    textTransform: 'none',
    whiteSpace: 'pre',
    width: 'auto',
    wordSpacing: '0px',
  })
};

function option(count) {
  return h('option', {
    value: count,
    style: styles.option
  }, count + ' people');
}

module.exports = function dtpPickerForm(state) {
  var options = [1, 2, 3].map(option);

  return h('div', {
      style: styles.picker
    }, [
      h('a', {
        style: styles.pickerLink
      }, state.viewModel.partySize + ' people'),

      h('select', {
        style: styles.select
      }, options)
    ]
  );
}
