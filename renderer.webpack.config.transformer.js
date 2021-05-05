const cloneDeep = require("lodash/cloneDeep");
const path = require("path");

module.exports = function (context) {
    let workerHtmlWebpackPlugin;

    // Fix filename clash in MiniCssExtractPlugin
    context.plugins.forEach((plugin) => {
      if (plugin.constructor.name === "MiniCssExtractPlugin") {
        plugin.options.filename = "[id].styles.css";
        plugin.options.moduleFilename = () => "[id].styles.css";
      }

      if (plugin.constructor.name === "HtmlWebpackPlugin") {
        plugin.options.chunks = ["renderer"];

        workerHtmlWebpackPlugin = cloneDeep(plugin);
      }
    });

    workerHtmlWebpackPlugin.options.filename = "worker.html";
    workerHtmlWebpackPlugin.options.chunks = ["worker"];

    context.plugins.push(workerHtmlWebpackPlugin);

    // Add entrypoint for worker
    context.entry.worker = [path.resolve(__dirname, "./src/worker/index.js")];

    context.module.rules.forEach((rule) => {
      if (rule.use && rule.use.loader === "babel-loader") {
        rule.test = /\.jsx?$/;
      }
    });

    context.module.rules.push({
      test:    /\.ts$/,
      include: [/src/],
      use:     [{ loader: "ts-loader" }]
    });

    context.resolve.modules = [path.resolve(__dirname, "./src"), "node_modules"];

    return context;
};
