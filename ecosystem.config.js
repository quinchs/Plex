module.exports = {
  apps : [{
    script: 'dist/index.js',
    name: "Plex",
    env: {
     "FORCE_COLOR": 1
    },
    "args": [
        "--color"
      ]
  }]
};
