module.exports = {
  apps: [{
    name: 'coglist',
    script: 'bin/www.js',
    //instances: 'max',
   // exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      GROK_API_KEY: "xai-hWXuJPdzFAshXCTomijXZT7NcdeGLepEMXiQF878Bkajq5qSWm8SJWVVHbNBlcDOjEdsoweOIzc0bDom"
     // SERVER_PORT: 8888
    }
  }]
};