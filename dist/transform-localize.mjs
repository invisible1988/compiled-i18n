import { transformSync } from "@babel/core";
import { makeKey } from "./makeKey.mjs";
import { createRequire } from "node:module";
const require2 = createRequire(import.meta.url);
const tsPluginPath = require2.resolve("@babel/plugin-syntax-typescript");
const makePlugin = ({
  allKeys,
  pluralKeys
}) => {
  const localizeNames = /* @__PURE__ */ new Set();
  let didAddImport = false;
  let importNode = null;
  const plugin = {
    visitor: {
      ImportDeclaration(path) {
        const source = path.node.source.value;
        const specifiers = path.node.specifiers;
        if (source !== "compiled-i18n") return;
        for (const specifier of [...specifiers]) {
          if ("imported" in specifier && "name" in specifier.imported && (specifier.imported.name === "_" || specifier.imported.name === "localize")) {
            localizeNames.add(specifier.local.name);
          }
        }
        importNode = path.node;
      },
      TaggedTemplateExpression(path) {
        if ("name" in path.node.tag && localizeNames.has(path.node.tag.name)) {
          const { quasi } = path.node;
          const strings = quasi.quasis.map((element) => element.value.cooked);
          const key = makeKey(strings);
          if (/[\r\n]/.test(key)) {
            throw new Error(
              `Keys cannot contain newlines. Please change this to a short, descriptive key and use translations instead: "${JSON.stringify(
                strings
              )}`
            );
          }
          allKeys?.add(key);
          const keyExpr = {
            type: "StringLiteral",
            value: key
          };
          const args = quasi.expressions.map((arg) => {
            if (typeof arg === "string") {
              return {
                type: "StringLiteral",
                value: arg
              };
            }
            return arg;
          });
          if (pluralKeys?.has(key)) {
            if (!didAddImport) {
              importNode.specifiers.push({
                type: "ImportSpecifier",
                imported: { type: "Identifier", name: "interpolate" },
                local: { type: "Identifier", name: "__interpolate__" }
              });
              didAddImport = true;
            }
            path.replaceWith({
              type: "CallExpression",
              callee: {
                type: "Identifier",
                name: "__interpolate__"
              },
              arguments: [
                // We ask for the translation without parameters, which will keep it as-is
                // That way parameter markers are retained
                {
                  type: "CallExpression",
                  callee: { type: "Identifier", name: "__$LOCALIZE$__" },
                  arguments: [keyExpr]
                },
                // an array of the arguments
                {
                  type: "ArrayExpression",
                  elements: args
                }
              ]
            });
          } else {
            path.replaceWith({
              type: "CallExpression",
              callee: {
                type: "Identifier",
                name: "__$LOCALIZE$__"
              },
              arguments: [
                keyExpr,
                {
                  type: "ArrayExpression",
                  elements: args
                }
              ]
            });
          }
        }
      }
    }
  };
  return plugin;
};
const transformLocalize = ({
  id,
  code,
  babelPlugins = [],
  allKeys,
  pluralKeys
}) => {
  const begin = code.slice(0, 5e3);
  if (!begin.includes("compiled-i18n") || begin.includes("__interpolate__"))
    return null;
  const result = transformSync(code, {
    filename: id,
    // Ignore any existing babel configuration files
    configFile: false,
    plugins: [
      makePlugin({ allKeys, pluralKeys }),
      [tsPluginPath, { isTSX: true }],
      ...babelPlugins
    ],
    retainLines: true
    // Babel isn't quite ESTree compatible, don't keep it
    // ast: true,
  });
  return result.code;
};
const getTr = (key, locale, translations) => {
  while (locale) {
    const tr = translations[locale].translations[key];
    if (tr) return tr;
    locale = translations[locale].fallback;
  }
  return key;
};
const makeTranslatedExpr = (tr, paramExprs) => {
  if (typeof tr !== "string") return JSON.stringify(tr);
  const escaped = tr.replace(/`/g, "\\`");
  return paramExprs.length === 0 ? `\`${escaped}\`` : `\`${escaped.replace(/\$(\d|\$)/g, (_, i) => {
    if (i === "$") return "$";
    const p = paramExprs[parseInt(i) - 1];
    if (p == null) return "";
    return `\${${p}}`;
  })}\``;
};
const singleCharEscapes = {
  b: "\b",
  f: "\f",
  n: "\n",
  r: "\r",
  t: "	",
  v: "\v",
  "0": "\0"
};
const parseHexDigits = (digits, expr, exactLength) => {
  if (!digits || exactLength !== void 0 && digits.length !== exactLength || !/^[\da-fA-F]+$/.test(digits))
    throw new Error(`Invalid escape sequence in ${expr}`);
  return parseInt(digits, 16);
};
const parseStringLiteral = (expr) => {
  const source = expr.trim();
  const quote = source[0];
  if (quote !== '"' && quote !== "'" && quote !== "`")
    throw new Error(`Not a string literal: ${expr}`);
  let value = "";
  let i = 1;
  for (; i < source.length; i++) {
    const char = source[i];
    if (char === quote) break;
    if (quote === "`" && char === "$" && source[i + 1] === "{")
      throw new Error(`Not a static string literal: ${expr}`);
    if (char !== "\\") {
      value += char;
      continue;
    }
    const escaped = source[++i];
    if (escaped === void 0) break;
    if (escaped >= "1" && escaped <= "7") {
      throw new Error(`Legacy octal escape in ${expr}`);
    } else if (escaped === "0" && source[i + 1] >= "0" && source[i + 1] <= "9") {
      throw new Error(`Legacy octal escape in ${expr}`);
    } else if (escaped === "x") {
      value += String.fromCharCode(
        parseHexDigits(source.slice(i + 1, i + 3), expr, 2)
      );
      i += 2;
    } else if (escaped === "u" && source[i + 1] === "{") {
      const end = source.indexOf("}", i);
      if (end === -1) throw new Error(`Invalid escape sequence in ${expr}`);
      value += String.fromCodePoint(
        parseHexDigits(source.slice(i + 2, end), expr)
      );
      i = end;
    } else if (escaped === "u") {
      value += String.fromCharCode(
        parseHexDigits(source.slice(i + 1, i + 5), expr, 4)
      );
      i += 4;
    } else if (escaped === "\n") ;
    else {
      value += singleCharEscapes[escaped] ?? escaped;
    }
  }
  if (i !== source.length - 1)
    throw new Error(`Not a single string literal: ${expr}`);
  return value;
};
const marker = "__$LOCALIZE$__(";
const replaceGlobals = ({
  code,
  translations,
  locale
}) => {
  let startIndex;
  code = code.replaceAll("__$LOCALE$__", locale);
  while (code.length) {
    startIndex = code.lastIndexOf(marker, startIndex);
    if (startIndex === -1) {
      return code;
    }
    const chunk = code.slice(startIndex);
    const argExprs = [];
    let inSingleQuote = false;
    let inDoubleQuote = false;
    let inTemplateString = false;
    let argStart = marker.length;
    let inEscapeSequence = false;
    let parensBalance = 1;
    let didReadParamArray = false;
    let i;
    for (i = argStart; i < chunk.length; i++) {
      const char = chunk[i];
      if (inEscapeSequence) {
        inEscapeSequence = false;
      } else if (char === "\\") {
        inEscapeSequence = true;
      } else if (char === "'" && !inDoubleQuote && !inTemplateString) {
        inSingleQuote = !inSingleQuote;
      } else if (char === '"' && !inSingleQuote && !inTemplateString) {
        inDoubleQuote = !inDoubleQuote;
      } else if (char === "`" && !inSingleQuote && !inDoubleQuote) {
        inTemplateString = !inTemplateString;
      } else if (!inSingleQuote && !inDoubleQuote && !inTemplateString) {
        if ("([{".includes(char)) {
          if (parensBalance === 1 && char === "[") {
            argStart = i + 1;
            didReadParamArray = true;
          }
          parensBalance++;
        } else if (")]}".includes(char)) {
          if (parensBalance === 2 && char === "]") {
            argExprs.push(chunk.slice(argStart, i).trim());
          }
          if (parensBalance === 1 && !didReadParamArray) {
            argExprs.push(chunk.slice(argStart, i).trim());
          }
          parensBalance--;
          if (parensBalance === 0) {
            break;
          }
        } else if (
          // We found an argument boundary
          char === "," && (parensBalance === 1 || parensBalance === 2)
        ) {
          argExprs.push(chunk.slice(argStart, i).trim());
          argStart = i + 1;
        }
      }
    }
    if (parensBalance !== 0) {
      throw new Error("Unbalanced parenthesis");
    }
    if (!argExprs.length) {
      throw new Error(`No arguments found for __$LOCALIZE$__`);
    }
    const keyExpr = argExprs.shift();
    let key;
    try {
      key = parseStringLiteral(keyExpr);
    } catch (error) {
      throw new Error(
        `Invalid __$LOCALIZE$__ key: ${error.message}`,
        {
          cause: error
        }
      );
    }
    const tr = getTr(key, locale, translations);
    code = code.slice(0, startIndex) + makeTranslatedExpr(tr, argExprs) + chunk.slice(i + 1);
  }
  return code;
};
export {
  makeTranslatedExpr,
  parseStringLiteral,
  replaceGlobals,
  transformLocalize
};
