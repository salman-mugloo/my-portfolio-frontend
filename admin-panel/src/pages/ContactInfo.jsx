import { useState, useEffect } from 'react';
import { contactInfoAPI } from '../services/api';
import { Mail, Github, Linkedin, Save, Plus, Edit2, Trash2, X, Code, Image } from 'lucide-react';

// Supported contact types with icons
const CONTACT_TYPES = [
  { value: 'github', label: 'GitHub', icon: Github },
  { value: 'linkedin', label: 'LinkedIn', icon: Linkedin },
  { value: 'leetcode', label: 'LeetCode', icon: Code },
  { value: 'instagram', label: 'Instagram', icon: Image },
  { value: 'codeforces', label: 'Codeforces', icon: Code }
];

const ContactInfo = () => {
  const [contactInfo, setContactInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showContactForm, setShowContactForm] = useState(false);
  const [editingContactIndex, setEditingContactIndex] = useState(null);
  const [formData, setFormData] = useState({
    description: '',
    email: '',
    contacts: [],
    connectTitle: '',
    connectDescription: ''
  });
  const [contactFormData, setContactFormData] = useState({
    type: '',
    url: ''
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTargetIndex, setDeleteTargetIndex] = useState(null);
  const [deleteTargetName, setDeleteTargetName] = useState('');

  useEffect(() => {
    fetchContactInfo();
  }, []);

  const fetchContactInfo = async () => {
    try {
      setLoading(true);
      setMessage({ type: '', text: '' });
      const data = await contactInfoAPI.get();
      setContactInfo(data);
      
      // Migrate old structure to new structure if needed
      const contacts = data.contacts || [];
      if (data.githubUrl && !contacts.find(c => c.type === 'github')) {
        contacts.push({ type: 'github', url: data.githubUrl });
      }
      if (data.linkedinUrl && !contacts.find(c => c.type === 'linkedin')) {
        contacts.push({ type: 'linkedin', url: data.linkedinUrl });
      }
      
      setFormData({
        description: data.description || '',
        email: data.email || '',
        contacts: contacts,
        connectTitle: data.connectTitle || '',
        connectDescription: data.connectDescription || ''
      });
    } catch (error) {
      console.error('Error fetching contact info:', error);
      setMessage({ type: 'error', text: error.message || 'Failed to load contact information' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setMessage({ type: '', text: '' });
  };

  const handleContactFormChange = (e) => {
    const { name, value } = e.target;
    setContactFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getAvailableIcons = () => {
    const usedTypes = formData.contacts.map(c => c.type);
    if (editingContactIndex !== null) {
      // When editing, include the current contact's type
      const currentType = formData.contacts[editingContactIndex]?.type;
      usedTypes.splice(usedTypes.indexOf(currentType), 1);
    }
    return CONTACT_TYPES.filter(type => !usedTypes.includes(type.value));
  };

  const handleAddContact = () => {
    if (!contactFormData.type || !contactFormData.url.trim()) {
      setMessage({ type: 'error', text: 'Please select an icon and enter a URL' });
      return;
    }

    if (!contactFormData.url.startsWith('http://') && !contactFormData.url.startsWith('https://')) {
      setMessage({ type: 'error', text: 'URL must start with http:// or https://' });
      return;
    }

    const newContacts = [...formData.contacts];
    if (editingContactIndex !== null) {
      newContacts[editingContactIndex] = { ...contactFormData };
    } else {
      newContacts.push({ ...contactFormData });
    }

    setFormData(prev => ({
      ...prev,
      contacts: newContacts
    }));

    setContactFormData({ type: '', url: '' });
    setShowContactForm(false);
    setEditingContactIndex(null);
    setMessage({ type: 'success', text: editingContactIndex !== null ? 'Contact updated!' : 'Contact added!' });
    setTimeout(() => setMessage({ type: '', text: '' }), 2000);
  };

  const handleEditContact = (index) => {
    const contact = formData.contacts[index];
    setContactFormData({ type: contact.type, url: contact.url });
    setEditingContactIndex(index);
    setShowContactForm(true);
  };

  const handleDeleteContact = (index) => {
    const newContacts = formData.contacts.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      contacts: newContacts
    }));
    setMessage({ type: 'success', text: 'Contact link deleted!' });
    setTimeout(() => setMessage({ type: '', text: '' }), 2000);
    setShowDeleteConfirm(false);
    setDeleteTargetIndex(null);
    setDeleteTargetName('');
  };

  const confirmDeleteContact = (index, name) => {
    setDeleteTargetIndex(index);
    setDeleteTargetName(name || 'this contact');
    setShowDeleteConfirm(true);
  };

  const executeDeleteContact = () => {
    if (deleteTargetIndex !== null) {
      handleDeleteContact(deleteTargetIndex);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const updated = await contactInfoAPI.update(formData);
      setContactInfo(updated);
      setFormData(prev => ({
        ...prev,
        contacts: updated.contacts || []
      }));
      setMessage({ type: 'success', text: 'Contact information updated successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error('Error updating contact info:', error);
      setMessage({ type: 'error', text: error.message || 'Failed to update contact information' });
    } finally {
      setSaving(false);
    }
  };

  const getIconComponent = (type) => {
    const contactType = CONTACT_TYPES.find(t => t.value === type);
    return contactType ? contactType.icon : Code;
  };

  if (loading) {
    return <div className="text-center py-20 text-gray-400">Loading contact information...</div>;
  }

  const availableIcons = getAvailableIcons();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-black mb-2 flex items-center gap-3">
          <Mail className="text-emerald-400" size={36} />
          Get in Touch Details
        </h1>
        <p className="text-gray-500">Manage your contact information displayed on the portfolio</p>
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

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Main Description */}
        <div className="p-8 rounded-xl bg-white/5 border border-white/10">
          <h2 className="text-2xl font-black mb-6 text-emerald-400">Main Description</h2>
          <div>
            <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider">
              Description Text *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={4}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500 resize-none"
              placeholder="I'm always open to discussing new projects..."
            />
          </div>
        </div>

        {/* Contact Details */}
        <div className="p-8 rounded-xl bg-white/5 border border-white/10">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-black text-emerald-400 flex items-center gap-2">
              <Mail size={24} />
              Contact Details
            </h2>
            <button
              type="button"
              onClick={() => {
                if (formData.contacts.length >= 5) {
                  setMessage({ type: 'error', text: 'Maximum 5 contact links allowed' });
                  return;
                }
                setContactFormData({ type: '', url: '' });
                setEditingContactIndex(null);
                setShowContactForm(true);
              }}
              disabled={formData.contacts.length >= 5}
              className="px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Plus size={18} />
              Add Contact Link
            </button>
          </div>

          {/* Email */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider">
              Email Address *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500"
              placeholder="your.email@example.com"
            />
          </div>

          {/* Contact Links List */}
          <div className="space-y-3">
            {formData.contacts.map((contact, index) => {
              const IconComponent = getIconComponent(contact.type);
              const contactType = CONTACT_TYPES.find(t => t.value === contact.type);
              return (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <IconComponent className="text-emerald-400" size={24} />
                    <div>
                      <div className="font-bold text-white">{contactType?.label || contact.type}</div>
                      <div className="text-sm text-gray-400 truncate max-w-md">{contact.url}</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleEditContact(index)}
                      className="p-2 hover:bg-white/10 rounded-lg transition-all"
                    >
                      <Edit2 size={16} className="text-emerald-400" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const labelMap = {
                          github: 'GitHub',
                          linkedin: 'LinkedIn',
                          leetcode: 'LeetCode',
                          instagram: 'Instagram',
                          codeforces: 'Codeforces'
                        };
                        const contactName = labelMap[contact.type] || contact.type || 'this contact';
                        confirmDeleteContact(index, contactName);
                      }}
                      className="p-2 hover:bg-white/10 rounded-lg transition-all"
                    >
                      <Trash2 size={16} className="text-red-400" />
                    </button>
                  </div>
                </div>
              );
            })}
            {formData.contacts.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No contact links added yet. Click "Add Contact Link" to add one.
              </div>
            )}
          </div>
        </div>

        {/* Let's Connect Section */}
        <div className="p-8 rounded-xl bg-white/5 border border-white/10">
          <h2 className="text-2xl font-black mb-6 text-emerald-400">Let's Connect Section</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider">
                Section Title *
              </label>
              <input
                type="text"
                name="connectTitle"
                value={formData.connectTitle}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                placeholder="Let's Connect"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider">
                Section Description *
              </label>
              <textarea
                name="connectDescription"
                value={formData.connectDescription}
                onChange={handleChange}
                required
                rows={3}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500 resize-none"
                placeholder="Whether you have a question or just want to say hi..."
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full px-6 py-4 bg-emerald-500 text-black font-black rounded-xl hover:bg-emerald-400 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {saving ? (
            <>
              <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save size={20} />
              Save Contact Information
            </>
          )}
        </button>
      </form>

      {/* Add/Edit Contact Form Modal */}
      {showContactForm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-black border border-white/10 rounded-2xl p-8 max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black">
                {editingContactIndex !== null ? 'EDIT CONTACT LINK' : 'ADD CONTACT LINK'}
              </h3>
              <button
                onClick={() => {
                  setShowContactForm(false);
                  setEditingContactIndex(null);
                  setContactFormData({ type: '', url: '' });
                }}
                className="text-gray-400 hover:text-white"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">Icon *</label>
                <select
                  name="type"
                  value={contactFormData.type}
                  onChange={handleContactFormChange}
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="">Select an icon</option>
                  {availableIcons.map(type => {
                    const IconComponent = type.icon;
                    return (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    );
                  })}
                </select>
                {availableIcons.length === 0 && (
                  <p className="text-xs text-gray-500 mt-2">All icons are in use. Delete a contact to free an icon.</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">URL *</label>
                <input
                  type="url"
                  name="url"
                  value={contactFormData.url}
                  onChange={handleContactFormChange}
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  placeholder="https://example.com"
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={handleAddContact}
                  disabled={!contactFormData.type || !contactFormData.url.trim() || availableIcons.length === 0}
                  className="flex-1 py-3 bg-emerald-500 text-black font-black rounded-lg hover:bg-emerald-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {editingContactIndex !== null ? 'UPDATE' : 'ADD'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowContactForm(false);
                    setEditingContactIndex(null);
                    setContactFormData({ type: '', url: '' });
                  }}
                  className="flex-1 py-3 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all font-bold"
                >
                  CANCEL
                </button>
              </div>
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
                onClick={executeDeleteContact}
                className="flex-1 px-6 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-xl transition-all font-bold"
              >
                Yes
              </button>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteTargetIndex(null);
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

export default ContactInfo;
