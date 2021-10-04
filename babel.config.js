module.exports = function (api) {
  api.cache(true);

  const isDevelopmentEnv = process.env.ELECTRON_WEBPACK_APP_ENV === "development";
  const isProductionEnv = process.env.ELECTRON_WEBPACK_APP_ENV !== "development";

  return {
    presets: [
      [
        require("@babel/preset-env").default,
        {
          forceAllTransforms: true,
          useBuiltIns:        "entry",
          corejs:             3,
          modules:            false,
          exclude:            ["transform-typeof-symbol"]
        }
      ],
      [
        require("@babel/preset-react").default,
        {
          development: isDevelopmentEnv,
          useBuiltIns: true
        }
      ],
      [
        require("@lingui/babel-preset-react"),
        {}
      ]
    ].filter(Boolean),
    plugins: [
      [require("@babel/plugin-proposal-private-methods"), { loose: true }],
      require("babel-plugin-transform-react-remove-prop-types").default,
      require("@babel/plugin-syntax-dynamic-import").default,
      require("babel-plugin-macros"),
      ["@babel/plugin-proposal-private-property-in-object", { loose: true }],
      require("@babel/plugin-transform-destructuring").default,
      [
        require("@babel/plugin-proposal-class-properties").default,
        {
          loose: true
        }
      ],
      [
        require("@babel/plugin-proposal-object-rest-spread").default,
        {
          useBuiltIns: true
        }
      ],
      [
        require("@babel/plugin-transform-runtime").default,
        {
          helpers:     false,
          regenerator: true,
          corejs:      false
        }
      ],
      [
        require("@babel/plugin-transform-regenerator").default,
        {
          async: false
        }
      ]
    ].filter(Boolean)
  };
};
