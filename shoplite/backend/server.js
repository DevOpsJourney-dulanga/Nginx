const express = require('express');
const os = require('os');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 5000;
// මම කවර copy එකද? Docker Compose එකෙන් set කරනවා (api1, api2, api3)
const INSTANCE = process.env.INSTANCE_NAME || os.hostname();

// උත්තර දුන්නේ කවුද කියලා බලන්න හැම response එකකටම tag එකක්
app.use((req, res, next) => {
  res.setHeader('X-Instance', INSTANCE);
  console.log(`[${INSTANCE}] ${req.method} ${req.url} ` +
    `client=${req.headers['x-real-ip'] || req.ip}`);
  next();
});

const products = [
  { id: 1, name: 'Keyboard', price: 49 },
  { id: 2, name: 'Mouse', price: 19 },
  { id: 3, name: 'Monitor', price: 189 },
];

// Health check: ඔබ, Docker සහ Nginx tests වලට
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', instance: INSTANCE, uptime: process.uptime() });
});

app.get('/api/products', (req, res) => {
  res.json({ instance: INSTANCE, products });
});

// Nginx backend එකට යැව්ව headers පෙන්වනවා
app.get('/api/whoami', (req, res) => {
  res.json({
    instance: INSTANCE,
    host: req.headers.host,
    realIp: req.headers['x-real-ip'],
    forwardedFor: req.headers['x-forwarded-for'],
    forwardedProto: req.headers['x-forwarded-proto'],
  });
});

// සෙමි endpoint: least_conn සහ timeouts (504) test කරන්න
app.get('/api/slow', async (req, res) => {
  const ms = Number(req.query.ms) || 3000;
  await new Promise(r => setTimeout(r, ms));
  res.json({ instance: INSTANCE, waited: ms });
});

// Crash endpoint: failover test කරන්න (ඉගෙනීමට පමණයි)
app.post('/api/crash', (req, res) => {
  res.json({ instance: INSTANCE, message: 'crashing in 100ms' });
  setTimeout(() => process.exit(1), 100);
});

app.listen(PORT, () => console.log(`[${INSTANCE}] listening on ${PORT}`));