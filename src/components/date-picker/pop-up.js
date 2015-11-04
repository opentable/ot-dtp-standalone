var h = require('mercury').h;

var styles = {
  popUp: {
    width: '22em',
    maxHeight: '22em',
    position: 'absolute',
    left: 'calc(50% - 11rem)',
    borderRadius: '3px',
    boxShadow: '0 0 0 1px rgba(0,0,0,.1)',
    padding: '1em',
    boxSizing: 'border-box',
  },
  popUpHeader: {
    boxSizing: 'border-box',
    textAlign: 'center',
    position: 'relative'
  },
  popUpTable: {
    boxSizing: 'border-box',
    textAlign: 'center',
    borderCollapse: 'collapse',
    borderSpacing: 0,
    tableLayout: 'fixed',
    fontSize: 'inherit',
    width: '100%',
    marginTop: '1rem',
  }
};

module.exports = function popUp(state) {
  return h('div', {
    style: styles.popUp
  }, [
    h('div', {
      style: styles.popUpHeader
    }, ['foo']),

    h('table', {
      style: styles.popUpTable
    }, [

      h('thead',
        h('tr', [

        ])
      )
    ])
  ]);
}
