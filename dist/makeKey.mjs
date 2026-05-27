const makeKey = (tpl) => tpl.map((s, i) => `${i}${s.replace(/\$/g, () => "$$")}`).join("$").slice(1);
export {
  makeKey
};
