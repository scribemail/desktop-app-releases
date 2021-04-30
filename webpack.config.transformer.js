const cloneDeep = require('lodash/cloneDeep')

module.exports = function(context) {
    let workerHtmlWebpackPlugin;

    // Fix filename clash in MiniCssExtractPlugin
    context.plugins.forEach((plugin) => {
      if (plugin.constructor.name === "MiniCssExtractPlugin") {
        plugin.options.filename = '[id].styles.css';
        plugin.options.moduleFilename = (name) => {
            return '[id].styles.css';
        };
      }

      if (plugin.constructor.name === "HtmlWebpackPlugin") {
        plugin.options.chunks = ['renderer'];
        plugin.options.filename = "renderer.html";

        workerHtmlWebpackPlugin = cloneDeep(plugin);
      }
    });

    workerHtmlWebpackPlugin.options.filename = "worker.html";
    workerHtmlWebpackPlugin.options.chunks = ['worker'];

    context.plugins.push(workerHtmlWebpackPlugin);

    // Add entrypoint for second renderer
    context.entry.worker = ['./src/worker/index.js'];

    console.log(context);

    return context;
};
