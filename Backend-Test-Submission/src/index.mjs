import express from 'express';
import { log } from '../../Logging-Middleware/loggingMiddleware.js';

const app = express();
const port = 3001;

// Middleware
app.use((req, res, next) => {
  log(`Request: ${req.method} ${req.url}`);
  next();
});

// Routes
app.get('/', (req, res) => {
  res.send('Backend Test Submission Running with Logging Middleware!');
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
