"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const makeKey = (tpl) => tpl.map((s, i) => `${i}${s.replace(/\$/g, () => "$$")}`).join("$").slice(1);
exports.makeKey = makeKey;
