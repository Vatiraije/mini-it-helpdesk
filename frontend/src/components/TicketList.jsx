import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TicketDetail from './TicketDetail';
import { Plus, Filter, AlertCircle, RefreshCw, X } from 'lucide-react';

function TicketList({ user }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter states
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  // Selected ticket for detail modal/drawer
  const [selectedTicket, setSelectedTicket] = useState(null);

  // New ticket modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTicketTitle, setNewTicketTitle] = useState('');
  const [newTicketDesc, setNewTicketDesc] = useState('');
  const [newTicketCategory, setNewTicketCategory] = useState('Software');
  const [newTicketPriority, setNewTicketPriority] = useState('Medium');
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');

  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError('');
      let url = '/api/tickets';
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (priorityFilter) params.priority = priorityFilter;

      const response = await axios.get(url, { params });
      setTickets(response.data);

      // If we currently have a ticket selected, update its reference in case status changed
      if (selectedTicket) {
        const updatedSelected = response.data.find(t => t.id === selectedTicket.id);
        if (updatedSelected) {
          setSelectedTicket(updatedSelected);
        }
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load tickets. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [statusFilter, priorityFilter]);

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    setCreateError('');
    setCreateLoading(true);

    try {
      await axios.post('/api/tickets', {
        title: newTicketTitle,
        description: newTicketDesc,
        category: newTicketCategory,
        priority: newTicketPriority
      });

      // Clear fields and close modal
      setNewTicketTitle('');
      setNewTicketDesc('');
      setNewTicketCategory('Software');
      setNewTicketPriority('Medium');
      setShowCreateModal(false);

      // Reload list
      fetchTickets();
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.error) {
        setCreateError(err.response.data.error);
      } else {
        setCreateError('Failed to create ticket. Please check input values.');
      }
    } finally {
      setCreateLoading(false);
    }
  };

  // Color mappings
  const priorityBadges = {
    'High': 'bg-rose-50 text-rose-700 border-rose-200',
    'Medium': 'bg-amber-50 text-amber-700 border-amber-200',
    'Low': 'bg-slate-50 text-slate-700 border-slate-200'
  };

  const statusBadges = {
    'Open': 'bg-yellow-50 text-yellow-700 border-yellow-200',
    'In Progress': 'bg-blue-50 text-blue-700 border-blue-200',
    'Resolved': 'bg-emerald-50 text-emerald-700 border-emerald-200'
  };

  const categoryTags = {
    'Hardware': 'bg-pink-50 text-pink-700 border-pink-100',
    'Software': 'bg-violet-50 text-violet-700 border-violet-100',
    'Network': 'bg-cyan-50 text-cyan-700 border-cyan-100'
  };

  return (
    <div className="space-y-6">
      
      {/* Top action row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Support Tickets</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {user.role === 'agent' 
              ? 'Manage and assign tickets submitted by users.' 
              : 'Submit and check the status of your tickets.'}
          </p>
        </div>
        
        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={fetchTickets}
            className="p-2.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-50 rounded-lg border border-slate-200 transition-all duration-150"
            title="Refresh tickets"
          >
            <RefreshCw className="h-5 w-5" />
          </button>
          
          {user.role === 'employee' && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center space-x-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold shadow-md shadow-indigo-100 transition-all duration-150"
            >
              <Plus className="h-4 w-4" />
              <span>Create Ticket</span>
            </button>
          )}
        </div>
      </div>

      {/* Filters row */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="flex items-center space-x-2 text-slate-500 mr-2 shrink-0">
          <Filter className="h-4 w-4" />
          <span className="text-xs font-bold uppercase tracking-wider">Filters</span>
        </div>

        <div className="flex flex-wrap gap-4 items-center w-full">
          {/* Status filter */}
          <div className="flex flex-col space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            >
              <option value="">All Statuses</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>

          {/* Priority filter */}
          <div className="flex flex-col space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Priority</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            >
              <option value="">All Priorities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          {(statusFilter || priorityFilter) && (
            <button
              onClick={() => {
                setStatusFilter('');
                setPriorityFilter('');
              }}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold hover:underline mt-4 md:mt-0"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center space-x-2">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
        </div>
      )}

      {/* Tickets List */}
      {loading && tickets.length === 0 ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : tickets.length === 0 ? (
        <div className="bg-white py-16 px-4 text-center rounded-xl border border-slate-200 shadow-sm">
          <p className="text-slate-400 font-medium">No tickets found matching the filters.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
          {tickets.map((ticket) => (
            <div
              key={ticket.id}
              onClick={() => setSelectedTicket(ticket)}
              className={`p-5 hover:bg-slate-50/50 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-150 ${
                selectedTicket && selectedTicket.id === ticket.id ? 'bg-indigo-50/40 border-l-4 border-l-indigo-600 pl-4' : ''
              }`}
            >
              {/* Ticket content */}
              <div className="space-y-2 max-w-xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`px-2 py-0.5 border text-xs rounded-md font-semibold ${categoryTags[ticket.category]}`}>
                    {ticket.category}
                  </span>
                  <span className={`px-2 py-0.5 border text-xs rounded-md font-semibold ${priorityBadges[ticket.priority]}`}>
                    {ticket.priority} Priority
                  </span>
                  <span className={`px-2 py-0.5 border text-xs rounded-md font-semibold ${statusBadges[ticket.status]}`}>
                    {ticket.status}
                  </span>
                </div>
                
                <h3 className="font-bold text-slate-800 text-base leading-snug hover:text-indigo-600 transition-colors">
                  {ticket.title}
                </h3>
                
                <p className="text-xs text-slate-400">
                  Opened by <span className="font-medium text-slate-600">{ticket.created_by_name}</span> on {new Date(ticket.created_at).toLocaleDateString()}
                  {ticket.assigned_to_name && (
                    <> • Assigned to <span className="font-medium text-slate-600">{ticket.assigned_to_name}</span></>
                  )}
                </p>
              </div>

              {/* Detail peek / info indicator */}
              <div className="text-right shrink-0">
                <span className="text-xs text-indigo-600 font-semibold hover:underline block md:inline">
                  View details &rarr;
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Selected Ticket Drawer / Modal */}
      {selectedTicket && (
        <TicketDetail
          ticket={selectedTicket}
          user={user}
          onClose={() => setSelectedTicket(null)}
          onUpdate={fetchTickets}
        />
      )}

      {/* Submit Ticket Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden transition-all duration-300">
            {/* Modal header */}
            <div className="px-6 py-4 bg-indigo-600 text-white flex justify-between items-center">
              <h3 className="text-lg font-bold">Submit New Support Ticket</h3>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="p-1 hover:bg-white/10 rounded-lg text-white/80 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal body */}
            <form onSubmit={handleCreateTicket} className="p-6 space-y-4">
              {createError && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg flex items-start space-x-2 text-sm">
                  <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                  <span>{createError}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Ticket Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Screen flickering when connected to HDMI"
                  value={newTicketTitle}
                  onChange={(e) => setNewTicketTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Category</label>
                  <select
                    value={newTicketCategory}
                    onChange={(e) => setNewTicketCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-sm"
                  >
                    <option value="Hardware">Hardware</option>
                    <option value="Software">Software</option>
                    <option value="Network">Network</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Priority</label>
                  <select
                    value={newTicketPriority}
                    onChange={(e) => setNewTicketPriority(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-sm"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Description</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Provide detailed information about the problem you are experiencing..."
                  value={newTicketDesc}
                  onChange={(e) => setNewTicketDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-sm resize-none"
                ></textarea>
              </div>

              {/* Modal footer */}
              <div className="border-t border-slate-100 pt-4 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg text-sm font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold shadow-md shadow-indigo-100 transition-colors disabled:opacity-50"
                >
                  {createLoading ? 'Submitting...' : 'Submit Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default TicketList;
