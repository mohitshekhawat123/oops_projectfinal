const express = require('express');
const cors = require('cors');

const app = express();

// Enable CORS for all origins
app.use(cors());
app.use(express.json());

// Simple test route
app.get('/', (req, res) => {
  res.json({ message: 'Test server is working!', timestamp: new Date().toISOString() });
});

app.get('/api/auth/login', (req, res) => {
  res.json({ message: 'Login endpoint is reachable!', method: req.method });
});

const PORT = 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Test server running on http://localhost:${PORT}`);
  console.log(`Test server running on http://0.0.0.0:${PORT}`);
});