import { useState, useEffect } from 'react';
import { expertiseAPI } from '../services/api';
import { Plus, Edit2, Trash2, X } from 'lucide-react';

const iconOptions = ['Code', 'Layout', 'Brain', 'Terminal', 'Server', 'Database'];

const Expertise = () => {
  const [expertise, setExpertise] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    points: '',
    iconKey: 'Code',
    order: 0,
    isActive: true
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [deleteTargetName, setDeleteTargetName] = useState('');

  useEffect(() => {
    fetchExpertise();
  }, []);

  const fetchExpertise = async () => {
    try {
      const data = await expertiseAPI.getAll();
      setExpertise(data);
    } catch (error) {
      console.error('Error fetching expertise:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const points = formData.points
        .split('\n')
        .map(p => p.trim())
        .filter(p => p);

      const expertiseData = {
        ...formData,
        points,
        order: parseInt(formData.order) || 0
      };

      if (editingItem) {
        await expertiseAPI.update(editingItem._id, expertiseData);
      } else {
        await expertiseAPI.create(expertiseData);
      }

      resetForm();
      fetchExpertise();
    } catch (error) {
      alert(error.message || 'Failed to save expertise');
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description,
      points: item.points.join('\n'),
      iconKey: item.iconKey,
      order: item.order || 0,
      isActive: item.isActive
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!id) {
      return;
    }
    
    try {
      await expertiseAPI.delete(id);
      fetchExpertise();
      setShowDeleteConfirm(false);
      setDeleteTargetId(null);
      setDeleteTargetName('');
    } catch (error) {
      setShowDeleteConfirm(false);
      setDeleteTargetId(null);
      setDeleteTargetName('');
    }
  };

  const confirmDelete = (id, name) => {
    if (!id) {
      return;
    }
    setDeleteTargetId(id);
    setDeleteTargetName(name || 'this expertise');
    setShowDeleteConfirm(true);
  };

  const executeDelete = () => {
    if (deleteTargetId) {
      handleDelete(deleteTargetId);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      points: '',
      iconKey: 'Code',
      order: 0,
      isActive: true
    });
    setEditingItem(null);
    setShowForm(false);
  };

  if (loading) {
    return <div className="text-center py-20 text-gray-400">Loading expertise...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-4xl font-black mb-2">TECHNICAL EXPERTISE</h2>
          <p className="text-gray-500">Manage expertise categories</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-6 py-3 bg-emerald-500 text-black font-black rounded-lg hover:bg-emerald-400 transition-all flex items-center gap-2"
        >
          <Plus size={20} />
          Add Expertise
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-black border border-white/10 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black">
                {editingItem ? 'EDIT EXPERTISE' : 'ADD EXPERTISE'}
              </h3>
              <button onClick={resetForm} className="text-gray-400 hover:text-white">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  placeholder="e.g., AI & Machine Learning"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  rows={3}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500 resize-none"
                  placeholder="Creating intelligent solutions with machine learning..."
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">Capabilities (one per line) *</label>
                <textarea
                  value={formData.points}
                  onChange={(e) => setFormData({ ...formData, points: e.target.value })}
                  required
                  rows={5}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500 font-mono text-sm"
                  placeholder="Machine Learning&#10;Data Analysis&#10;Model Training&#10;Python ML"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">Icon</label>
                <select
                  value={formData.iconKey}
                  onChange={(e) => setFormData({ ...formData, iconKey: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                >
                  {iconOptions.map(icon => (
                    <option key={icon} value={icon}>{icon}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">Display Order</label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="active"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-5 h-5 rounded bg-white/5 border-white/10 text-emerald-500 focus:ring-emerald-500"
                />
                <label htmlFor="active" className="text-sm font-bold text-gray-300">
                  Active / Visible
                </label>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-emerald-500 text-black font-black rounded-lg hover:bg-emerald-400 transition-all"
                >
                  {editingItem ? 'UPDATE' : 'CREATE'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 py-3 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all font-bold"
                >
                  CANCEL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {expertise.map((item) => (
          <div
            key={item._id}
            className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-black text-white mb-1">{item.title}</h3>
                <p className="text-gray-400 text-sm">{item.description}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(item)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-all"
                >
                  <Edit2 size={16} className="text-emerald-400" />
                </button>
                <button
                  onClick={() => {
                    if (item && item._id) {
                      confirmDelete(item._id, item.title || 'this expertise');
                    }
                  }}
                  className="p-2 hover:bg-white/10 rounded-lg transition-all"
                >
                  <Trash2 size={16} className="text-red-400" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
              {item.points.map((point, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <span className="text-emerald-500">✓</span>
                  <span className="text-gray-300">{point}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-4 text-xs text-gray-500">
              <span>Icon: <span className="text-emerald-400 font-bold">{item.iconKey}</span></span>
              <span>Order: <span className="text-emerald-400 font-bold">{item.order}</span></span>
              <span>Status: {item.isActive ? (
                <span className="text-emerald-400 font-bold">Active</span>
              ) : (
                <span className="text-gray-500">Inactive</span>
              )}</span>
            </div>
          </div>
        ))}
      </div>

      {expertise.length === 0 && (
        <div className="text-center py-20 text-gray-500">
          No expertise found. Click "Add Expertise" to create one.
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-black border border-white/10 rounded-2xl p-8 max-w-md w-full">
            <h3 className="text-2xl font-black mb-4">Confirm Delete</h3>
            <p className="text-gray-400 mb-6">
              Are you sure you want to delete {deleteTargetName}? This action cannot be undone.
            </p>
            <div className="flex gap-4">
              <button
                onClick={executeDelete}
                className="flex-1 px-6 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-xl transition-all font-bold"
              >
                Yes
              </button>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteTargetId(null);
                  setDeleteTargetName('');
                }}
                className="flex-1 px-6 py-3 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl transition-all font-bold"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-black border border-white/10 rounded-2xl p-8 max-w-md w-full">
            <h3 className="text-2xl font-black mb-4">Confirm Delete</h3>
            <p className="text-gray-400 mb-6">
              Are you sure you want to delete {deleteTargetName}? This action cannot be undone.
            </p>
            <div className="flex gap-4">
              <button
                onClick={executeDelete}
                className="flex-1 px-6 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-xl transition-all font-bold"
              >
                Yes
              </button>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteTargetId(null);
                  setDeleteTargetName('');
                }}
                className="flex-1 px-6 py-3 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl transition-all font-bold"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Expertise;

