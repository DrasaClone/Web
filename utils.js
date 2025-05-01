function debounce(fn, delay) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, args), delay);
  };
}
function pageTransition(fromEl, toEl) {
  anime({ targets: fromEl, translateX:[0,-100], opacity:[1,0], easing:'easeInOutQuad', duration:300 });
  anime({ targets: toEl, translateX:[100,0], opacity:[0,1], easing:'easeInOutQuad', duration:300, delay:100 });
}
