var Express = require('express');
var app = Express();
app.use(Express.static(__dirname + '/www'));
app.listen(9000);
