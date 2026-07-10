const db = require('./db');
const bcrypt = require('bcryptjs');

function initDb() {
  // Create users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('employee', 'agent')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create tickets table
  db.exec(`
    CREATE TABLE IF NOT EXISTS tickets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      priority TEXT NOT NULL CHECK(priority IN ('Low', 'Medium', 'High')),
      category TEXT NOT NULL CHECK(category IN ('Hardware', 'Software', 'Network')),
      status TEXT NOT NULL DEFAULT 'Open' CHECK(status IN ('Open', 'In Progress', 'Resolved')),
      created_by INTEGER NOT NULL,
      assigned_to INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES users(id),
      FOREIGN KEY (assigned_to) REFERENCES users(id)
    )
  `);

  // Check if users exist. If not, seed them.
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
  if (userCount === 0) {
    console.log('No users found. Seeding demo users...');
    const salt = bcrypt.genSaltSync(10);
    const agentPasswordHash = bcrypt.hashSync('agent123', salt);
    const employeePasswordHash = bcrypt.hashSync('employee123', salt);

    const insertUser = db.prepare('INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?) RETURNING id');
    const agentId = insertUser.get('Alice Helpdesk', 'agent@helpdesk.com', agentPasswordHash, 'agent').id;
    const employeeId = insertUser.get('Bob Intern', 'employee@helpdesk.com', employeePasswordHash, 'employee').id;

    console.log(`Demo users seeded: Agent ID = ${agentId}, Employee ID = ${employeeId}`);

    // Check if tickets exist. If not, seed them.
    const ticketCount = db.prepare('SELECT COUNT(*) as count FROM tickets').get().count;
    if (ticketCount === 0) {
      console.log('No tickets found. Seeding sample tickets...');
      const insertTicket = db.prepare(`
        INSERT INTO tickets (title, description, priority, category, status, created_by, assigned_to, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const tickets = [
        {
          title: "Keyboard keys are sticky and unresponsive",
          description: "Several keys (E, R, spacebar) on my external mechanical keyboard are sticking and not registering unless pressed very hard.",
          priority: "Low",
          category: "Hardware",
          status: "Open",
          created_by: employeeId,
          assigned_to: null,
          created_at: '2026-07-01 09:00:00',
          updated_at: '2026-07-01 09:00:00'
        },
        {
          title: "VPN connection drops every 5 minutes",
          description: "When connecting from my home office, the corporate VPN connects successfully but then disconnects after exactly 5 minutes with a TLS handshake error.",
          priority: "High",
          category: "Network",
          status: "In Progress",
          created_by: employeeId,
          assigned_to: agentId,
          created_at: '2026-07-02 10:15:00',
          updated_at: '2026-07-03 14:30:00'
        },
        {
          title: "Request for Slack Pro license",
          description: "Need a Slack Pro license to join external channels for the partner team project. Approved by team lead.",
          priority: "Medium",
          category: "Software",
          status: "Resolved",
          created_by: employeeId,
          assigned_to: agentId,
          created_at: '2026-07-03 08:30:00',
          updated_at: '2026-07-04 11:20:00'
        },
        {
          title: "Blue screen of death on startup",
          description: "My developer laptop displays a blue screen with error code PAGE_FAULT_IN_NONPAGED_AREA during Windows boot loop.",
          priority: "High",
          category: "Hardware",
          status: "In Progress",
          created_by: employeeId,
          assigned_to: agentId,
          created_at: '2026-07-04 11:00:00',
          updated_at: '2026-07-05 09:15:00'
        },
        {
          title: "Cannot print to second floor printer",
          description: "I can see the printer 'PRINTER-2F-COLOR' in my list, but when I send a print job, it stays stuck in the queue with error 'Offline'.",
          priority: "Medium",
          category: "Network",
          status: "Open",
          created_by: employeeId,
          assigned_to: null,
          created_at: '2026-07-05 13:45:00',
          updated_at: '2026-07-05 13:45:00'
        },
        {
          title: "External monitor flickering",
          description: "My Dell 27-inch monitor flickering black for 2-3 seconds at random intervals. I've tried changing the HDMI cable, but it didn't help.",
          priority: "Medium",
          category: "Hardware",
          status: "In Progress",
          created_by: employeeId,
          assigned_to: agentId,
          created_at: '2026-07-06 10:00:00',
          updated_at: '2026-07-07 16:00:00'
        },
        {
          title: "Intranet page is slow to load",
          description: "The main corporate employee intranet portal takes over 15 seconds to open files or search directories.",
          priority: "Low",
          category: "Network",
          status: "Resolved",
          created_by: employeeId,
          assigned_to: agentId,
          created_at: '2026-07-02 15:20:00',
          updated_at: '2026-07-03 10:10:00'
        },
        {
          title: "Visual Studio 2022 setup hangs at 89%",
          description: "Trying to install the workload for Desktop development, but installer stays at 89% for 3 hours. No error message.",
          priority: "Medium",
          category: "Software",
          status: "Open",
          created_by: employeeId,
          assigned_to: null,
          created_at: '2026-07-07 09:30:00',
          updated_at: '2026-07-07 09:30:00'
        },
        {
          title: "Outlook mobile won't sync emails",
          description: "Emails stopped syncing on my iPhone Outlook app. I can send, but incoming emails don't load. Server status is green.",
          priority: "Low",
          category: "Software",
          status: "Open",
          created_by: employeeId,
          assigned_to: null,
          created_at: '2026-07-07 14:10:00',
          updated_at: '2026-07-07 14:10:00'
        },
        {
          title: "Docker Desktop requires admin rights to update",
          description: "A prompt for Windows Administrator credentials popped up for Docker Desktop v4.30 update. Need admin password input.",
          priority: "Medium",
          category: "Software",
          status: "Resolved",
          created_by: employeeId,
          assigned_to: agentId,
          created_at: '2026-07-04 16:50:00',
          updated_at: '2026-07-05 10:00:00'
        },
        {
          title: "Conference Room A Wi-Fi constantly disconnecting",
          description: "Users in Conference Room A report that their laptops disconnect from the 'Corp-WiFi' network every 10 minutes.",
          priority: "High",
          category: "Network",
          status: "Open",
          created_by: employeeId,
          assigned_to: null,
          created_at: '2026-07-08 08:20:00',
          updated_at: '2026-07-08 08:20:00'
        },
        {
          title: "Active Directory password reset",
          description: "Locked out of my workstation after typing the password wrong 3 times. Need an account unlock and temporary password.",
          priority: "Low",
          category: "Software",
          status: "Resolved",
          created_by: employeeId,
          assigned_to: agentId,
          created_at: '2026-07-06 09:00:00',
          updated_at: '2026-07-06 09:15:00'
        },
        {
          title: "Trackpad on work laptop is unresponsive",
          description: "The mouse cursor does not move at all when using the built-in trackpad. An external USB mouse works fine.",
          priority: "Medium",
          category: "Hardware",
          status: "Open",
          created_by: employeeId,
          assigned_to: null,
          created_at: '2026-07-08 09:45:00',
          updated_at: '2026-07-08 09:45:00'
        },
        {
          title: "Cannot connect to AWS RDS Postgres database",
          description: "Database client throws connection timeout errors when trying to connect to dev database instance. IP might not be whitelisted.",
          priority: "High",
          category: "Network",
          status: "Resolved",
          created_by: employeeId,
          assigned_to: agentId,
          created_at: '2026-07-05 11:30:00',
          updated_at: '2026-07-05 13:00:00'
        },
        {
          title: "Excel throwing license expired warning",
          description: "Microsoft 365 apps display 'Product Deactivated' banner. I am logged in with my corporate email.",
          priority: "Medium",
          category: "Software",
          status: "Open",
          created_by: employeeId,
          assigned_to: null,
          created_at: '2026-07-08 10:15:00',
          updated_at: '2026-07-08 10:15:00'
        },
        {
          title: "External backup hard drive is not detected",
          description: "The 2TB Seagate backup drive does not show up in Windows Explorer when plugged in via USB-C. Disk Management shows it as Unallocated.",
          priority: "Low",
          category: "Hardware",
          status: "Open",
          created_by: employeeId,
          assigned_to: null,
          created_at: '2026-07-08 10:30:00',
          updated_at: '2026-07-08 10:30:00'
        },
        {
          title: "Jira access request for new QA intern",
          description: "Please provision a Jira Software license and add the user 'qa-intern@company.com' to the mobile project board.",
          priority: "Low",
          category: "Software",
          status: "In Progress",
          created_by: employeeId,
          assigned_to: agentId,
          created_at: '2026-07-07 16:30:00',
          updated_at: '2026-07-08 09:00:00'
        }
      ];

      for (const t of tickets) {
        insertTicket.run(
          t.title,
          t.description,
          t.priority,
          t.category,
          t.status,
          t.created_by,
          t.assigned_to,
          t.created_at,
          t.updated_at
        );
      }
      console.log('Sample tickets successfully seeded!');
    }
  }
}

module.exports = initDb;
