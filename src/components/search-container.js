
function searchContainer(state) {
  return h('div', {
      style: {
        borderLeftColor: 'rgba(0, 0, 0, 0.0784314)',
        borderLeftStyle: 'solid',
        borderLeftWidth: '1px',
        borderTopColor: 'rgb(255, 255, 255)',
        borderTopStyle: 'none',
        borderTopWidth: '0px',
        boxSizing: 'border-box',
        clear: 'none',
        color: 'rgb(255, 255, 255)',
        cursor: 'default',
        display: 'block',
        float: 'left',
        fontFamily: "source-sans-pro, 'Helvetica Neue', Helvetica, Arial, sans-serif",
        fontSize: '16px',
        fontStyle: 'normal',
        fontWeight: 'normal',
        height: '48px',
        lineHeight: '19.2px',
        marginBottom: '0px',
        marginLeft: '0px',
        marginRight: '0px',
        marginTop: '0px',
        paddingBottom: '0px',
        paddingLeft: '0px',
        paddingRight: '0px',
        paddingTop: '0px',
        position: 'relative',
        width: '410.266px',
      }
    }, 'example' + state.viewModel.partySize);
}
