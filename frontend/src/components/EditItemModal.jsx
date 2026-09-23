import React, { useState, useEffect } from 'react';
import { X, Save, UploadCloud, AlertCircle, CheckCircle2, Image as ImageIcon } from 'lucide-react';
import { categoryService } from '../services/categoryService';
import { uploadService } from '../services/uploadService';
import { itemService } from '../services/itemService';
import { resolveImageUrl } from './ItemCard';

export default function EditItemModal({ isOpen, onClose, item, onSaveSuccess }) {
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    categoryId: '',
    location: '',
    itemDate: '',
    status: 'ACTIVE',
    imageUrl: '',
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch categories on open
  useEffect(() => {
    if (!isOpen) return;

    categoryService
      .getCategories()
      .then((data) => setCategories(data))
      .catch((err) => console.error('Failed to load categories', err));
  }, [isOpen]);

  // Populate form data when item changes
  useEffect(() => {
    if (item && isOpen) {
      // Format itemDate to YYYY-MM-DDTHH:mm if available for input[type="datetime-local"]
      let formattedDate = '';
      if (item.itemDate) {
        try {
          const d = new Date(item.itemDate);
          formattedDate = d.toISOString().slice(0, 16);
        } catch {
          formattedDate = '';
        }
      }

      setFormData({
        title: item.title || '',
        description: item.description || '',
        categoryId: item.category?.id || '',
        location: item.location || '',
        itemDate: formattedDate,
        status: item.status || 'ACTIVE',
        imageUrl: item.imageUrl || '',
      });
      setPreviewUrl(resolveImageUrl(item.imageUrl) || '');
      setSelectedFile(null);
      setErrorMessage('');
      setUploadProgress(0);
    }
  }, [item, isOpen]);

  if (!isOpen || !item) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errorMessage) setErrorMessage('');
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validation = uploadService.validateImage(file);
    if (!validation.valid) {
      setErrorMessage(validation.error);
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setErrorMessage('');
    setIsUploading(true);
    setUploadProgress(10);

    try {
      const uploadRes = await uploadService.uploadItemImage(file, (percent) => {
        setUploadProgress(percent);
      });
      setFormData((prev) => ({ ...prev, imageUrl: uploadRes.imageUrl }));
    } catch (err) {
      setErrorMessage(
        err.response?.data?.message || err.message || 'Failed to upload new image.'
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.title.trim()) {
      setErrorMessage('Item title is required.');
      return;
    }
    if (!formData.description.trim()) {
      setErrorMessage('Description is required.');
      return;
    }
    if (!formData.categoryId) {
      setErrorMessage('Please select a category.');
      return;
    }
    if (!formData.location.trim()) {
      setErrorMessage('Location is required.');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        categoryId: Number(formData.categoryId),
        location: formData.location.trim(),
        itemDate: formData.itemDate ? new Date(formData.itemDate).toISOString() : null,
        status: formData.status,
        imageUrl: formData.imageUrl || null,
      };

      const updated = await itemService.updateItem(item.id, payload);
      onSaveSuccess(updated);
      onClose();
    } catch (err) {
      setErrorMessage(
        err.response?.data?.message || 'Failed to update item. Please check the fields.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="glass-card max-w-2xl w-full p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl bg-slate-950/95 relative my-8 animate-scale-up max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Edit {item.type === 'LOST' ? 'Lost' : 'Found'} Item
            </h2>
            <p className="text-xs text-slate-400">Update item details, status, or photo.</p>
          </div>
          <button
            onClick={onClose}
            disabled={isSaving}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-900 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-2.5 animate-fade-in">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* Title */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1.5" htmlFor="edit-title">
              Item Name / Title <span className="text-rose-400">*</span>
            </label>
            <input
              id="edit-title"
              name="title"
              type="text"
              required
              value={formData.title}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 bg-slate-900/80 border border-slate-800 focus:border-teal-500 rounded-xl text-sm text-slate-100 placeholder-slate-500 transition-all outline-none"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1.5" htmlFor="edit-desc">
              Description <span className="text-rose-400">*</span>
            </label>
            <textarea
              id="edit-desc"
              name="description"
              rows={3}
              required
              value={formData.description}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 bg-slate-900/80 border border-slate-800 focus:border-teal-500 rounded-xl text-sm text-slate-100 placeholder-slate-500 transition-all outline-none resize-none"
            />
          </div>

          {/* Category & Status Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-300 mb-1.5" htmlFor="edit-cat">
                Category <span className="text-rose-400">*</span>
              </label>
              <select
                id="edit-cat"
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-900/80 border border-slate-800 focus:border-teal-500 rounded-xl text-sm text-slate-100 transition-all outline-none"
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1.5" htmlFor="edit-status">
                Status <span className="text-rose-400">*</span>
              </label>
              <select
                id="edit-status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-900/80 border border-slate-800 focus:border-teal-500 rounded-xl text-sm text-slate-100 transition-all outline-none"
              >
                <option value="ACTIVE">ACTIVE (Open)</option>
                <option value="RESOLVED">RESOLVED (Returned / Closed)</option>
              </select>
            </div>
          </div>

          {/* Location & Date Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-300 mb-1.5" htmlFor="edit-loc">
                Location on Campus <span className="text-rose-400">*</span>
              </label>
              <input
                id="edit-loc"
                name="location"
                type="text"
                required
                value={formData.location}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-900/80 border border-slate-800 focus:border-teal-500 rounded-xl text-sm text-slate-100 placeholder-slate-500 transition-all outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1.5" htmlFor="edit-date">
                Date &amp; Time
              </label>
              <input
                id="edit-date"
                name="itemDate"
                type="datetime-local"
                value={formData.itemDate}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-900/80 border border-slate-800 focus:border-teal-500 rounded-xl text-sm text-slate-100 transition-all outline-none"
              />
            </div>
          </div>

          {/* Photo Upload & Preview */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1.5">Item Photo</label>
            <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
              {previewUrl ? (
                <div className="w-24 h-24 rounded-xl overflow-hidden bg-slate-800 flex-shrink-0 relative border border-slate-700">
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-24 h-24 rounded-xl bg-slate-800 flex flex-col items-center justify-center text-slate-500 flex-shrink-0">
                  <ImageIcon className="w-6 h-6" />
                </div>
              )}

              <div className="flex-1 w-full text-left">
                <label className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold cursor-pointer transition-colors">
                  <UploadCloud className="w-4 h-4 text-teal-400" />
                  <span>{previewUrl ? 'Change Photo' : 'Upload Photo'}</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={isUploading}
                  />
                </label>
                <div className="text-[11px] text-slate-500 mt-1.5">
                  JPG, JPEG, PNG, WEBP (Max 5MB)
                </div>

                {isUploading && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-[11px] text-teal-400 mb-1">
                      <span>Uploading...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-teal-400 transition-all duration-200"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving || isUploading}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700 transition-all disabled:opacity-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving || isUploading}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-950 bg-gradient-to-r from-teal-400 to-cyan-400 hover:from-teal-300 hover:to-cyan-300 shadow-glow transition-all disabled:opacity-50 cursor-pointer"
            >
              {isSaving ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
