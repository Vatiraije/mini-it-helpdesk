const db = require('../db');

function getTickets(req, res) {
  let query = `
    SELECT 
      t.*, 
      u1.name AS created_by_name, 
      u1.email AS created_by_email,
      u2.name AS assigned_to_name,
      u2.email AS assigned_to_email
    FROM tickets t
    JOIN users u1 ON t.created_by = u1.id
    LEFT JOIN users u2 ON t.assigned_to = u2.id
    WHERE 1=1
  `;
  const params = [];

  // Employees can only view their own tickets
  if (req.user.role === 'employee') {
    query += ' AND t.created_by = ?';
    params.push(req.user.id);
  }

  // Filters
  if (req.query.status) {
    query += ' AND t.status = ?';
    params.push(req.query.status);
  }

  if (req.query.priority) {
    query += ' AND t.priority = ?';
    params.push(req.query.priority);
  }

  // Sort: newest first
  query += ' ORDER BY t.created_at DESC';

  try {
    const tickets = db.prepare(query).all(...params);
    res.status(200).json(tickets);
  } catch (err) {
    console.error('Fetch tickets error:', err);
    res.status(500).json({ error: 'Database error occurred while fetching tickets' });
  }
}

function createTicket(req, res) {
  const { title, description, priority, category } = req.body;

  if (!title || !description || !priority || !category) {
    return res.status(400).json({ error: 'All fields (title, description, priority, category) are required' });
  }

  if (!['Low', 'Medium', 'High'].includes(priority)) {
    return res.status(400).json({ error: 'Invalid priority. Must be Low, Medium, or High' });
  }

  if (!['Hardware', 'Software', 'Network'].includes(category)) {
    return res.status(400).json({ error: 'Invalid category. Must be Hardware, Software, or Network' });
  }

  try {
    const stmt = db.prepare(`
      INSERT INTO tickets (title, description, priority, category, status, created_by, assigned_to)
      VALUES (?, ?, ?, ?, 'Open', ?, NULL)
      RETURNING id
    `);
    const result = stmt.get(title.trim(), description.trim(), priority, category, req.user.id);

    const newTicket = db.prepare(`
      SELECT 
        t.*, 
        u1.name AS created_by_name, 
        u1.email AS created_by_email,
        u2.name AS assigned_to_name,
        u2.email AS assigned_to_email
      FROM tickets t
      JOIN users u1 ON t.created_by = u1.id
      LEFT JOIN users u2 ON t.assigned_to = u2.id
      WHERE t.id = ?
    `).get(result.id);

    res.status(201).json({ message: 'Ticket created successfully', ticket: newTicket });
  } catch (err) {
    console.error('Create ticket error:', err);
    res.status(500).json({ error: 'Database error occurred while creating ticket' });
  }
}

function updateTicket(req, res) {
  const { id } = req.params;
  const { status, assigned_to } = req.body;

  // Check if ticket exists
  const ticket = db.prepare('SELECT * FROM tickets WHERE id = ?').get(id);
  if (!ticket) {
    return res.status(404).json({ error: 'Ticket not found' });
  }

  const updates = [];
  const params = [];

  if (status !== undefined) {
    if (!['Open', 'In Progress', 'Resolved'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    updates.push('status = ?');
    params.push(status);
  }

  if (assigned_to !== undefined) {
    if (assigned_to !== null) {
      // Check if assigned_to is an agent
      const agent = db.prepare(`SELECT * FROM users WHERE id = ? AND role = 'agent'`).get(assigned_to);
      if (!agent) {
        return res.status(400).json({ error: 'Assigned user must be an agent' });
      }
    }
    updates.push('assigned_to = ?');
    params.push(assigned_to);
  }

  if (updates.length === 0) {
    return res.status(400).json({ error: 'No update parameters provided' });
  }

  updates.push('updated_at = CURRENT_TIMESTAMP');
  params.push(id);

  try {
    const query = `UPDATE tickets SET ${updates.join(', ')} WHERE id = ?`;
    db.prepare(query).run(...params);

    const updatedTicket = db.prepare(`
      SELECT 
        t.*, 
        u1.name AS created_by_name, 
        u1.email AS created_by_email,
        u2.name AS assigned_to_name,
        u2.email AS assigned_to_email
      FROM tickets t
      JOIN users u1 ON t.created_by = u1.id
      LEFT JOIN users u2 ON t.assigned_to = u2.id
      WHERE t.id = ?
    `).get(id);

    res.status(200).json({ message: 'Ticket updated successfully', ticket: updatedTicket });
  } catch (err) {
    console.error('Update ticket error:', err);
    res.status(500).json({ error: 'Database error occurred while updating ticket' });
  }
}

function getDashboardStats(req, res) {
  try {
    let statusQuery = 'SELECT status, COUNT(*) AS count FROM tickets';
    let categoryQuery = 'SELECT category, COUNT(*) AS count FROM tickets';
    const params = [];

    // Employees see stats based only on their tickets
    if (req.user.role === 'employee') {
      statusQuery += ' WHERE created_by = ?';
      categoryQuery += ' WHERE created_by = ?';
      params.push(req.user.id);
    }

    statusQuery += ' GROUP BY status';
    categoryQuery += ' GROUP BY category';

    const statusCounts = db.prepare(statusQuery).all(...params);
    const categoryCounts = db.prepare(categoryQuery).all(...params);

    const byStatus = ['Open', 'In Progress', 'Resolved'].map(status => {
      const match = statusCounts.find(r => r.status === status);
      return { name: status, count: match ? match.count : 0 };
    });

    const byCategory = ['Hardware', 'Software', 'Network'].map(category => {
      const match = categoryCounts.find(r => r.category === category);
      return { name: category, count: match ? match.count : 0 };
    });

    // Summary counts — using single quotes for string literals
    let summaryQuery = `
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status='Open' THEN 1 ELSE 0 END) as open,
        SUM(CASE WHEN status='In Progress' THEN 1 ELSE 0 END) as inProgress,
        SUM(CASE WHEN status='Resolved' THEN 1 ELSE 0 END) as resolved
      FROM tickets
    `;

    let summary;
    if (req.user.role === 'employee') {
      summaryQuery += ' WHERE created_by = ?';
      summary = db.prepare(summaryQuery).get(req.user.id);
    } else {
      summary = db.prepare(summaryQuery).get();
    }

    res.status(200).json({
      byStatus,
      byCategory,
      summary: {
        total: summary.total || 0,
        open: summary.open || 0,
        inProgress: summary.inProgress || 0,
        resolved: summary.resolved || 0
      }
    });
  } catch (err) {
    console.error('Fetch dashboard stats error:', err);
    res.status(500).json({ error: 'Database error occurred while fetching dashboard stats' });
  }
}

function getAgents(req, res) {
  try {
    const agents = db.prepare(`SELECT id, name, email FROM users WHERE role = 'agent'`).all();
    res.status(200).json(agents);
  } catch (err) {
    console.error('Fetch agents error:', err);
    res.status(500).json({ error: 'Database error occurred while fetching agents' });
  }
}

module.exports = {
  getTickets,
  createTicket,
  updateTicket,
  getDashboardStats,
  getAgents
};