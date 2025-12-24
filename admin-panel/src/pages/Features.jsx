import { useState, useEffect } from 'react';
import { featuresAPI } from '../services/api';
import { Plus, Edit2, Trash2, X, Code, ShieldCheck, Activity, Users } from 'lucide-react';

const iconOptions = [
  { value: 'Code', label: 'Code', icon: Code },
  { value: 'ShieldCheck', label: 'Security', icon: ShieldCheck },
  { value: 'Activity', label: 'Performance', icon: Activity },
  { value: 'Users', label: 'Users', icon: Users }
];

const Features = () => {
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingFeature, setEditingFeature] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [deleteTargetName, setDeleteTargetName] = useState('');
  const [formData, setFormData] = useState({
    label: '',
    tooltip: '',
    icon: 'Code',
    order: 0,
    isActive: true
  });

  useEffect(() => {
    fetchFeatures();
  }, []);

  const fetchFeatures = async () => {
    try {
      setLoading(true);
      setMessage({ type: '', text: '' });
      const data = await featuresAPI.getAll();
      setFeatures(data || []);
    } catch (error) {
      console.error('Error fetching features:', error);
      const errorMessage = error.message || 'Failed to load features';
      if (errorMessage.includes('Not authorized') || errorMessage.includes('token')) {
        setMessage({ type: 'error', text: 'Please log in to view features. Redirecting to login...' });
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else {
        setMessage({ type: 'error', text: errorMessage });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    
    try {
      const featureData = {
        ...formData,
        order: parseInt(formData.order) || 0
      };

      if (editingFeature) {
        await featuresAPI.update(editingFeature._id, featureData);
        setMessage({ type: 'success', text: 'Feature updated successfully!' });
      } else {
        await featuresAPI.create(featureData);
        setMessage({ type: 'success', text: 'Feature created successfully!' });
      }

      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      resetForm();
      fetchFeatures();
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Failed to save feature' });
    }
  };

  const handleEdit = (feature) => {
    setEditingFeature(feature);
    setFormData({
      label: feature.label,
      tooltip: feature.tooltip,
      icon: feature.icon,
      order: feature.order || 0,
      isActive: feature.isActive
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!id) {
      setMessage({ type: 'error', text: 'Invalid feature ID' });
      return;
    }
    
    setMessage({ type: '', text: '' });
    
    try {
      await featuresAPI.delete(id);
      setMessage({ type: 'success', text: 'Feature deleted successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      fetchFeatures();
      setShowDeleteConfirm(false);
      setDeleteTargetId(null);
      setDeleteTargetName('');
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Failed to delete feature' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      setShowDeleteConfirm(false);
      setDeleteTargetId(null);
      setDeleteTargetName('');
    }
  };

  const confirmDelete = (id, name) => {
    if (!id) {
      setMessage({ type: 'error', text: 'Invalid feature ID' });
      return;
    }
    setDeleteTargetId(id);
    setDeleteTargetName(name || 'this feature');
    setShowDeleteConfirm(true);
  };

  const executeDelete = () => {
    if (deleteTargetId) {
      handleDelete(deleteTargetId);
    }
  };

  const resetForm = () => {
    setFormData({
      label: '',
      tooltip: '',
      icon: 'Code',
      order: 0,
      isActive: true
    });
    setEditingFeature(null);
    setShowForm(false);
  };

  const getIconComponent = (iconName) => {
    const iconOption = iconOptions.find(opt => opt.value === iconName);
    return iconOption ? iconOption.icon : Code;
  };

  if (loading) {
    return <div className="text-center py-20 text-gray-400">Loading features...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-4xl font-black mb-2">ABOUT SECTION FEATURES</h2>
          <p className="text-gray-500">Manage the four feature cards in the About section</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-6 py-3 bg-emerald-500 text-black font-black rounded-lg hover:bg-emerald-400 transition-all flex items-center gap-2"
        >
          <Plus size={20} />
          Add Feature
        </button>
      </div>

      {/* Status Messages */}
      {message.text && (
        <div className={`mb-6 p-4 rounded-xl ${
          message.type === 'success' 
            ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' 
            : 'bg-red-500/10 border border-red-500/20 text-red-400'
        }`}>
          {message.text}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-black border border-white/10 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black">
                {editingFeature ? 'EDIT FEATURE' : 'ADD FEATURE'}
              </h3>
              <button onClick={resetForm} className="text-gray-400 hover:text-white">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">Label *</label>
                <input
                  type="text"
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  placeholder="e.g., Clean Code, Security First"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">Tooltip Text *</label>
                <textarea
                  value={formData.tooltip}
                  onChange={(e) => setFormData({ ...formData, tooltip: e.target.value })}
                  required
                  rows={3}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500 resize-none"
                  placeholder="e.g., Readable, maintainable, scalable codebases"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">Icon</label>
                <select
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                >
                  {iconOptions.map(icon => (
                    <option key={icon.value} value={icon.value}>{icon.label}</option>
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
                  {editingFeature ? 'UPDATE' : 'CREATE'}
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {features.map((feature) => {
          const IconComponent = getIconComponent(feature.icon);
          return (
            <div
              key={feature._id}
              className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <IconComponent className="text-emerald-400" size={32} />
                  <div>
                    <h3 className="text-xl font-black text-white mb-1">{feature.label}</h3>
                    <p className="text-gray-400 text-sm">{feature.tooltip}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(feature)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-all"
                  >
                    <Edit2 size={16} className="text-emerald-400" />
                  </button>
                  <button
                    onClick={() => {
                      if (feature && feature._id) {
                        confirmDelete(feature._id, feature.label || 'this feature');
                      } else {
                        setMessage({ type: 'error', text: 'Invalid feature data' });
                      }
                    }}
                    className="p-2 hover:bg-white/10 rounded-lg transition-all"
                  >
                    <Trash2 size={16} className="text-red-400" />
                  </button>
                </div>
              </div>

              <div className="flex gap-4 text-xs text-gray-500 mt-4">
                <span>Icon: <span className="text-emerald-400 font-bold">{feature.icon}</span></span>
                <span>Order: <span className="text-emerald-400 font-bold">{feature.order}</span></span>
              </div>

              <div className="mt-3 text-xs">
                Status: {feature.isActive ? (
                  <span className="text-emerald-400 font-bold">Active</span>
                ) : (
                  <span className="text-gray-500">Inactive</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {features.length === 0 && (
        <div className="text-center py-20 text-gray-500">
          No features found. Click "Add Feature" to create one.
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

export default Features;

