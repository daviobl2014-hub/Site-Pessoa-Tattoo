module.exports = {
  plugins: [
    require('postcss-preset-env')({
      stage: 2,
      preserve: false,
      features: {
        'nesting-rules': true
      }
    })
  ]
};
