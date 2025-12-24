import { useState, useEffect } from 'react';
import { educationAPI } from '../services/api';
import { GraduationCap, Plus, Edit2, Trash2, Save, X } from 'lucide-react';

const Education = () => {
  const [education, setEducation] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    degree: '',
    field: '',
    institution: '',
    startYear: '',
    endYear: '',
    description: '',
    isActive: true,
    isOngoing: false
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [deleteTargetName, setDeleteTargetName] = useState('');

  useEffect(() => {
    fetchEducation();
  }, []);

  const fetchEducation = async () => {
    try {
      setLoading(true);
      setMessage({ type: '', text: '' });
      const data = await educationAPI.getAll();
      setEducation(data);
    } catch (error) {
      console.error('Error fetching education:', error);
      setMessage({ type: 'error', text: error.message || 'Failed to load education entries' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
      ...(name === 'isOngoing' && checked ? { endYear: '' } : {})
    }));
    setMessage({ type: '', text: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const educationData = {
        ...formData,
        startYear: parseInt(formData.startYear),
        endYear: formData.isOngoing ? null : (formData.endYear ? parseInt(formData.endYear) : null),
        description: formData.description.trim()
      };

      if (editingId) {
        await educationAPI.update(editingId, educationData);
        setMessage({ type: 'success', text: 'Education entry updated successfully!' });
      } else {
        await educationAPI.create(educationData);
        setMessage({ type: 'success', text: 'Education entry added successfully!' });
      }

      await fetchEducation();
      resetForm();
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error('Error saving education:', error);
      setMessage({ type: 'error', text: error.message || 'Failed to save education entry' });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item) => {
    setFormData({
      degree: item.degree,
      field: item.field,
      institution: item.institution,
      startYear: item.startYear.toString(),
      endYear: item.endYear ? item.endYear.toString() : '',
      description: item.description || '',
      isActive: item.isActive,
      isOngoing: !item.endYear
    });
    setEditingId(item._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!id) {
      setMessage({ type: 'error', text: 'Invalid education entry ID' });
      return;
    }

    try {
      await educationAPI.delete(id);
      setMessage({ type: 'success', text: 'Education entry deleted successfully!' });
      await fetchEducation();
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      setShowDeleteConfirm(false);
      setDeleteTargetId(null);
      setDeleteTargetName('');
    } catch (error) {
      console.error('Error deleting education:', error);
      setMessage({ type: 'error', text: error.message || 'Failed to delete education entry' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      setShowDeleteConfirm(false);
      setDeleteTargetId(null);
      setDeleteTargetName('');
    }
  };

  const confirmDelete = (id, name) => {
    if (!id) {
      setMessage({ type: 'error', text: 'Invalid education entry ID' });
      return;
    }
    setDeleteTargetId(id);
    setDeleteTargetName(name || 'this education entry');
    setShowDeleteConfirm(true);
  };

  const executeDelete = () => {
    if (deleteTargetId) {
      handleDelete(deleteTargetId);
    }
  };

  const resetForm = () => {
    setFormData({
      degree: '',
      field: '',
      institution: '',
      startYear: '',
      endYear: '',
      description: '',
      isActive: true,
      isOngoing: false
    });
    setEditingId(null);
    setShowForm(false);
  };

  if (loading) {
    return <div className="text-center py-20 text-gray-400">Loading education entries...</div>;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-black mb-2 flex items-center gap-3">
          <GraduationCap className="text-emerald-400" size={36} />
          Education Journey
        </h1>
        <p className="text-gray-500">Manage your educational qualifications and degrees</p>
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

      {/* Add Button */}
      <div className="mb-6">
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-lg transition-all flex items-center gap-2"
        >
          <Plus size={18} />
          Add Education Entry
        </button>
      </div>

      {/* Education List */}
      <div className="space-y-4 mb-8">
        {education.length === 0 ? (
          <div className="text-center py-12 text-gray-500 rounded-xl bg-white/5 border border-white/10">
            No education entries yet. Click "Add Education Entry" to add one.
          </div>
        ) : (
          education.map((item) => (
            <div
              key={item._id}
              className={`p-6 rounded-xl border transition-all ${
                item.isActive
                  ? 'bg-white/5 border-white/10 hover:bg-white/10'
                  : 'bg-white/2 border-white/5 opacity-50'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-2xl font-black text-emerald-400">
                      {item.degree}
                    </h3>
                    {!item.isActive && (
                      <span className="px-2 py-1 text-xs font-bold bg-gray-500/20 text-gray-400 rounded">
                        INACTIVE
                      </span>
                    )}
                  </div>
                  <p className="text-lg text-gray-300 mb-1">{item.field}</p>
                  <p className="text-gray-400 mb-2">{item.institution}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>{item.startYear}</span>
                    <span>—</span>
                    <span>{item.endYear || 'Present'}</span>
                  </div>
                  {item.description && (
                    <p className="text-gray-400 mt-3 text-sm">{item.description}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(item)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-all"
                  >
                    <Edit2 size={18} className="text-emerald-400" />
                  </button>
                  <button
                    onClick={() => {
                      if (item && item._id) {
                        const name = `${item.degree} from ${item.institution}` || 'this education entry';
                        confirmDelete(item._id, name);
                      } else {
                        setMessage({ type: 'error', text: 'Invalid education entry data' });
                      }
                    }}
                    className="p-2 hover:bg-white/10 rounded-lg transition-all"
                  >
                    <Trash2 size={18} className="text-red-400" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-black border border-white/10 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black">
                {editingId ? 'EDIT EDUCATION ENTRY' : 'ADD EDUCATION ENTRY'}
              </h3>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-white"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-2">Degree *</label>
                  <input
                    type="text"
                    name="degree"
                    value={formData.degree}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                    placeholder="e.g. BCA (Honours)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-2">Field / Specialization *</label>
                  <input
                    type="text"
                    name="field"
                    value={formData.field}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                    placeholder="e.g. Computer Applications"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">Institution *</label>
                <input
                  type="text"
                  name="institution"
                  value={formData.institution}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  placeholder="e.g. Parul University"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-2">Start Year *</label>
                  <input
                    type="number"
                    name="startYear"
                    value={formData.startYear}
                    onChange={handleChange}
                    required
                    min="1900"
                    max="2100"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                    placeholder="e.g. 2021"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-2">
                    End Year {!formData.isOngoing && '*'}
                  </label>
                  <input
                    type="number"
                    name="endYear"
                    value={formData.endYear}
                    onChange={handleChange}
                    required={!formData.isOngoing}
                    disabled={formData.isOngoing}
                    min="1900"
                    max="2100"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="e.g. 2024"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="isOngoing"
                  id="isOngoing"
                  checked={formData.isOngoing}
                  onChange={handleChange}
                  className="w-4 h-4 rounded bg-white/5 border-white/10 text-emerald-500 focus:ring-emerald-500"
                />
                <label htmlFor="isOngoing" className="text-sm font-bold text-gray-300">
                  Currently studying (will show "Present" instead of end year)
                </label>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">Description (Optional)</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500 resize-none"
                  placeholder="Brief description (1-2 lines)"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="isActive"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="w-4 h-4 rounded bg-white/5 border-white/10 text-emerald-500 focus:ring-emerald-500"
                />
                <label htmlFor="isActive" className="text-sm font-bold text-gray-300">
                  Active (show on portfolio)
                </label>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-3 bg-emerald-500 text-black font-black rounded-lg hover:bg-emerald-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      {editingId ? 'UPDATE' : 'ADD'}
                    </>
                  )}
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

export default Education;

