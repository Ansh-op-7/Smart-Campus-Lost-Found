import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Search,
  PlusCircle,
  Tag,
  MapPin,
  Calendar,
  UploadCloud,
  AlertCircle,
  CheckCircle2,
  Image as ImageIcon,
  ArrowLeft,
  Sparkles,
  X,
  FileText,
} from 'lucide-react';
import { categoryService } from '../services/categoryService';
import { uploadService } from '../services/uploadService';
import { itemService } from '../services/itemService';
import { useToast } from '../context/ToastContext';

export default function ReportItem({ type: propType }) {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  // Determine item type from prop or path
  const itemType =
    propType || (location.pathname.includes('found') ? 'FOUND' : 'LOST');
  const isLost = itemType === 'LOST';

  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    categoryId: '',
    location: '',
    itemDate: new Date().toISOString().slice(0, 16),
    imageUrl: '',
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  // Fetch categories on mount
  useEffect(() => {
    setCategoriesLoading(true);
    setCategoriesError('');
    categoryService
      .getCategories()
      .then((data) => {
        setCategories(data || []);
      })
      .catch((err) => {
        console.error('Failed to load categories', err);
        setCategoriesError('Unable to load categories. Please check backend connection.');
      })
      .finally(() => {
        setCategoriesLoading(false);
      });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (errorMessage) setErrorMessage('');
  };

  const handleProcessFile = async (file) => {
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
    setUploadProgress(15);

    try {
      const uploadRes = await uploadService.uploadItemImage(file, (percent) => {
        setUploadProgress(percent);
      });
      setFormData((prev) => ({ ...prev, imageUrl: uploadRes.imageUrl }));
      toast.success('Image uploaded successfully.');
    } catch (err) {
      console.error('Image upload failed', err);
      setErrorMessage(
        err.response?.data?.message || err.message || 'Image upload failed. Please try another image.'
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    handleProcessFile(file);
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    setFormData((prev) => ({ ...prev, imageUrl: '' }));
    setUploadProgress(0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    const errors = {};

    if (!formData.title.trim()) errors.title = 'Item title is required.';
    if (!formData.description.trim()) errors.description = 'Description is required.';
    if (!formData.categoryId) errors.categoryId = 'Please select a category.';
    if (!formData.location.trim()) errors.location = 'Campus location is required.';
    if (!formData.itemDate) errors.itemDate = 'Date & time is required.';

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        categoryId: Number(formData.categoryId),
        location: formData.location.trim(),
        itemDate: new Date(formData.itemDate).toISOString(),
        type: itemType,
        imageUrl: formData.imageUrl || null,
      };

      const created = await itemService.createItem(payload);
      toast.success(`${isLost ? 'Lost' : 'Found'} item reported successfully!`);
      navigate(`/items/${created.id}`);
    } catch (err) {
      console.error('Failed to create item', err);
      const msg =
        err.response?.data?.message ||
        (err.response?.data?.errors
          ? Object.values(err.response.data.errors).join(', ')
          : 'Failed to create report. Please verify all required fields.');
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Back link */}
      <div className="mb-6">
        <Link
          to="/browse"
          className="inline-flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-teal-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Browse Feed</span>
        </Link>
      </div>

      {/* Header Banner */}
      <div className="text-center mb-8">
        <div
          className={`inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold mb-3 ${
            isLost
              ? 'bg-rose-500/10 border border-rose-500/20 text-rose-300'
              : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300'
          }`}
        >
          {isLost ? <Search className="w-3.5 h-3.5" /> : <PlusCircle className="w-3.5 h-3.5" />}
          <span>{isLost ? 'Lost Item Report' : 'Found Item Report'}</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight font-['Plus_Jakarta_Sans']">
          Report {isLost ? 'Lost' : 'Found'} Item
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-lg mx-auto">
          {isLost
            ? 'Provide descriptive details to help finders identify and return your item safely.'
            : 'Help reunite a misplaced item with its rightful owner on campus.'}
        </p>
      </div>

      {/* Form Card */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl backdrop-blur-xl">
        
        {/* Error Banner */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-3 animate-fade-in">
            <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-bold">Please check the form</div>
              <div>{errorMessage}</div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Section 1: Item Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800/80">
              <FileText className="w-4 h-4 text-teal-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                1. Item Information
              </h2>
            </div>

            {/* Title / Item Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5" htmlFor="title">
                Item Title <span className="text-rose-400">*</span>
              </label>
              <input
                id="title"
                name="title"
                type="text"
                required
                placeholder={isLost ? 'e.g. Silver MacBook Air in leather sleeve' : 'e.g. Blue Hydroflask Water Bottle'}
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-900/80 border border-slate-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 rounded-xl text-sm text-slate-100 placeholder-slate-500 transition-all outline-none"
              />
              {fieldErrors.title && (
                <p className="text-[11px] text-rose-400 mt-1">{fieldErrors.title}</p>
              )}
            </div>

            {/* Category & Location Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Category Dropdown */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5" htmlFor="categoryId">
                  Category <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Tag className="w-4 h-4" />
                  </div>
                  <select
                    id="categoryId"
                    name="categoryId"
                    required
                    value={formData.categoryId}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-800 focus:border-teal-500 rounded-xl text-sm text-slate-100 transition-all outline-none cursor-pointer"
                  >
                    {categoriesLoading ? (
                      <option value="" disabled>
                        Loading categories...
                      </option>
                    ) : categoriesError ? (
                      <option value="" disabled>
                        Unable to load categories.
                      </option>
                    ) : categories.length === 0 ? (
                      <option value="" disabled>
                        No categories available.
                      </option>
                    ) : (
                      <option value="">Select Category</option>
                    )}
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id} className="bg-slate-900 text-slate-100">
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                {categoriesError && (
                  <p className="text-[11px] text-rose-400 mt-1">{categoriesError}</p>
                )}
                {fieldErrors.categoryId && !categoriesError && (
                  <p className="text-[11px] text-rose-400 mt-1">{fieldErrors.categoryId}</p>
                )}
              </div>

              {/* Location */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5" htmlFor="location">
                  Location on Campus <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <input
                    id="location"
                    name="location"
                    type="text"
                    required
                    placeholder="e.g. Library 2nd Floor, Lab 4"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-800 focus:border-teal-500 rounded-xl text-sm text-slate-100 placeholder-slate-500 transition-all outline-none"
                  />
                </div>
                {fieldErrors.location && (
                  <p className="text-[11px] text-rose-400 mt-1">{fieldErrors.location}</p>
                )}
              </div>
            </div>

            {/* Date & Time */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5" htmlFor="itemDate">
                {isLost ? 'Date & Time Lost' : 'Date & Time Found'} <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Calendar className="w-4 h-4" />
                </div>
                <input
                  id="itemDate"
                  name="itemDate"
                  type="datetime-local"
                  required
                  value={formData.itemDate}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-800 focus:border-teal-500 rounded-xl text-sm text-slate-100 transition-all outline-none"
                />
              </div>
              {fieldErrors.itemDate && (
                <p className="text-[11px] text-rose-400 mt-1">{fieldErrors.itemDate}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5" htmlFor="description">
                Detailed Description <span className="text-rose-400">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                required
                placeholder="Include distinctive markings, color, brand, stickers, serial details, or specific context..."
                value={formData.description}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-900/80 border border-slate-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 rounded-xl text-sm text-slate-100 placeholder-slate-500 transition-all outline-none resize-none"
              />
              {fieldErrors.description && (
                <p className="text-[11px] text-rose-400 mt-1">{fieldErrors.description}</p>
              )}
            </div>
          </div>

          {/* Section 2: Item Image */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800/80">
              <ImageIcon className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                2. Item Image
              </h2>
            </div>

            {/* Upload Area */}
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
              {previewUrl ? (
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="w-28 h-28 rounded-2xl overflow-hidden bg-slate-800 flex-shrink-0 relative border border-slate-700 shadow-lg">
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 text-center sm:text-left space-y-1.5">
                    <div className="text-xs font-bold text-white truncate max-w-xs">
                      {selectedFile ? selectedFile.name : 'Uploaded Photo'}
                    </div>
                    {selectedFile && (
                      <div className="text-[11px] text-slate-400">
                        {(selectedFile.size / 1024).toFixed(1)} KB • Ready
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 text-xs font-medium cursor-pointer transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Remove Image</span>
                    </button>
                  </div>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-700/80 hover:border-teal-500/60 rounded-2xl cursor-pointer bg-slate-950/40 hover:bg-slate-900/40 transition-all text-center group">
                  <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold text-slate-200 group-hover:text-teal-300 transition-colors">
                    Click to browse or drag and drop image here
                  </span>
                  <span className="text-[11px] text-slate-500 mt-1">
                    Supports JPG, PNG, WEBP (Max 5MB)
                  </span>
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={isUploading}
                  />
                </label>
              )}

              {isUploading && (
                <div className="pt-2">
                  <div className="flex items-center justify-between text-[11px] text-teal-400 mb-1">
                    <span>Uploading photo to server...</span>
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

          {/* Submit Button */}
          <div className="pt-4 border-t border-slate-800">
            <button
              type="submit"
              disabled={isSubmitting || isUploading}
              className={`w-full py-3.5 px-6 rounded-2xl font-bold text-sm text-slate-950 shadow-glow transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${
                isLost
                  ? 'bg-gradient-to-r from-rose-400 to-amber-400 hover:from-rose-300 hover:to-amber-300'
                  : 'bg-gradient-to-r from-teal-400 to-cyan-400 hover:from-teal-300 hover:to-cyan-300'
              }`}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Submitting Report...</span>
                </div>
              ) : (
                <span>{isLost ? 'Report Lost Item' : 'Report Found Item'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
