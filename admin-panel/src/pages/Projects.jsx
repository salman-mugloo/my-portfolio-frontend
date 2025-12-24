import { useState, useEffect } from 'react';
import { projectsAPI } from '../services/api';
import { Plus, Edit2, Trash2, Github, X } from 'lucide-react';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    githubLink: '',
    technologies: '',
    isPublished: true
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [deleteTargetName, setDeleteTargetName] = useState('');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const data = await projectsAPI.getAll();
      setProjects(data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const technologies = formData.technologies
        .split(',')
        .map(t => t.trim())
        .filter(t => t);

      const projectData = {
        ...formData,
        technologies
      };

      if (editingProject) {
        await projectsAPI.update(editingProject._id, projectData);
      } else {
        await projectsAPI.create(projectData);
      }

      resetForm();
      fetchProjects();
    } catch (error) {
      alert(error.message || 'Failed to save project');
    }
  };

  const handleEdit = (project) => {
    setEditingProject(project);
    setFormData({
      title: project.title,
      description: project.description,
      githubLink: project.githubLink,
      technologies: project.technologies.join(', '),
      isPublished: project.isPublished
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!id) {
      return;
    }
    
    try {
      await projectsAPI.delete(id);
      fetchProjects();
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
    setDeleteTargetName(name || 'this project');
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
      githubLink: '',
      technologies: '',
      isPublished: true
    });
    setEditingProject(null);
    setShowForm(false);
  };

  if (loading) {
    return <div className="text-center py-20 text-gray-400">Loading projects...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-4xl font-black mb-2">PROJECTS</h2>
          <p className="text-gray-500">Manage your portfolio projects</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-6 py-3 bg-emerald-500 text-black font-black rounded-lg hover:bg-emerald-400 transition-all flex items-center gap-2"
        >
          <Plus size={20} />
          Add Project
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-black border border-white/10 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black">
                {editingProject ? 'EDIT PROJECT' : 'ADD PROJECT'}
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
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  rows={4}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">GitHub Link *</label>
                <input
                  type="url"
                  value={formData.githubLink}
                  onChange={(e) => setFormData({ ...formData, githubLink: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  placeholder="https://github.com/username/repo"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">Technologies *</label>
                <input
                  type="text"
                  value={formData.technologies}
                  onChange={(e) => setFormData({ ...formData, technologies: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  placeholder="React, Node.js, MongoDB (comma-separated)"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="published"
                  checked={formData.isPublished}
                  onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                  className="w-5 h-5 rounded bg-white/5 border-white/10 text-emerald-500 focus:ring-emerald-500"
                />
                <label htmlFor="published" className="text-sm font-bold text-gray-300">
                  Publish / Make Visible
                </label>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-emerald-500 text-black font-black rounded-lg hover:bg-emerald-400 transition-all"
                >
                  {editingProject ? 'UPDATE' : 'CREATE'}
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <div
            key={project._id}
            className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all"
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-black text-white">{project.title}</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(project)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-all"
                >
                  <Edit2 size={16} className="text-emerald-400" />
                </button>
                <button
                  onClick={() => {
                    if (project && project._id) {
                      confirmDelete(project._id, project.title || 'this project');
                    }
                  }}
                  className="p-2 hover:bg-white/10 rounded-lg transition-all"
                >
                  <Trash2 size={16} className="text-red-400" />
                </button>
              </div>
            </div>

            <p className="text-gray-400 text-sm mb-4 line-clamp-2">{project.description}</p>

            <div className="flex items-center gap-2 mb-4">
              <Github size={16} className="text-gray-500" />
              <a
                href={project.githubLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-emerald-400 hover:underline truncate"
              >
                {project.githubLink}
              </a>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {project.technologies.map((tech, i) => (
                <span
                  key={i}
                  className="px-2 py-1 text-xs font-bold bg-emerald-500/10 text-emerald-400 rounded border border-emerald-500/20"
                >
                  {tech}
                </span>
              ))}
            </div>

            <div className="text-xs text-gray-500">
              Status: {project.isPublished ? (
                <span className="text-emerald-400 font-bold">Published</span>
              ) : (
                <span className="text-gray-500">Draft</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {projects.length === 0 && (
        <div className="text-center py-20 text-gray-500">
          No projects found. Click "Add Project" to create one.
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

export default Projects;

