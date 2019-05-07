#!/usr/bin/env node
import { readFileSync } from "fs";
import * as ts from "typescript";
import { Script } from "vm";
import * as program from "commander";

import Module = require("module");
require("pkginfo")(module);

let filename;
program
  .version(module.exports.version, "-v, --version")
  .usage("<file>")
  .action(fileArg => {
    filename = fileArg;
  });

program.parse(process.argv);

if (typeof filename === "undefined") {
  process.exit(0);
}

(async () => {
  const code = readFileSync(filename, "utf8");
  const options: ts.CompilerOptions = {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2018
  };
  const transpiledCode = ts.transpile(code, options);
  const script = new Script(transpiledCode, {
    displayErrors: true,
    filename
  });

  const module = new Module(filename);
  module.filename = filename;
  module.paths = (Module as any)._nodeModulePaths(filename); // eslint-disable-line no-underscore-dangle

  (global as any).exports = module.exports;
  (global as any).module = module;
  (global as any).require = module.require.bind(module);

  const hardFixScript = new Script("exports = module.exports", {
    displayErrors: true,
    filename
  });

  await hardFixScript.runInThisContext();
  await script.runInThisContext();
})();
