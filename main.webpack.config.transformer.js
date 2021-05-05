const path = require("path");

module.exports = function (context) {
    context.resolve.modules = [path.resolve(__dirname, "./src"), "node_modules"];

    return context;
};
