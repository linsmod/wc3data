const proxy = require('http-proxy-middleware');
module.exports = function(app) {
  app.use(proxy('/api', {
    target: 'http://192.168.1.106:5200/',
    changeOrigin: true,
    headers: {
      "Connection": "keep-alive",
    },
  }));
};
