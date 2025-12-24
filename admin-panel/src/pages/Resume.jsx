import { useState, useEffect } from 'react';
import { resumeAPI } from '../services/api';
import { Upload, Trash2, FileText, Download, CheckCircle } from 'lucide-react';

// Get API base URL from environment
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:7002/api';

const Resume = () => {
  const [resumes, setResumes] = useState([]);
  const [activeResume, setActiveResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState('Resume');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      const data = await resumeAPI.getAll();
      setResumes(data);
      // Find the active resume from the list (which has _id)
      const active = data.find(r => r.isActive === true);
      setActiveResume(active || null);
    } catch (error) {
      console.error('Error fetching resumes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    const fileInput = document.getElementById('resume-upload');
    const file = fileInput.files[0];

    setMessage({ type: '', text: '' });

    if (!file) {
      setMessage({ type: 'error', text: 'Please select a PDF file' });
      return;
    }

    if (file.type !== 'application/pdf') {
      setMessage({ type: 'error', text: 'Please upload a PDF file only' });
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('resume', file);
      formData.append('title', title);

      await resumeAPI.upload(formData);
      fileInput.value = '';
      setTitle('Resume');
      fetchResumes();
      setMessage({ type: 'success', text: 'Resume uploaded successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Failed to upload resume' });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!id) {
      setMessage({ type: 'error', text: 'Invalid resume ID' });
      return;
    }
    
    setMessage({ type: '', text: '' });
    
    try {
      await resumeAPI.delete(id);
      fetchResumes();
      if (activeResume && activeResume._id === id) {
        setActiveResume(null);
      }
      setMessage({ type: 'success', text: 'Resume deleted successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      setShowDeleteConfirm(false);
      setDeleteTargetId(null);
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Failed to delete resume' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      setShowDeleteConfirm(false);
      setDeleteTargetId(null);
    }
  };

  const confirmDelete = (id) => {
    if (!id) {
      setMessage({ type: 'error', text: 'Invalid resume ID' });
      return;
    }
    setDeleteTargetId(id);
    setShowDeleteConfirm(true);
  };

  const executeDelete = () => {
    if (deleteTargetId) {
      handleDelete(deleteTargetId);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getFileUrl = (filePath) => {
    if (!filePath) return '';
    
    // If filePath is already an absolute URL, return it as-is
    if (filePath.startsWith('http')) {
      return filePath;
    }
    
    // Extract the relative path from the stored path
    // filePath might be like: "server/uploads/resume/filename.pdf" or "uploads/resume/filename.pdf"
    let relativePath = filePath;
    if (filePath.includes('uploads')) {
      // Extract everything from "uploads" onwards
      const uploadsIndex = filePath.indexOf('uploads');
      relativePath = '/' + filePath.substring(uploadsIndex);
    } else if (!filePath.startsWith('/')) {
      // If it doesn't start with /, add it
      relativePath = '/' + filePath;
    }
    
    // Prepend the backend base URL (without /api)
    return `${API_BASE_URL.replace('/api', '')}${relativePath}`;
  };

  if (loading) {
    return <div className="text-center py-20 text-gray-400">Loading resume data...</div>;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-black mb-2">Resume Management</h1>
        <p className="text-gray-500">Upload and manage your resume (only one active resume at a time)</p>
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

      {/* Upload Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start mb-12">
        <div className="p-8 rounded-xl bg-white/5 border border-white/10">
        <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
          <Upload size={28} />
          Upload New Resume
        </h2>

        <form onSubmit={handleUpload} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider">
              Resume Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500"
              placeholder="e.g., Resume, CV, My Resume"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider">
              PDF File *
            </label>
            <div className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center">
              <FileText className="mx-auto mb-4 text-gray-500" size={48} />
              <input
                type="file"
                id="resume-upload"
                accept="application/pdf"
                required
                className="hidden"
              />
              <div className="flex flex-col items-center gap-3">
              <label
                htmlFor="resume-upload"
                className="cursor-pointer inline-block px-6 py-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all"
              >
                Choose PDF File
              </label>
                <button
                  type="button"
                  onClick={() => {
                    if (activeResume && activeResume._id) {
                      confirmDelete(activeResume._id);
                    } else {
                      setMessage({ type: 'error', text: 'No resume selected for deletion' });
                    }
                  }}
                  disabled={!activeResume || !activeResume._id}
                  className="px-4 py-2 text-sm bg-red-500/10 text-red-400 border border-red-500/30 rounded-xl hover:bg-red-500/20 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-red-500/10"
                >
                  <Trash2 size={16} />
                  Delete Current Resume
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-6">Only PDF files accepted (Max 10MB)</p>
            </div>
          </div>

          <button
            type="submit"
            disabled={uploading}
            className="w-full px-6 py-4 bg-emerald-500 text-black font-black rounded-xl hover:bg-emerald-400 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Upload size={20} />
            {uploading ? 'Uploading...' : 'Upload Resume'}
          </button>
        </form>
            </div>

        {/* Current Resume Preview */}
        <div className="p-8 rounded-xl bg-white/5 border border-white/10 flex flex-col" style={{ minHeight: '100%' }}>
          <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
            <FileText size={28} />
            Current Resume
          </h2>

          {activeResume && activeResume.fileUrl ? (
            <div className="flex-1 flex flex-col space-y-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="text-emerald-400" size={20} />
                <div>
                  <p className="text-sm font-medium text-gray-300">{activeResume.title || 'Resume'}</p>
                  <p className="text-xs text-gray-500">
              Last updated: {formatDate(activeResume.uploadedAt)}
            </p>
                </div>
              </div>
              
              {/* PDF Preview Thumbnail */}
              <div className="flex-1 border-2 border-dashed border-white/10 rounded-xl bg-black/20 overflow-hidden group" style={{ minHeight: '400px' }}>
                <div className="relative w-full h-full">
                  <iframe
                    src={`${encodeURI(getFileUrl(activeResume.fileUrl))}#page=1&zoom=75&toolbar=0`}
                    className="w-full h-full border-0"
                    style={{ minHeight: '400px', pointerEvents: 'none' }}
                    title="Resume Preview"
                    loading="lazy"
                    onError={(e) => {
                      console.error('PDF preview error:', e);
                      console.error('File URL:', getFileUrl(activeResume.fileUrl));
                    }}
                  />
            <a
              href={getFileUrl(activeResume.fileUrl)}
              target="_blank"
              rel="noopener noreferrer"
                    className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-all flex items-center justify-center opacity-0 hover:opacity-100"
                  >
                    <div className="bg-emerald-500/90 px-6 py-3 rounded-lg flex items-center gap-2 text-white font-bold">
                      <Download size={20} />
                      Open Full Resume
                    </div>
                  </a>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 border-2 border-dashed border-white/10 rounded-xl p-8 text-center bg-black/20 flex flex-col items-center justify-center" style={{ minHeight: '400px' }}>
              <FileText className="mb-4 text-gray-600" size={64} />
              <p className="text-gray-500">No resume uploaded yet</p>
              <p className="text-xs text-gray-600 mt-2">Upload a resume to see preview here</p>
          </div>
        )}
        </div>
      </div>

      {/* Resume History */}
      <div>
        <h2 className="text-2xl font-black mb-6">Resume History</h2>
        
        {resumes.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <FileText className="mx-auto mb-4 text-gray-600" size={64} />
            <p>No resumes uploaded yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {resumes.map((resume) => (
              <div
                key={resume._id}
                className="p-6 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <FileText className="text-emerald-400" size={32} />
                    <div>
                      <h3 className="font-black text-lg">{resume.title || 'Resume'}</h3>
                      <p className="text-sm text-gray-500">
                        Uploaded: {formatDate(resume.uploadedAt)}
                      </p>
                      {resume.isActive && (
                        <span className="inline-block mt-2 px-2 py-1 text-xs font-bold bg-emerald-500/20 text-emerald-400 rounded">
                          ACTIVE
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {resume.isActive && (
                      <CheckCircle className="text-emerald-400" size={24} />
                    )}
                    <button
                      onClick={() => {
                        if (resume && resume._id) {
                          confirmDelete(resume._id);
                        } else {
                          setMessage({ type: 'error', text: 'Invalid resume data' });
                        }
                      }}
                      className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-black border border-white/10 rounded-2xl p-8 max-w-md w-full">
            <h3 className="text-2xl font-black mb-4">Confirm Delete</h3>
            <p className="text-gray-400 mb-6">
              Are you sure you want to delete this resume? This action cannot be undone.
            </p>
            <div className="flex gap-4">
              <button
                onClick={executeDelete}
                className="flex-1 px-6 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-xl transition-all font-bold"
              >
                Delete
              </button>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteTargetId(null);
                }}
                className="flex-1 px-6 py-3 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl transition-all font-bold"
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

export default Resume;

