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

function getPageOffset() {
  var supportPageOffset = window.pageXOffset !== undefined;
  var isCSS1Compat = ((document.compatMode || "") === "CSS1Compat");

  var x = supportPageOffset ? window.pageXOffset : isCSS1Compat ? document.documentElement.scrollLeft : document.body.scrollLeft;
  var y = supportPageOffset ? window.pageYOffset : isCSS1Compat ? document.documentElement.scrollTop : document.body.scrollTop;

  return { x: x, y: y };
}

function getIsElementInBottomHalf(el) {
  var viewportDimensions = getViewportDimensions();
  var position = getPosition(el);
  var pageOffset = getPageOffset();

  return position.y > viewportDimensions.height / 2;
}

module.exports = {
  getIsElementInBottomHalf,
  getPageOffset,
  getPosition,
  getViewportDimensions
};
