"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const fs = require("node:fs");
const tinyglobby = require("tinyglobby");
const makeKey = require("./makeKey.cjs");
const findLocalizeNames = (code) => {
  const names = /* @__PURE__ */ new Set();
  const importRe = /import\s*(?:type\s+)?\{([^}]*)\}\s*from\s*['"]compiled-i18n['"]/g;
  let m;
  while (m = importRe.exec(code)) {
    for (const raw of m[1].split(",")) {
      const seg = raw.trim();
      if (!seg) continue;
      const asMatch = /^(\w+)\s+as\s+(\w+)$/.exec(seg);
      if (asMatch) {
        if (asMatch[1] === "_" || asMatch[1] === "localize")
          names.add(asMatch[2]);
      } else if (seg === "_" || seg === "localize") {
        names.add(seg);
      }
    }
  }
  return names;
};
const readTemplate = (code, start) => {
  const len = code.length;
  let i = start + 1;
  let cur = "";
  const quasis = [];
  while (i < len) {
    const c = code[i];
    if (c === "\\") {
      cur += c + (code[i + 1] ?? "");
      i += 2;
      continue;
    }
    if (c === "`") {
      quasis.push(cur);
      return { quasis, end: i + 1 };
    }
    if (c === "$" && code[i + 1] === "{") {
      quasis.push(cur);
      cur = "";
      i += 2;
      let depth = 1;
      while (i < len && depth > 0) {
        const d = code[i];
        if (d === "{") depth++;
        else if (d === "}") {
          depth--;
          if (depth === 0) {
            i++;
            break;
          }
        } else if (d === "`") {
          const nested = readTemplate(code, i);
          if (!nested) return null;
          i = nested.end;
          continue;
        }
        i++;
      }
      continue;
    }
    cur += c;
    i++;
  }
  return null;
};
const readStringLiteral = (code, start) => {
  const quote = code[start];
  const len = code.length;
  let i = start + 1;
  let value = "";
  while (i < len) {
    const c = code[i];
    if (c === "\\") {
      const next = code[i + 1];
      value += next === "n" ? "\n" : next === "t" ? "	" : next ?? "";
      i += 2;
      continue;
    }
    if (c === quote) return { value, end: i + 1 };
    value += c;
    i++;
  }
  return null;
};
const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const extractKeys = (code, names) => {
  if (!names.size) return [];
  const keys = [];
  const len = code.length;
  const nameAlt = [...names].map(escapeRegExp).join("|");
  const re = new RegExp(`(?<![\\w$.])(?:${nameAlt})[ \\t]*`, "g");
  let m;
  const pushTemplate = (at) => {
    const parsed = readTemplate(code, at);
    if (!parsed) return null;
    const key = makeKey.makeKey(parsed.quasis);
    if (!/[\r\n]/.test(key)) keys.push(key);
    return parsed.end;
  };
  while (m = re.exec(code)) {
    const pos = m.index + m[0].length;
    const ch = code[pos];
    if (ch === "`") {
      const end = pushTemplate(pos);
      if (end != null) re.lastIndex = end;
    } else if (ch === "(") {
      let p = pos + 1;
      while (p < len && (code[p] === " " || code[p] === "	")) p++;
      const q = code[p];
      if (q === '"' || q === "'") {
        const str = readStringLiteral(code, p);
        if (str && !/[\r\n]/.test(str.value)) {
          keys.push(str.value);
          re.lastIndex = str.end;
        }
      } else if (q === "`") {
        const end = pushTemplate(p);
        if (end != null) re.lastIndex = end;
      }
    }
  }
  return keys;
};
const scanUsageKeys = (globs, root) => {
  const used = /* @__PURE__ */ new Set();
  const files = tinyglobby.globSync(globs, { cwd: root, absolute: true });
  for (const file of files) {
    let code;
    try {
      code = fs.readFileSync(file, "utf8");
    } catch {
      continue;
    }
    if (!code.includes("compiled-i18n")) continue;
    const names = findLocalizeNames(code);
    for (const key of extractKeys(code, names)) used.add(key);
  }
  return used;
};
exports.extractKeys = extractKeys;
exports.scanUsageKeys = scanUsageKeys;
