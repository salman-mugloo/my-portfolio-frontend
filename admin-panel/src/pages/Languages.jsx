import { useState, useEffect } from 'react';
import { languagesAPI } from '../services/api';
import { Plus, Edit2, Trash2, X, Languages as LanguagesIcon } from 'lucide-react';

const Languages = () => {
  const [languages, setLanguages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingLang, setEditingLang] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    proficiency: '',
    order: 0,
    isActive: true
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [deleteTargetName, setDeleteTargetName] = useState('');

  useEffect(() => {
    fetchLanguages();
  }, []);

  const fetchLanguages = async () => {
    try {
      const data = await languagesAPI.getAll();
      setLanguages(data);
    } catch (error) {
      console.error('Error fetching languages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingLang) {
        await languagesAPI.update(editingLang._id, formData);
        setMessage({ type: 'success', text: 'Language updated successfully!' });
      } else {
        await languagesAPI.create(formData);
        setMessage({ type: 'success', text: 'Language added successfully!' });
      }

      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      resetForm();
      fetchLanguages();
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Failed to save language' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }
  };

  const handleEdit = (lang) => {
    setEditingLang(lang);
    setFormData({
      name: lang.name,
      proficiency: lang.proficiency,
      order: lang.order || 0,
      isActive: lang.isActive !== undefined ? lang.isActive : true
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!id) {
      setMessage({ type: 'error', text: 'Invalid language ID' });
      return;
    }
    
    setMessage({ type: '', text: '' });
    
    try {
      await languagesAPI.delete(id);
      setMessage({ type: 'success', text: 'Language deleted successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      fetchLanguages();
      setShowDeleteConfirm(false);
      setDeleteTargetId(null);
      setDeleteTargetName('');
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Failed to delete language' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      setShowDeleteConfirm(false);
      setDeleteTargetId(null);
      setDeleteTargetName('');
    }
  };

  const confirmDelete = (id, name) => {
    if (!id) {
      setMessage({ type: 'error', text: 'Invalid language ID' });
      return;
    }
    setDeleteTargetId(id);
    setDeleteTargetName(name || 'this language');
    setShowDeleteConfirm(true);
  };

  const executeDelete = () => {
    if (deleteTargetId) {
      handleDelete(deleteTargetId);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      proficiency: '',
      order: 0,
      isActive: true
    });
    setEditingLang(null);
    setShowForm(false);
  };

  if (loading) {
    return <div className="text-center py-20 text-gray-400">Loading languages...</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-black text-white">Languages</h1>
        <button
          onClick={() => setShowForm(true)}
          className="px-6 py-3 bg-emerald-500 text-black font-black rounded-xl hover:bg-emerald-400 transition-all flex items-center gap-2"
        >
          <Plus size={20} />
          Add Language
        </button>
      </div>

      {message.text && (
        <div
          className={`mb-6 p-4 rounded-xl ${
            message.type === 'success'
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : 'bg-red-500/20 text-red-400 border border-red-500/30'
          }`}
        >
          {message.text}
        </div>
      )}

      {showForm && (
        <div className="mb-8 p-6 bg-white/5 rounded-xl border border-white/10">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-black text-white">
              {editingLang ? 'Edit Language' : 'Add New Language'}
            </h2>
            <button
              onClick={resetForm}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X size={20} className="text-gray-400" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">
                Language Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                placeholder="e.g., English, Hindi"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">
                Proficiency *
              </label>
              <input
                type="text"
                value={formData.proficiency}
                onChange={(e) => setFormData({ ...formData, proficiency: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                placeholder="e.g., Native, Professional, Beginner"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">
                Order
              </label>
              <input
                type="number"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                placeholder="0"
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-5 h-5 rounded bg-white/5 border-white/10 text-emerald-500 focus:ring-emerald-500"
              />
              <label htmlFor="isActive" className="text-sm font-bold text-gray-300">
                Active (visible on portfolio)
              </label>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                className="px-6 py-3 bg-emerald-500 text-black font-black rounded-xl hover:bg-emerald-400 transition-all"
              >
                {editingLang ? 'Update Language' : 'Add Language'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-3 bg-white/5 text-gray-300 font-bold rounded-xl hover:bg-white/10 transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {languages.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <LanguagesIcon size={64} className="mx-auto mb-4 opacity-50" />
          <p>No languages added yet. Click "Add Language" to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {languages.map((lang) => (
            <div
              key={lang._id}
              className="p-6 bg-white/5 rounded-xl border border-white/10 hover:border-emerald-500/50 transition-all"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-black text-white mb-2">{lang.name}</h3>
                  <p className="text-sm text-gray-400 font-medium">{lang.proficiency}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(lang)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit2 size={18} className="text-emerald-400" />
                  </button>
                  <button
                    onClick={() => confirmDelete(lang._id, lang.name)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={18} className="text-red-400" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Order: {lang.order}</span>
                <span
                  className={`px-2 py-1 rounded ${
                    lang.isActive
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-gray-500/20 text-gray-400'
                  }`}
                >
                  {lang.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-8 max-w-md w-full mx-4">
            <h3 className="text-2xl font-black text-white mb-4">Confirm Delete</h3>
            <p className="text-gray-400 mb-6">
              Are you sure you want to delete <strong className="text-white">{deleteTargetName}</strong>? This action cannot be undone.
            </p>
            <div className="flex gap-4">
              <button
                onClick={executeDelete}
                className="flex-1 px-6 py-3 bg-red-500 text-white font-black rounded-xl hover:bg-red-600 transition-all"
              >
                Yes, Delete
              </button>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteTargetId(null);
                  setDeleteTargetName('');
                }}
                className="flex-1 px-6 py-3 bg-white/5 text-gray-300 font-bold rounded-xl hover:bg-white/10 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Languages;

