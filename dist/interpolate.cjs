"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const interpolate = (tr, params = []) => {
  for (let param = 0; typeof tr === "object"; param++) {
    let resolved = tr[params[param]] ?? tr["*"];
    if (typeof resolved === "number") resolved = tr[resolved];
    tr = resolved;
  }
  return typeof tr === "string" ? tr.replace(
    /\$([\d$])/g,
    (_, i) => i === "$" ? "$" : String(params[Number(i) - 1] ?? "")
  ) : "";
};
exports.interpolate = interpolate;
