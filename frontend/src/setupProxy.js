const { createProxyMiddleware } = require('http-proxy-middleware');


// module.exports = function (app) {
//   app.use(
//     '/api/forgotPassword',  // The path that you want to proxy (change this to match your backend routes)
//     createProxyMiddleware({
//       target: 'http://127.0.0.1:5000',  // The backend server's address
//       changeOrigin: true,
//     })
//   );
// };

module.exports = (app) => {
  app.use(createProxyMiddleware('/api', {
      target: 'http://127.0.0.1:5000/',
      secure: false
  }
));
}