import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Ticket, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

function Dashboard({ user }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('token');

      const response = await axios.get('http://localhost:5000/api/dashboard/stats', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setStats(response.data);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      if (err.response) {
        console.error('Status:', err.response.status);
        console.error('Data:', err.response.data);
      }
      setError('Failed to fetch dashboard statistics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center space-x-2">
        <AlertCircle className="h-5 w-5" />
        <span>{error || 'No statistics data available.'}</span>
      </div>
    );
  }

  const { summary, byStatus, byCategory } = stats;

  const STATUS_COLORS = {
    'Open': '#f59e0b',
    'In Progress': '#3b82f6',
    'Resolved': '#10b981'
  };

  const CATEGORY_COLORS = {
    'Hardware': '#ec4899',
    'Software': '#8b5cf6',
    'Network': '#06b6d4'
  };

  const statusPieData = byStatus.map(item => ({
    name: item.name,
    value: item.count,
    color: STATUS_COLORS[item.name] || '#64748b'
  }));

  const categoryBarData = byCategory.map(item => ({
    name: item.name,
    count: item.count,
    fill: CATEGORY_COLORS[item.name] || '#64748b'
  }));

  const cards = [
    {
      title: 'Total Tickets',
      value: summary.total,
      icon: <Ticket className="h-6 w-6 text-indigo-600" />,
      bg: 'bg-indigo-50 border-indigo-100',
      labelColor: 'text-indigo-900'
    },
    {
      title: 'Open Tickets',
      value: summary.open,
      icon: <AlertCircle className="h-6 w-6 text-amber-600" />,
      bg: 'bg-amber-50 border-amber-100',
      labelColor: 'text-amber-900'
    },
    {
      title: 'In Progress',
      value: summary.inProgress,
      icon: <Clock className="h-6 w-6 text-blue-600" />,
      bg: 'bg-blue-50 border-blue-100',
      labelColor: 'text-blue-900'
    },
    {
      title: 'Resolved Tickets',
      value: summary.resolved,
      icon: <CheckCircle2 className="h-6 w-6 text-emerald-600" />,
      bg: 'bg-emerald-50 border-emerald-100',
      labelColor: 'text-emerald-900'
    }
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 mt-1">
          {user.role === 'agent'
            ? 'Overview of all tickets across the organization.'
            : 'Overview of your submitted support requests.'}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, i) => (
          <div key={i} className={`p-6 rounded-xl border ${card.bg} flex items-center justify-between shadow-sm`}>
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{card.title}</p>
              <h3 className={`text-3xl font-black mt-2 ${card.labelColor}`}>{card.value}</h3>
            </div>
            <div className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm shrink-0">
              {card.icon}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col h-[400px]">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Tickets by Status</h3>
          <div className="flex-1 min-h-0">
            {summary.total > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [`${value} Ticket(s)`, 'Count']}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                  />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                No tickets to display.
              </div>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col h-[400px]">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Tickets by Category</h3>
          <div className="flex-1 min-h-0">
            {summary.total > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryBarData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip
                    formatter={(value) => [`${value} Ticket(s)`, 'Count']}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                    cursor={{ fill: '#f8fafc' }}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {categoryBarData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                No tickets to display.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
