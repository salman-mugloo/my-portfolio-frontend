import { useState, useEffect, useCallback } from 'react';

import { profileAPI, authAPI } from '../services/api';

import { User, Upload, Save, Image as ImageIcon, FileIcon, X, RotateCw, ZoomIn, Crop } from 'lucide-react';

import Cropper from 'react-easy-crop';



const Profile = () => {

  const [profile, setProfile] = useState(null);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({

    name: '',

    title: '',

    tagline: '',

    aboutText: '',

    yearsExperience: 0,

    projectsCount: 0,

    dedicationPercent: 100

  });

  const [message, setMessage] = useState({ type: '', text: '' });
  const [showDeleteImageConfirm, setShowDeleteImageConfirm] = useState(false);

  

  // Image editor state

  const [showImageEditor, setShowImageEditor] = useState(false);

  const [imageSrc, setImageSrc] = useState(null);

  const [crop, setCrop] = useState({ x: 0, y: 0 });

  const [zoom, setZoom] = useState(1);

  const [rotation, setRotation] = useState(0);

  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [cropArea, setCropArea] = useState(null);

  const [originalFile, setOriginalFile] = useState(null);



  useEffect(() => {

    fetchProfile();

  }, []);



  const fetchProfile = async () => {

    try {

      const data = await profileAPI.getProfile();

      console.log('Profile data received:', JSON.stringify(data, null, 2));

      setProfile(data);

      

      // Migrate and normalize font data

      const migrateFont = (font) => {

        if (typeof font === 'string') {

          return { family: font, style: 'normal', weight: '400' };

        }

        if (font && typeof font === 'object' && font !== null) {

          return {

            family: font.family || 'Inter',

            style: font.style || 'normal',

            weight: font.weight || '400'

          };

        }

        return { family: 'Inter', style: 'normal', weight: '400' };

      };

      

      const normalizedFonts = data.fonts ? {

        name: migrateFont(data.fonts.name),

        title: migrateFont(data.fonts.title),

        tagline: migrateFont(data.fonts.tagline),

        aboutText: migrateFont(data.fonts.aboutText)

      } : {

        name: { family: 'Inter', style: 'normal', weight: '400' },

        title: { family: 'Inter', style: 'normal', weight: '400' },

        tagline: { family: 'Inter', style: 'normal', weight: '400' },

        aboutText: { family: 'Inter', style: 'normal', weight: '400' }

      };

      

      console.log('Normalized fonts for form:', JSON.stringify(normalizedFonts, null, 2));

      

      setFormData({

        name: data.name || '',

        title: data.title || '',

        tagline: data.tagline || '',

        aboutText: data.aboutText || '',

        yearsExperience: data.yearsExperience || 0,

        projectsCount: data.projectsCount || 0,

        dedicationPercent: data.dedicationPercent || 100,

        fonts: normalizedFonts

      });

    } catch (error) {

      console.error('Error fetching profile:', error);

      setMessage({ type: 'error', text: 'Failed to load profile data' });

    } finally {

      setLoading(false);

    }

  };



  const handleChange = (e) => {

    const { name, value } = e.target;

    setFormData(prev => ({

      ...prev,

      [name]: name === 'aboutText' ? value : value

    }));

  };



  const handleNumberChange = (e) => {

    const { name, value } = e.target;

    setFormData(prev => ({

      ...prev,

      [name]: parseInt(value) || 0

    }));

  };



  const handleSubmit = async (e) => {

    e.preventDefault();

    setSaving(true);

    setMessage({ type: '', text: '' });



    try {

      const updated = await profileAPI.updateProfile(formData);

      setProfile(updated);

      setMessage({ type: 'success', text: 'Profile updated successfully!' });

      setTimeout(() => setMessage({ type: '', text: '' }), 3000);

    } catch (error) {

      console.error('Error updating profile:', error);

      setMessage({ type: 'error', text: error.message || 'Failed to update profile' });

    } finally {

      setSaving(false);

    }

  };



  const handleImageSelect = (e) => {

    try {

      const file = e.target.files[0];

      if (!file) return;



      // Validate file type

      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

      if (!allowedTypes.includes(file.type)) {

        setMessage({ type: 'error', text: 'Only JPG, PNG, and WEBP images are allowed' });

        return;

      }



      // Validate file size (5MB)

      if (file.size > 5 * 1024 * 1024) {

        setMessage({ type: 'error', text: 'Image size must be less than 5MB' });

        return;

      }



      // Read file and show editor

      const reader = new FileReader();

      reader.onload = () => {

        try {

          setImageSrc(reader.result);

          setShowImageEditor(true);

          setOriginalFile(file);

          // Reset crop, zoom, rotation

          setCrop({ x: 0, y: 0 });

          setZoom(1);

          setRotation(0);

          setCroppedAreaPixels(null);

          // Set a small delay to ensure the image loads and crop area is calculated
          setTimeout(() => {
            // This will trigger onCropComplete when the component renders
          }, 200);

        } catch (error) {

          console.error('Error setting image:', error);

          setMessage({ type: 'error', text: 'Failed to load image. Please try again.' });

        }

      };

      reader.onerror = () => {

        setMessage({ type: 'error', text: 'Failed to read image file. Please try again.' });

      };

      reader.readAsDataURL(file);

      e.target.value = ''; // Reset file input

    } catch (error) {

      console.error('Error selecting image:', error);

      setMessage({ type: 'error', text: 'An error occurred. Please try again.' });

    }

  };



  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    // Always set croppedAreaPixels when crop completes
    console.log('Crop complete - Area:', croppedArea, 'Pixels:', croppedAreaPixels);
    setCropArea(croppedArea);
    if (croppedAreaPixels && croppedAreaPixels.width > 0 && croppedAreaPixels.height > 0) {
    setCroppedAreaPixels(croppedAreaPixels);
    } else {
      console.warn('Invalid croppedAreaPixels:', croppedAreaPixels);
    }
  }, []);

  // Calculate croppedAreaPixels from cropArea when needed
  const calculateCropPixels = useCallback(async () => {
    if (!imageSrc || !cropArea) return null;
    
    try {
      const image = await createImage(imageSrc);
      const containerWidth = 500; // Approximate container width
      const containerHeight = 500; // Approximate container height
      
      // Calculate the scale factor
      const imageAspect = image.width / image.height;
      const containerAspect = containerWidth / containerHeight;
      
      let imageDisplayWidth, imageDisplayHeight;
      if (imageAspect > containerAspect) {
        imageDisplayWidth = containerWidth;
        imageDisplayHeight = containerWidth / imageAspect;
      } else {
        imageDisplayHeight = containerHeight;
        imageDisplayWidth = containerHeight * imageAspect;
      }
      
      const scaleX = image.width / imageDisplayWidth;
      const scaleY = image.height / imageDisplayHeight;
      
      return {
        x: cropArea.x * scaleX,
        y: cropArea.y * scaleY,
        width: cropArea.width * scaleX,
        height: cropArea.height * scaleY
      };
    } catch (error) {
      console.error('Error calculating crop pixels:', error);
      return null;
    }
  }, [imageSrc, cropArea]);



  const createImage = (url) =>

    new Promise((resolve, reject) => {

      const image = new Image();

      image.addEventListener('load', () => resolve(image));

      image.addEventListener('error', (error) => reject(error));

      image.src = url;

    });



  const getRadianAngle = (degreeValue) => {

  



  return (degreeValue * Math.PI) / 180;

  };



  const rotateSize = (width, height, rotation) => {

    const rotRad = getRadianAngle(rotation);

    return {

      width: Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),

      height: Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),

    };

  };



  const getCroppedImg = async (imageSrc, pixelCrop, rotation = 0) => {
    // Validate pixelCrop
    if (!pixelCrop || !pixelCrop.width || !pixelCrop.height || pixelCrop.width <= 0 || pixelCrop.height <= 0) {
      throw new Error('Invalid crop area');
    }

    const image = await createImage(imageSrc);

    const canvas = document.createElement('canvas');

    const ctx = canvas.getContext('2d');



    if (!ctx) {

      throw new Error('No 2d context');

    }



    const rotRad = getRadianAngle(rotation);

    const { width: bBoxWidth, height: bBoxHeight } = rotateSize(

      image.width,

      image.height,

      rotation

    );



    canvas.width = bBoxWidth;

    canvas.height = bBoxHeight;



    ctx.translate(bBoxWidth / 2, bBoxHeight / 2);

    ctx.rotate(rotRad);

    ctx.translate(-image.width / 2, -image.height / 2);



    ctx.drawImage(image, 0, 0);



    const croppedCanvas = document.createElement('canvas');

    const croppedCtx = croppedCanvas.getContext('2d');



    if (!croppedCtx) {

      throw new Error('No 2d context');

    }



    // Ensure valid dimensions
    const cropWidth = Math.max(1, Math.floor(pixelCrop.width));
    const cropHeight = Math.max(1, Math.floor(pixelCrop.height));

    croppedCanvas.width = cropWidth;
    croppedCanvas.height = cropHeight;

    // Clear the canvas first
    croppedCtx.fillStyle = '#000000';
    croppedCtx.fillRect(0, 0, cropWidth, cropHeight);

    // Draw the cropped image
    croppedCtx.drawImage(

      canvas,

      Math.floor(pixelCrop.x),

      Math.floor(pixelCrop.y),

      cropWidth,

      cropHeight,

      0,

      0,

      cropWidth,

      cropHeight

    );



    return new Promise((resolve, reject) => {
      // Ensure canvas has valid dimensions
      if (croppedCanvas.width <= 0 || croppedCanvas.height <= 0) {
        reject(new Error('Invalid canvas dimensions'));
        return;
      }

      croppedCanvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Failed to create blob - canvas may be empty or invalid'));
          return;
        }
        resolve(blob);
      }, 'image/jpeg', 0.95);
    });

  };



  const handleSaveCroppedImage = async () => {

    if (!imageSrc) {
      setMessage({ type: 'error', text: 'No image selected' });
      return;
    }

    // If croppedAreaPixels is not set, show helpful error
    if (!croppedAreaPixels) {
      setMessage({ type: 'error', text: 'Please move or adjust the circular crop area to initialize it, then try saving again.' });
      return;
    }
    
    const pixelsToUse = croppedAreaPixels;

    // Validate croppedAreaPixels
    if (!pixelsToUse.width || !pixelsToUse.height || 
        pixelsToUse.width <= 0 || pixelsToUse.height <= 0) {
      setMessage({ type: 'error', text: 'Invalid crop area. Please adjust the crop selection and try again.' });
      return;
    }

    setUploading(true);

    setMessage({ type: '', text: '' });



    try {

      const croppedImage = await getCroppedImg(imageSrc, pixelsToUse, rotation);

      

      // Create a File object from the blob

      const file = new File([croppedImage], originalFile?.name || 'profile-image.jpg', {

        type: 'image/jpeg',

        lastModified: Date.now(),

      });



      const formData = new FormData();

      formData.append('profileImage', file);



      const response = await profileAPI.uploadProfileImage(formData);

      setMessage({ type: 'success', text: 'Profile image uploaded successfully!' });

      setShowImageEditor(false);

      setImageSrc(null);

      setCrop({ x: 0, y: 0 });

      setZoom(1);

      setRotation(0);

      setCroppedAreaPixels(null);

      setOriginalFile(null);

      // Update profile with the new image URL from response
      if (response && response.profileImageUrl) {
        console.log('Upload response profileImageUrl:', response.profileImageUrl);
        setProfile(prev => ({
          ...prev,
          profileImageUrl: response.profileImageUrl
        }));
      }

      // Refresh profile data to ensure we have the latest
      await fetchProfile();

      setTimeout(() => setMessage({ type: '', text: '' }), 3000);

    } catch (error) {

      console.error('Error saving cropped image:', error);

      setMessage({ type: 'error', text: error.message || 'Failed to process image' });

    } finally {

      setUploading(false);

    }

  };



  // Alias for button onClick handler

  const handleSaveCrop = handleSaveCroppedImage;



  const handleCancelEdit = () => {

    setShowImageEditor(false);

    setImageSrc(null);

    setCrop({ x: 0, y: 0 });

    setZoom(1);

    setRotation(0);

    setOriginalFile(null);

  };



  const handleDeleteImage = async () => {
    try {
      setUploading(true);
      setMessage({ type: '', text: '' });

      await profileAPI.deleteProfileImage();
      setMessage({ type: 'success', text: 'Profile image deleted successfully!' });
      setProfile(prev => ({ ...prev, profileImageUrl: null }));
      setShowDeleteImageConfirm(false);

      // Reset editor state if open

      if (showImageEditor) {

        setShowImageEditor(false);

        setImageSrc(null);

        setCrop({ x: 0, y: 0 });

        setZoom(1);

        setRotation(0);

        setCroppedAreaPixels(null);

        setOriginalFile(null);

      }

      setTimeout(() => setMessage({ type: '', text: '' }), 3000);

    } catch (error) {

      setMessage({ type: 'error', text: error.message || 'Failed to delete image' });

    } finally {

      setUploading(false);

    }

  };







  const getImageUrl = () => {
    if (!profile?.profileImageUrl) {
      console.log('getImageUrl: No profileImageUrl found');
      return null;
    }

    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:7002/api';

    // If profileImageUrl is already an absolute URL, return it as-is
    if (profile.profileImageUrl.startsWith('http')) {
      console.log('getImageUrl: Already absolute URL:', profile.profileImageUrl);
      return profile.profileImageUrl;
    }

    // Extract the relative path from the stored path
    // profileImageUrl might be like: "server/uploads/profile/filename.jpg" or "/uploads/profile/filename.jpg" or "uploads/profile/filename.jpg"
    let relativePath = profile.profileImageUrl;
    
    // If it already starts with /uploads/, use it directly
    if (relativePath.startsWith('/uploads/')) {
      const fullUrl = `${API_BASE_URL.replace('/api', '')}${relativePath}`;
      console.log('getImageUrl: Constructed URL from /uploads/ path:', fullUrl);
      return fullUrl;
    }
    
    if (relativePath.includes('uploads')) {
      // Extract everything from "uploads" onwards
      const uploadsIndex = relativePath.indexOf('uploads');
      relativePath = '/' + relativePath.substring(uploadsIndex);
    } else if (!relativePath.startsWith('/')) {
      // If it doesn't start with /, add it
      relativePath = '/' + relativePath;
    }

    // Prepend the backend base URL (without /api)
    const fullUrl = `${API_BASE_URL.replace('/api', '')}${relativePath}`;
    console.log('getImageUrl: Final constructed URL:', fullUrl);
    return fullUrl;
  };



  if (loading) {

    return <div className="text-center py-20 text-gray-400">Loading profile...</div>;

  }



  return (

    <div>

      <div className="mb-8">

        <h1 className="text-4xl font-black mb-2 flex items-center gap-3">

          <User className="text-emerald-400" size={36} />

          Profile & About Me

        </h1>

        <p className="text-gray-500">Manage your hero section and about me content</p>

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



      <div className="gap-8 items-start" style={{ display: 'grid', gridTemplateColumns: '70% 30%', gap: '1rem' }}>

        {/* User Details */}
        <div className="p-8 rounded-xl bg-white/5 border border-white/10">

            <h2 className="text-2xl font-black mb-6 text-emerald-400">User Details</h2>

            

            <form onSubmit={handleSubmit} className="space-y-6">

              <div>

                <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider">

                  Full Name *

                </label>

                <input

                  type="text"

                  name="name"

                  value={formData.name}

                  onChange={handleChange}

                  required

                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500"

                  placeholder="e.g., Salman Mugloo"

                />

              </div>



              <div>

                <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider">

                  Professional Title *

                </label>

                <input

                  type="text"

                  name="title"

                  value={formData.title}

                  onChange={handleChange}

                  required

                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500"

                  placeholder="e.g., Software Developer & AI/ML Enthusiast"

                />

              </div>



              <div>

                <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider">

                  Tagline / Short Description *

                </label>

                <input

                  type="text"

                  name="tagline"

                  value={formData.tagline}

                  onChange={handleChange}

                  required

                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500"

                  placeholder="e.g., Building innovative solutions with programming and Machine Learning."

                />

              </div>



              {/* About Me Content */}

              <div className="pt-6 border-t border-white/10">

                <h3 className="text-xl font-black  mt-2 mb-4 text-emerald-400">About Me </h3>

                

                <div>

                  <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider">

                    About Me Text *

                  </label>

                  <textarea

                    name="aboutText"

                    value={formData.aboutText}

                    onChange={handleChange}

                    required

                    rows={8}

                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500 resize-none"

                    placeholder="Enter your about me text. Use double line breaks to separate paragraphs."

                  />

                  <p className="mt-2 text-xs text-gray-500">Use double line breaks (press Enter twice) to create separate paragraphs</p>

                </div>

              </div>



              {/* Stats */}

              <div className="pt-6 border-t border-white/10">

                <h3 className="text-xl font-black mt-2 mb-4 text-emerald-400">Statistics</h3>

                

                <div className="flex gap-4">

                  <div style={{ flex: '1' }}>

                    <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider">

                      Years Experience

                    </label>

                    <input

                      type="number"

                      name="yearsExperience"

                      value={formData.yearsExperience}

                      onChange={handleNumberChange}

                      min="0"

                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500"

                    />

                  </div>

                  <div style={{ flex: '1' }}>

                    <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider">

                      Projects Count

                    </label>

                    <input

                      type="number"

                      name="projectsCount"

                      value={formData.projectsCount}

                      onChange={handleNumberChange}

                      min="0"

                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500"

                    />

                  </div>

                  <div style={{ flex: '1' }}>

                    <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider">

                      Dedication %

                    </label>

                    <input

                      type="number"

                      name="dedicationPercent"

                      value={formData.dedicationPercent}

                      onChange={handleNumberChange}

                      min="0"

                      max="100"

                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500"

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

                    Save Profile

                  </>

                )}

              </button>

            </form>

          </div>

        {/* Profile Image Upload */}
        <div className="p-8 rounded-xl bg-white/5 border border-white/10">

            <h2 className="text-2xl font-black mb-6 text-emerald-400 flex items-center gap-2">

              <ImageIcon size={24} />

              Profile Photo

            </h2>



            <div className="border-2 border-dashed border-white/10 rounded-xl p-6 text-center">

              {/* Gmail-style circular preview above upload button */}
              {profile?.profileImageUrl && (
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-emerald-500/50 bg-black/20">
                    <img
                      src={getImageUrl() || ''}
                      alt="Current profile"
                      className="block w-full h-full object-cover"
                      onError={(e) => {
                        console.error('Profile image failed to load:', e.target.src);
                        console.error('Profile state:', profile);
                        e.target.style.display = 'none';
                      }}
                      onLoad={(e) => {
                        console.log('Profile image loaded successfully:', e.target.src);
                      }}
                    />
                  </div>
                </div>
              )}

              {!profile?.profileImageUrl && (
                <ImageIcon className="mx-auto mb-4 text-gray-500" size={48} />
              )}

              <input

                type="file"

                id="profile-image-upload"

                accept="image/jpeg,image/jpg,image/png,image/webp"

                onChange={handleImageSelect}

                className="hidden"

                disabled={uploading || showImageEditor}

              />

              <div className="flex flex-col items-center gap-3">
              <label

                htmlFor="profile-image-upload"

                className={`cursor-pointer inline-block px-6 py-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all ${

                  uploading || showImageEditor ? 'opacity-50 cursor-not-allowed' : ''

                }`}

              >

                {showImageEditor ? 'Editing...' : uploading ? 'Uploading...' : getImageUrl() ? 'Replace Image' : 'Upload Image'}

              </label>

              {getImageUrl() && (

                <button

                  onClick={() => setShowDeleteImageConfirm(true)}

                  disabled={uploading || showImageEditor}

                    className="px-3 py-2 text-sm bg-red-500/10 text-red-400 border border-red-500/30 rounded-xl hover:bg-red-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"

                >

                  Delete Image

                </button>

              )}
              </div>

              <p className="text-xs text-gray-500 mt-6">JPG, PNG, WEBP (Max 5MB)</p>

              <p className="text-xs text-emerald-400 mt-2">You can crop, rotate & adjust before uploading</p>

            </div>

          </div>



        </div>

      {/* Image Editor Modal */}
      {showImageEditor && (

        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-lg flex items-center justify-center p-6">

          <div className="relative w-full max-w-4xl bg-black/50 border border-white/10 rounded-2xl overflow-hidden">

            {/* Header */}

            <div className="flex items-center justify-between p-6 border-b border-white/10">

              <h2 className="text-2xl font-black text-emerald-400 flex items-center gap-2">

                <Crop size={24} />

                Edit Profile Image

              </h2>

              <button

                onClick={() => {

                  setShowImageEditor(false);

                  setImageSrc(null);

                  setCrop({ x: 0, y: 0 });

                  setZoom(1);

                  setRotation(0);

                  setOriginalFile(null);

                }}

                className="p-2 hover:bg-white/10 rounded-lg transition-colors"

              >

                <X size={24} />

              </button>

            </div>



            {/* Editor Content */}

            <div className="p-6">

              {imageSrc && (

                <div className="relative w-full bg-black rounded-xl mb-6" style={{ position: 'relative', minHeight: '600px', height: '600px' }}>
                  <style>{`
                    .reactEasyCrop_CropArea {
                      border: 4px solid #10b981 !important;
                      border-radius: 50% !important;
                      box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.7) !important;
                      outline: 2px solid rgba(16, 185, 129, 0.8) !important;
                      z-index: 10 !important;
                      cursor: move !important;
                      display: block !important;
                      visibility: visible !important;
                      opacity: 1 !important;
                    }
                  `}</style>

                  <Cropper

                    image={imageSrc}

                    crop={crop}

                    zoom={zoom}

                    rotation={rotation}

                    aspect={1}

                    cropShape="round"

                    onCropChange={(newCrop) => {
                      setCrop(newCrop);
                    }}

                    onZoomChange={(newZoom) => {
                      setZoom(newZoom);
                    }}

                    onRotationChange={(newRotation) => {
                      setRotation(newRotation);
                    }}

                    onCropComplete={onCropComplete}

                    showGrid={false}

                    restrictPosition={true}

                    style={{

                      containerStyle: {

                        width: '100%',

                        height: '100%',

                        position: 'relative',

                        backgroundColor: '#000000'

                      },

                      cropAreaStyle: {

                        border: '4px solid #10b981',

                        borderRadius: '50%',

                        boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.7)',

                        outline: '2px solid rgba(16, 185, 129, 0.8)',

                        zIndex: 10,

                        cursor: 'move',

                        display: 'block',

                        visibility: 'visible',

                        opacity: 1

                      },

                      mediaStyle: {

                        objectFit: 'contain'

                      }

                    }}

                  />

                </div>

              )}



              {/* Controls */}

              <div className="flex flex-col gap-4">

                <div>

                  <label className="block text-sm font-medium mb-2">Zoom</label>

                  <input

                    type="range"

                    min={1}

                    max={3}

                    step={0.1}

                    value={zoom}

                    onChange={(e) => setZoom(Number(e.target.value))}

                    className="w-full"

                  />

                </div>



                <div>

                  <label className="block text-sm font-medium mb-2">Rotation</label>

                  <input

                    type="range"

                    min={0}

                    max={360}

                    step={1}

                    value={rotation}

                    onChange={(e) => setRotation(Number(e.target.value))}

                    className="w-full"

                  />

                </div>



                <div className="flex gap-3">

                  <button

                    onClick={handleCancelEdit}

                    className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"

                  >

                    Cancel

                  </button>

                  <button

                    onClick={handleSaveCrop}

                    className="flex-1 px-4 py-2 bg-emerald-500 text-black font-black rounded-lg hover:bg-emerald-400 transition-colors"

                  >

                    Save & Upload

                  </button>

                </div>

              </div>

            </div>

          </div>

        </div>

      )}

      {/* Delete Image Confirmation Modal */}
      {showDeleteImageConfirm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-black border border-white/10 rounded-2xl p-8 max-w-md w-full">
            <h3 className="text-2xl font-black mb-4">Confirm Delete</h3>
            <p className="text-gray-400 mb-6">
              Are you sure you want to delete the profile image? This action cannot be undone.
            </p>
            <div className="flex gap-4">
              <button
                onClick={handleDeleteImage}
                className="flex-1 px-6 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-xl transition-all font-bold"
              >
                Yes
              </button>
              <button
                onClick={() => setShowDeleteImageConfirm(false)}
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

export default Profile;
