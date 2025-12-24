import { useState, useEffect } from 'react';
import { certificationsAPI } from '../services/api';
import { Plus, Edit2, Trash2, X, Award, Upload } from 'lucide-react';

const Certifications = () => {
  const [certifications, setCertifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCert, setEditingCert] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    issuer: '',
    order: 0,
    isActive: true
  });
  const [imageFile, setImageFile] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [deleteTargetName, setDeleteTargetName] = useState('');

  useEffect(() => {
    fetchCertifications();
  }, []);

  const fetchCertifications = async () => {
    try {
      const data = await certificationsAPI.getAll();
      setCertifications(data);
    } catch (error) {
      console.error('Error fetching certifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('issuer', formData.issuer);
      formDataToSend.append('order', formData.order);
      formDataToSend.append('isActive', formData.isActive);
      
      if (imageFile) {
        formDataToSend.append('image', imageFile);
      }
      if (pdfFile) {
        formDataToSend.append('pdf', pdfFile);
      }

      if (editingCert) {
        await certificationsAPI.update(editingCert._id, formDataToSend);
        setMessage({ type: 'success', text: 'Certificate updated successfully!' });
      } else {
        await certificationsAPI.create(formDataToSend);
        setMessage({ type: 'success', text: 'Certificate added successfully!' });
      }

      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      resetForm();
      fetchCertifications();
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Failed to save certificate' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (cert) => {
    setEditingCert(cert);
    setFormData({
      title: cert.title,
      issuer: cert.issuer,
      order: cert.order || 0,
      isActive: cert.isActive !== undefined ? cert.isActive : true
    });
    setImageFile(null);
    setPdfFile(null);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!id) {
      setMessage({ type: 'error', text: 'Invalid certification ID' });
      return;
    }
    
    setMessage({ type: '', text: '' });
    
    try {
      await certificationsAPI.delete(id);
      setMessage({ type: 'success', text: 'Certification deleted successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      fetchCertifications();
      setShowDeleteConfirm(false);
      setDeleteTargetId(null);
      setDeleteTargetName('');
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Failed to delete certification' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      setShowDeleteConfirm(false);
      setDeleteTargetId(null);
      setDeleteTargetName('');
    }
  };

  const confirmDelete = (id, name) => {
    if (!id) {
      setMessage({ type: 'error', text: 'Invalid certification ID' });
      return;
    }
    setDeleteTargetId(id);
    setDeleteTargetName(name || 'this certification');
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
      issuer: '',
      order: 0,
      isActive: true
    });
    setImageFile(null);
    setPdfFile(null);
    setEditingCert(null);
    setShowForm(false);
  };

  if (loading) {
    return <div className="text-center py-20 text-gray-400">Loading certifications...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-black mb-2">Certifications</h1>
          <p className="text-gray-500">Manage your certifications and achievements</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-6 py-3 bg-emerald-500 text-black font-black rounded-xl hover:bg-emerald-400 transition-all flex items-center gap-2"
        >
          <Plus size={20} />
          Add Certification
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

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-black border border-white/10 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black">
                {editingCert ? 'Edit Certification' : 'Add New Certification'}
              </h2>
              <button
                onClick={resetForm}
                className="text-gray-500 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                  placeholder="e.g., Java Programming"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider">
                  Issuer *
                </label>
                <input
                  type="text"
                  required
                  value={formData.issuer}
                  onChange={(e) => setFormData({ ...formData, issuer: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                  placeholder="e.g., Udemy, Coursera"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider">
                  Display Order
                </label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                  placeholder="0"
                />
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-5 h-5 rounded bg-white/5 border-white/10 text-emerald-500 focus:ring-emerald-500"
                  />
                  <span className="text-sm font-bold">Active (Visible on portfolio)</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider">
                  Certificate Image (JPG, PNG)
                </label>
                <div className="border-2 border-dashed border-white/10 rounded-xl p-6 text-center">
                  <Upload className="mx-auto mb-2 text-gray-500" size={32} />
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png"
                    onChange={(e) => setImageFile(e.target.files[0])}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="cursor-pointer text-sm text-gray-400 hover:text-emerald-400"
                  >
                    {imageFile ? imageFile.name : editingCert?.image ? 'Current file exists. Click to replace.' : 'Click to upload image'}
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider">
                  Certificate PDF
                </label>
                <div className="border-2 border-dashed border-white/10 rounded-xl p-6 text-center">
                  <Upload className="mx-auto mb-2 text-gray-500" size={32} />
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => setPdfFile(e.target.files[0])}
                    className="hidden"
                    id="pdf-upload"
                  />
                  <label
                    htmlFor="pdf-upload"
                    className="cursor-pointer text-sm text-gray-400 hover:text-emerald-400"
                  >
                    {pdfFile ? pdfFile.name : editingCert?.pdf ? 'Current file exists. Click to replace.' : 'Click to upload PDF (optional)'}
                  </label>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex-1 px-6 py-3 bg-emerald-500 text-black font-black rounded-xl hover:bg-emerald-400 transition-all disabled:opacity-50"
                >
                  {uploading ? 'Uploading...' : editingCert ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Certifications List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {certifications.map((cert) => (
          <div
            key={cert._id}
            className="p-6 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <Award className="text-emerald-400" size={24} />
                <div>
                  <h3 className="font-black text-lg">{cert.title}</h3>
                  <p className="text-sm text-gray-500">{cert.issuer}</p>
                </div>
              </div>
              <span
                className={`px-2 py-1 text-xs font-bold rounded ${
                  cert.isActive
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-gray-500/20 text-gray-400'
                }`}
              >
                {cert.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>

            <div className="flex gap-2 mb-4">
              {cert.image && (
                <span className="px-2 py-1 text-xs bg-blue-500/20 text-blue-400 rounded">
                  Has Image
                </span>
              )}
              {cert.pdf && (
                <span className="px-2 py-1 text-xs bg-red-500/20 text-red-400 rounded">
                  Has PDF
                </span>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(cert)}
                className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-all flex items-center justify-center gap-2"
              >
                <Edit2 size={16} />
                Edit
              </button>
              <button
                onClick={() => {
                  if (cert && cert._id) {
                    confirmDelete(cert._id, cert.title || 'this certification');
                  } else {
                    setMessage({ type: 'error', text: 'Invalid certification data' });
                  }
                }}
                className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-all"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {certifications.length === 0 && (
        <div className="text-center py-20 text-gray-500">
          <Award className="mx-auto mb-4 text-gray-600" size={64} />
          <p>No certifications yet. Add your first one!</p>
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

export default Certifications;

