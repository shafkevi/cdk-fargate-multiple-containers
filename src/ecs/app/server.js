'use strict';

const fetch = require('node-fetch');
const express = require('express');
const cors = require('cors');
// Constants
const PORT = process.env.PORT;
const HOST = '0.0.0.0';

// App
const app = express();
app.use(cors());
app.get('/', (req, res) => {
  res.send({"message": `GET: / for ${process.env.ENV_VAR}`});
});
app.get('/test', (req, res) => {
  res.send({"message": `GET: /test for ${process.env.ENV_VAR}`});
});


app.get('/app', (req, res) => {
  res.send({"message": `GET: /app for ${process.env.ENV_VAR}`});
});


app.get('/app/test', (req, res) => {
  res.send({"message": `GET: /app/test for ${process.env.ENV_VAR}`});
});

app.get('/app/other', async (req, res) => {
  console.log(`Trying to hit the other server for ${process.env.OTHER_HOST_PORT}`);
  const response = await fetch(`http://localhost:${process.env.OTHER_HOST_PORT}/`, { headers: {'Content-Type': 'application/json'}});
  const data = await response.json();
  res.send(data);
});

app.get('/other', async (req, res) => {
  console.log(`Trying to hit the other server for ${process.env.OTHER_HOST_PORT}`);
  const response = await fetch(`http://localhost:${process.env.OTHER_HOST_PORT}/`, { headers: {'Content-Type': 'application/json'}});
  const data = await response.json();
  res.send(data);
});

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
