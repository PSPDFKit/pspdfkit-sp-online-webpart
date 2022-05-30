"use strict";

const build = require("@microsoft/sp-build-web");
const CopyWebpackPlugin = require("copy-webpack-plugin");

const pspdfkitFilesToCopy = [
  {
    from: "node_modules/pspdfkit/dist/pspdfkit-lib",
    to: "./pspdfkit-lib",
  },
];

const additionalAssets = [
  {
    from: "./assets",
    to: "./assets",
  },
];

build.addSuppression(
  `Warning - [sass] The local CSS class 'ms-Grid' is not camelCase and will not be type-safe.`
);

var getTasks = build.rig.getTasks;
build.rig.getTasks = function () {
  var result = getTasks.call(build.rig);

  result.set("serve", result.get("serve-deprecated"));

  return result;
};

build.configureWebpack.mergeConfig({
  additionalConfiguration: (config) => {
    config.plugins.push(
      new CopyWebpackPlugin({
        patterns: [...pspdfkitFilesToCopy, ...additionalAssets],
      })
    );

    return config;
  },
});

build.initialize(require("gulp"));
