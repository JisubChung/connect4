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


// server port
app.listen(3000);
console.log('server is running');