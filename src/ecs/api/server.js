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
  res.send({"message": `I am the server for ${process.env.ENV_VAR}`});
});

app.get('/other', async (req, res) => {
  console.log(`Trying to hit the other server for ${process.env.OTHER_HOST_PORT}`);
  const response = await fetch(`http://localhost:${process.env.OTHER_HOST_PORT}/app/`, { headers: {'Content-Type': 'application/json'}});
  const data = await response.json();
  res.send(data);
});

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
