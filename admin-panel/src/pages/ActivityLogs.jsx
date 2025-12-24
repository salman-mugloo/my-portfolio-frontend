import { useState, useEffect } from 'react';
import { Activity, ChevronDown, ChevronRight, ChevronLeft, Info } from 'lucide-react';
import { activityAPI } from '../services/api';

const ActivityLogs = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  });
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchActivityLogs();
  }, [page]);

  const fetchActivityLogs = async () => {
    try {
      setLoading(true);
      setMessage({ type: '', text: '' });
      
      const data = await activityAPI.getLogs(page, 20);
      setActivities(data.activities || []);
      setPagination(data.pagination || pagination);
    } catch (error) {
      console.error('Error fetching activity logs:', error);
      setMessage({ type: 'error', text: error.message || 'Failed to load activity logs' });
    } finally {
      setLoading(false);
    }
  };

  const toggleRow = (id) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatAction = (action) => {
    return action
      .split('_')
      .map(word => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ');
  };

  const getActionColor = (action) => {
    if (action.includes('SUCCESS')) return 'text-emerald-400';
    if (action.includes('FAILURE')) return 'text-red-400';
    if (action.includes('DELETE')) return 'text-orange-400';
    if (action.includes('UPLOAD') || action.includes('CHANGE')) return 'text-blue-400';
    return 'text-gray-400';
  };

  if (loading && activities.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading activity logs...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-black mb-2 flex items-center gap-3">
          <Activity className="text-emerald-400" size={36} />
          Activity Logs
        </h1>
        <p className="text-gray-500">View all admin activities and audit trail</p>
      </div>

      {message.text && (
        <div className={`mb-6 p-4 rounded-xl ${
          message.type === 'success' 
            ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' 
            : 'bg-red-500/10 border border-red-500/20 text-red-400'
        }`}>
          {message.text}
        </div>
      )}

      {activities.length === 0 ? (
        <div className="p-8 rounded-xl bg-white/5 border border-white/10 text-center">
          <Info className="mx-auto mb-4 text-gray-500" size={48} />
          <p className="text-gray-400">No activity logs found</p>
        </div>
      ) : (
        <>
          <div className="rounded-xl bg-white/5 border border-white/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5 border-b border-white/10">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-400">Date</th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-400">Admin</th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-400">Action</th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-400">IP Address</th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-400">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {activities.map((activity) => (
                    <>
                      <tr 
                        key={activity._id}
                        className="hover:bg-white/5 transition-colors cursor-pointer"
                        onClick={() => toggleRow(activity._id)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {formatDate(activity.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {activity.adminUsername}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`text-sm font-medium ${getActionColor(activity.action)}`}>
                            {formatAction(activity.action)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                          {activity.ipAddress || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {expandedRows.has(activity._id) ? (
                            <ChevronDown className="text-gray-400" size={20} />
                          ) : (
                            <ChevronRight className="text-gray-400" size={20} />
                          )}
                        </td>
                      </tr>
                      {expandedRows.has(activity._id) && (
                        <tr key={`${activity._id}-details`} className="bg-black/20">
                          <td colSpan="5" className="px-6 py-4">
                            <div className="space-y-3">
                              <div>
                                <h4 className="text-sm font-bold text-gray-400 mb-2">Metadata</h4>
                                <div className="bg-black/30 rounded-lg p-4">
                                  <pre className="text-xs text-gray-300 whitespace-pre-wrap">
                                    {JSON.stringify(activity.metadata, null, 2)}
                                  </pre>
                                </div>
                              </div>
                              {activity.userAgent && (
                                <div>
                                  <h4 className="text-sm font-bold text-gray-400 mb-2">User Agent</h4>
                                  <p className="text-xs text-gray-300 bg-black/30 rounded-lg p-3">
                                    {activity.userAgent}
                                  </p>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-gray-400">
                Showing {((page - 1) * pagination.limit) + 1} to {Math.min(page * pagination.limit, pagination.total)} of {pagination.total} entries
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={!pagination.hasPrev}
                  className={`px-4 py-2 rounded-lg border transition-all ${
                    pagination.hasPrev
                      ? 'border-white/10 bg-white/5 hover:bg-white/10 text-white'
                      : 'border-white/5 bg-white/5 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <ChevronLeft size={20} />
                </button>
                <span className="px-4 py-2 text-sm text-gray-400">
                  Page {page} of {pagination.totalPages}
                </span>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={!pagination.hasNext}
                  className={`px-4 py-2 rounded-lg border transition-all ${
                    pagination.hasNext
                      ? 'border-white/10 bg-white/5 hover:bg-white/10 text-white'
                      : 'border-white/5 bg-white/5 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ActivityLogs;

