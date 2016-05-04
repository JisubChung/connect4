/**
 * Created by jisub on 5/3/16.
 */

// Module dependancies
var express = require('express');
var app = express();
var path = require('path');
var dotenv = require('dotenv');

// Load environment variables.
dotenv.load({ path: '.env' });

/**
 * Express server settings
 * */
// setting up views folder for views (using ejs)
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// express to use static assets
app.use(express.static('public'));

// set routes
app.get('/', function(req, res) {
    res.render('index');
});

// Start the server!
app.listen(3000);
console.log('server is running');