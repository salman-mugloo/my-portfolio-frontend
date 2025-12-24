import { useState, useEffect } from 'react';
import { skillsAPI } from '../services/api';
import { Plus, Edit2, Trash2, X } from 'lucide-react';

const iconOptions = ['Code', 'Terminal', 'Layout', 'Brain', 'Server', 'Database'];
const colorOptions = [
  'from-orange-500',
  'from-blue-500',
  'from-emerald-600',
  'from-purple-500',
  'from-red-500',
  'from-yellow-500',
  'from-pink-500',
  'from-cyan-500'
];

const Skills = () => {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSkill, setEditingSkill] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    iconKey: 'Code',
    color: 'from-emerald-500',
    order: 0,
    isActive: true
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [deleteTargetName, setDeleteTargetName] = useState('');

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      const data = await skillsAPI.getAll();
      setSkills(data);
    } catch (error) {
      console.error('Error fetching skills:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const skillData = {
        ...formData,
        order: parseInt(formData.order) || 0
      };

      if (editingSkill) {
        await skillsAPI.update(editingSkill._id, skillData);
      } else {
        await skillsAPI.create(skillData);
      }

      resetForm();
      fetchSkills();
    } catch (error) {
      alert(error.message || 'Failed to save skill');
    }
  };

  const handleEdit = (skill) => {
    setEditingSkill(skill);
    setFormData({
      name: skill.name,
      description: skill.description,
      iconKey: skill.iconKey,
      color: skill.color,
      order: skill.order || 0,
      isActive: skill.isActive
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!id) {
      return;
    }
    
    try {
      await skillsAPI.delete(id);
      fetchSkills();
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
    setDeleteTargetName(name || 'this skill');
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
      description: '',
      iconKey: 'Code',
      color: 'from-emerald-500',
      order: 0,
      isActive: true
    });
    setEditingSkill(null);
    setShowForm(false);
  };

  if (loading) {
    return <div className="text-center py-20 text-gray-400">Loading skills...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-4xl font-black mb-2">SKILLS / TECH STACK</h2>
          <p className="text-gray-500">Manage tech stack cards</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-6 py-3 bg-emerald-500 text-black font-black rounded-lg hover:bg-emerald-400 transition-all flex items-center gap-2"
        >
          <Plus size={20} />
          Add Skill
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-black border border-white/10 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black">
                {editingSkill ? 'EDIT SKILL' : 'ADD SKILL'}
              </h3>
              <button onClick={resetForm} className="text-gray-400 hover:text-white">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  placeholder="e.g., Core Java, Python"
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
                  placeholder="Object-oriented programming with Java..."
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
                <label className="block text-sm font-bold text-gray-300 mb-2">Gradient Color</label>
                <select
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                >
                  {colorOptions.map(color => (
                    <option key={color} value={color}>{color}</option>
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
                  {editingSkill ? 'UPDATE' : 'CREATE'}
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {skills.map((skill) => (
          <div
            key={skill._id}
            className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-black text-white mb-1">{skill.name}</h3>
                <p className="text-gray-400 text-sm line-clamp-2">{skill.description}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(skill)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-all"
                >
                  <Edit2 size={16} className="text-emerald-400" />
                </button>
                <button
                  onClick={() => {
                    if (skill && skill._id) {
                      confirmDelete(skill._id, skill.name || 'this skill');
                    }
                  }}
                  className="p-2 hover:bg-white/10 rounded-lg transition-all"
                >
                  <Trash2 size={16} className="text-red-400" />
                </button>
              </div>
            </div>

            <div className="flex gap-4 text-xs text-gray-500">
              <span>Icon: <span className="text-emerald-400 font-bold">{skill.iconKey}</span></span>
              <span>Color: <span className="text-emerald-400 font-bold">{skill.color}</span></span>
            </div>

            <div className="mt-3 text-xs">
              Status: {skill.isActive ? (
                <span className="text-emerald-400 font-bold">Active</span>
              ) : (
                <span className="text-gray-500">Inactive</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {skills.length === 0 && (
        <div className="text-center py-20 text-gray-500">
          No skills found. Click "Add Skill" to create one.
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

export default Skills;

