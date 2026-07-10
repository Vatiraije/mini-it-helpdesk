import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, User, Calendar, Tag, ShieldAlert, Award, AlertCircle, Check } from 'lucide-react';

function TicketDetail({ ticket, user, onClose, onUpdate }) {
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState(ticket.assigned_to || '');
  const [selectedStatus, setSelectedStatus] = useState(ticket.status);
  const [loadingAgents, setLoadingAgents] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const isAgent = user.role === 'agent';

  useEffect(() => {
    // Reset selections on ticket change
    setSelectedAgent(ticket.assigned_to || '');
    setSelectedStatus(ticket.status);
    setMessage('');
    setError('');

    // Fetch agents list if current user is an agent
    if (isAgent) {
      const fetchAgents = async () => {
        try {
          setLoadingAgents(true);
          const response = await axios.get('/api/users/agents');
          setAgents(response.data);
        } catch (err) {
          console.error(err);
          setError('Failed to fetch support agents list.');
        } finally {
          setLoadingAgents(false);
        }
      };
      fetchAgents();
    }
  }, [ticket, isAgent]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setSubmitting(true);

    try {
      const payload = {
        status: selectedStatus,
        assigned_to: selectedAgent === '' ? null : Number(selectedAgent)
      };

      await axios.put(`/api/tickets/${ticket.id}`, payload);
      setMessage('Ticket updated successfully!');
      
      // Notify parent to reload tickets list
      onUpdate();
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError('Failed to update ticket details.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const priorityColors = {
    'High': 'bg-rose-50 text-rose-700 border-rose-200',
    'Medium': 'bg-amber-50 text-amber-700 border-amber-200',
    'Low': 'bg-slate-50 text-slate-700 border-slate-200'
  };

  const statusColors = {
    'Open': 'bg-yellow-50 text-yellow-700 border-yellow-200',
    'In Progress': 'bg-blue-50 text-blue-700 border-blue-200',
    'Resolved': 'bg-emerald-50 text-emerald-700 border-emerald-200'
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full overflow-hidden transition-all duration-300">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Ticket Details</span>
            <h3 className="text-lg font-extrabold text-slate-800">Ticket #{ticket.id}</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-slate-200/60 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Main Info */}
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 leading-snug">{ticket.title}</h2>
            <div className="flex flex-wrap gap-2">
              <span className={`px-2 py-0.5 border text-xs rounded-md font-semibold bg-indigo-50 text-indigo-700 border-indigo-100`}>
                {ticket.category}
              </span>
              <span className={`px-2 py-0.5 border text-xs rounded-md font-semibold ${priorityColors[ticket.priority]}`}>
                {ticket.priority} Priority
              </span>
              <span className={`px-2 py-0.5 border text-xs rounded-md font-semibold ${statusColors[ticket.status]}`}>
                {ticket.status}
              </span>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 text-sm text-slate-700 whitespace-pre-wrap leading-relaxed mt-4">
              {ticket.description}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
            {/* Metadata (Read-only) */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Information</h4>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-2.5 text-sm text-slate-600">
                  <User className="h-4 w-4 text-slate-400 shrink-0" />
                  <div>
                    <p className="text-xs text-slate-400 font-medium leading-none">Submitted By</p>
                    <p className="font-semibold text-slate-800 mt-1">{ticket.created_by_name}</p>
                    <p className="text-xs text-slate-400">{ticket.created_by_email}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2.5 text-sm text-slate-600">
                  <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
                  <div>
                    <p className="text-xs text-slate-400 font-medium leading-none">Created On</p>
                    <p className="font-semibold text-slate-800 mt-1">{new Date(ticket.created_at).toLocaleString()}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2.5 text-sm text-slate-600">
                  <Award className="h-4 w-4 text-slate-400 shrink-0" />
                  <div>
                    <p className="text-xs text-slate-400 font-medium leading-none">Assigned Support Agent</p>
                    <p className="font-semibold text-slate-800 mt-1">
                      {ticket.assigned_to_name || <span className="text-slate-400 font-normal italic">Unassigned</span>}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions (Agent Edit Form) */}
            <div className="space-y-4 bg-slate-50/50 p-4 rounded-xl border border-slate-150">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ticket Management</h4>
              
              {isAgent ? (
                <form onSubmit={handleUpdate} className="space-y-4">
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 p-2.5 rounded-lg flex items-center space-x-1.5 text-xs">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  {message && (
                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-2.5 rounded-lg flex items-center space-x-1.5 text-xs">
                      <Check className="h-4 w-4 shrink-0" />
                      <span>{message}</span>
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">Status</label>
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="Open">Open</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">Assign Agent</label>
                    {loadingAgents ? (
                      <p className="text-xs text-slate-400">Loading agents...</p>
                    ) : (
                      <select
                        value={selectedAgent}
                        onChange={(e) => setSelectedAgent(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="">Unassigned</option>
                        {agents.map((agent) => (
                          <option key={agent.id} value={agent.id}>
                            {agent.name} ({agent.email})
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-xs transition-colors duration-150 shadow-md disabled:opacity-50"
                  >
                    {submitting ? 'Updating...' : 'Save Changes'}
                  </button>
                </form>
              ) : (
                <div className="space-y-2 text-xs text-slate-500">
                  <p>As an <strong className="text-slate-700 font-semibold">employee</strong>, you cannot update ticket assignments or status directly.</p>
                  <p>An IT agent will review and update this ticket. Please refresh the page periodically to check for updates.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex justify-end bg-slate-50">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-lg text-sm font-semibold transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}

export default TicketDetail;
