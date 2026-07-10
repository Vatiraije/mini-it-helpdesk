const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const initDb = require('./initDb');

// Load environment variables
dotenv.config();

// Initialize the database tables and seed sample data
try {
  initDb();
  console.log('Database successfully initialized/checked.');
} catch (err) {
  console.error('Failed to initialize database:', err);
}

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Import controllers and middlewares
const { register, login } = require('./controllers/authController');
const { getTickets, createTicket, updateTicket, getDashboardStats, getAgents } = require('./controllers/ticketController');
const { authenticateToken, requireRole } = require('./middleware/authMiddleware');

// Auth routes (public)
app.post('/api/auth/register', register);
app.post('/api/auth/login', login);

// Authenticated ticket and stats routes
app.get('/api/tickets', authenticateToken, getTickets);
app.post('/api/tickets', authenticateToken, createTicket);
app.get('/api/dashboard/stats', authenticateToken, getDashboardStats);

// Agent-only routes
app.put('/api/tickets/:id', authenticateToken, requireRole('agent'), updateTicket);
app.get('/api/users/agents', authenticateToken, requireRole('agent'), getAgents);

// Basic health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date() });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'An internal server error occurred.' });
});

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
