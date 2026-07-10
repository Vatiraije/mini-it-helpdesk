const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function runTests() {
  console.log('=== IT HELPDESK API VERIFICATION SYSTEM ===\n');
  
  let employeeToken = '';
  let agentToken = '';
  let createdTicketId = null;

  try {
    // 1. Employee Login
    console.log('1. Attempting Employee Login...');
    const loginEmpRes = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'employee@helpdesk.com',
      password: 'employee123'
    });
    employeeToken = loginEmpRes.data.token;
    console.log(`   [SUCCESS] Logged in as ${loginEmpRes.data.user.name} (${loginEmpRes.data.user.role})`);
    
    // Set employee auth header
    const empHeaders = { Authorization: `Bearer ${employeeToken}` };

    // 2. Submit New Ticket
    console.log('\n2. Submitting New Ticket as Employee...');
    const createRes = await axios.post(`${BASE_URL}/api/tickets`, {
      title: 'Printer jammed on the 3rd floor',
      description: 'The main printer in the hallway on the 3rd floor is showing a paper jam error code 0x44 and won\'t print anything.',
      category: 'Hardware',
      priority: 'High'
    }, { headers: empHeaders });
    
    createdTicketId = createRes.data.ticket.id;
    console.log(`   [SUCCESS] Ticket Created! ID: ${createdTicketId}, Status: ${createRes.data.ticket.status}, Category: ${createRes.data.ticket.category}`);

    // 3. View Tickets List as Employee
    console.log('\n3. Fetching Ticket List as Employee...');
    const ticketsEmpRes = await axios.get(`${BASE_URL}/api/tickets`, { headers: empHeaders });
    console.log(`   [SUCCESS] Retrieved ${ticketsEmpRes.data.length} tickets.`);
    const foundEmpTicket = ticketsEmpRes.data.find(t => t.id === createdTicketId);
    if (foundEmpTicket) {
      console.log(`   [SUCCESS] Found newly created ticket in list: "${foundEmpTicket.title}"`);
    } else {
      throw new Error('Newly created ticket not found in employee ticket list.');
    }

    // 4. Fetch Dashboard Stats as Employee
    console.log('\n4. Fetching Dashboard Stats as Employee...');
    const statsEmpRes = await axios.get(`${BASE_URL}/api/dashboard/stats`, { headers: empHeaders });
    console.log(`   [SUCCESS] Total employee tickets: ${statsEmpRes.data.summary.total}`);
    console.log('   Stats by Status:', JSON.stringify(statsEmpRes.data.byStatus));
    console.log('   Stats by Category:', JSON.stringify(statsEmpRes.data.byCategory));

    // 5. Agent Login
    console.log('\n5. Attempting Agent Login...');
    const loginAgentRes = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'agent@helpdesk.com',
      password: 'agent123'
    });
    agentToken = loginAgentRes.data.token;
    console.log(`   [SUCCESS] Logged in as ${loginAgentRes.data.user.name} (${loginAgentRes.data.user.role})`);
    
    // Set agent auth header
    const agentHeaders = { Authorization: `Bearer ${agentToken}` };

    // 6. Fetch Agents List (Agent only)
    console.log('\n6. Fetching Support Agents List...');
    const agentsRes = await axios.get(`${BASE_URL}/api/users/agents`, { headers: agentHeaders });
    console.log(`   [SUCCESS] Found ${agentsRes.data.length} support agent(s) available.`);
    const aliceAgent = agentsRes.data.find(a => a.email === 'agent@helpdesk.com');
    const aliceId = aliceAgent ? aliceAgent.id : null;
    console.log(`   Agent Alice Helpdesk ID is: ${aliceId}`);

    // 7. Update Ticket Status and Assignment (Agent only)
    console.log(`\n7. Updating Ticket #${createdTicketId} to 'In Progress' and assigning to Alice (ID: ${aliceId})...`);
    const updateRes = await axios.put(`${BASE_URL}/api/tickets/${createdTicketId}`, {
      status: 'In Progress',
      assigned_to: aliceId
    }, { headers: agentHeaders });
    
    console.log(`   [SUCCESS] Update Response: ${updateRes.data.message}`);
    console.log(`   Updated Ticket Details - Status: ${updateRes.data.ticket.status}, Assigned To: ${updateRes.data.ticket.assigned_to_name}`);

    // 8. Fetch Dashboard Stats as Agent
    console.log('\n8. Fetching Dashboard Stats as Agent...');
    const statsAgentRes = await axios.get(`${BASE_URL}/api/dashboard/stats`, { headers: agentHeaders });
    console.log(`   [SUCCESS] Total global tickets: ${statsAgentRes.data.summary.total}`);
    console.log('   Stats by Status:', JSON.stringify(statsAgentRes.data.byStatus));
    console.log('   Stats by Category:', JSON.stringify(statsAgentRes.data.byCategory));

    console.log('\n=== ALL API TESTS PASSED SUCCESSFULLY! ===');
  } catch (err) {
    console.error('\n   [FAILURE] Test failed with error:');
    if (err.response && err.response.data && err.response.data.error) {
      console.error(`   API Error: ${err.response.data.error}`);
    } else {
      console.error(`   Error message: ${err.message}`);
    }
    process.exit(1);
  }
}

runTests();
