const jsonServer = require('json-server');
const express = require('express');
const path = require('path');

const server = jsonServer.create();
const router = jsonServer.router('db.json'); // Use your JSON data file
const middlewares = jsonServer.defaults();

const app = express();

app.use('/api', middlewares, router);

const PORT = process.env['PORT'] || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
