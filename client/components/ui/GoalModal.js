import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  XMarkIcon,
  TargetIcon,
  CalendarIcon,
  PlusIcon,
  TrashIcon,
  CheckIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const GoalModal = ({ isOpen, onClose, onSave, goal = null, students = [] }) => {
  const [formData, setFormData] = useState({
    studentId: '',
    title: '',
    description: '',
    category: 'academic',
    priority: 'medium',
    targetDate: '',
    milestones: [],
    metrics: [],
    tags: [],
    isPublic: false
  });
  const [newMilestone, setNewMilestone] = useState('');
  const [newMetric, setNewMetric] = useState({ name: '', targetValue: '', unit: '' });
  const [newTag, setNewTag] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (goal) {
      setFormData({
        studentId: goal.student?._id || goal.student || '',
        title: goal.title || '',
        description: goal.description || '',
        category: goal.category || 'academic',
        priority: goal.priority || 'medium',
        targetDate: goal.targetDate ? new Date(goal.targetDate).toISOString().split('T')[0] : '',
        milestones: goal.milestones || [],
        metrics: goal.metrics || [],
        tags: goal.tags || [],
        isPublic: goal.isPublic || false
      });
    } else {
      setFormData({
        studentId: '',
        title: '',
        description: '',
        category: 'academic',
        priority: 'medium',
        targetDate: '',
        milestones: [],
        metrics: [],
        tags: [],
        isPublic: false
      });
    }
  }, [goal, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.studentId || !formData.title || !formData.targetDate) {
      toast.error('Lütfen tüm gerekli alanları doldurun');
      return;
    }

    if (new Date(formData.targetDate) <= new Date()) {
      toast.error('Hedef tarihi bugünden sonra olmalıdır');
      return;
    }

    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Goal save error:', error);
      toast.error('Hedef kaydedilirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const addMilestone = () => {
    if (!newMilestone.trim()) {
      toast.error('Kilometre taşı adı gerekli');
      return;
    }

    setFormData(prev => ({
      ...prev,
      milestones: [...prev.milestones, {
        title: newMilestone,
        completed: false,
        notes: ''
      }]
    }));
    setNewMilestone('');
  };

  const removeMilestone = (milestoneIndex) => {
    const updatedMilestones = [...formData.milestones];
    updatedMilestones.splice(milestoneIndex, 1);
    
    setFormData(prev => ({
      ...prev,
      milestones: updatedMilestones
    }));
  };

  const addMetric = () => {
    if (!newMetric.name.trim() || !newMetric.targetValue) {
      toast.error('Metrik adı ve hedef değer gerekli');
      return;
    }

    setFormData(prev => ({
      ...prev,
      metrics: [...prev.metrics, {
        ...newMetric,
        currentValue: 0
      }]
    }));
    setNewMetric({ name: '', targetValue: '', unit: '' });
  };

  const removeMetric = (metricIndex) => {
    const updatedMetrics = [...formData.metrics];
    updatedMetrics.splice(metricIndex, 1);
    
    setFormData(prev => ({
      ...prev,
      metrics: updatedMetrics
    }));
  };

  const addTag = () => {
    if (!newTag.trim()) {
      toast.error('Etiket adı gerekli');
      return;
    }

    if (formData.tags.includes(newTag.trim())) {
      toast.error('Bu etiket zaten eklenmiş');
      return;
    }

    setFormData(prev => ({
      ...prev,
      tags: [...prev.tags, newTag.trim()]
    }));
    setNewTag('');
  };

  const removeTag = (tagIndex) => {
    const updatedTags = [...formData.tags];
    updatedTags.splice(tagIndex, 1);
    
    setFormData(prev => ({
      ...prev,
      tags: updatedTags
    }));
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 overflow-y-auto"
      >
        <div className="flex min-h-screen items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full max-w-4xl bg-white rounded-lg shadow-xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {goal ? 'Hedefi Düzenle' : 'Yeni Hedef Oluştur'}
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Student Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Öğrenci *
                  </label>
                  <select
                    value={formData.studentId}
                    onChange={(e) => setFormData(prev => ({ ...prev, studentId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Öğrenci seçin</option>
                    {students.map(student => (
                      <option key={student._id} value={student._id}>
                        {student.firstName} {student.lastName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kategori
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="academic">Akademik</option>
                    <option value="behavioral">Davranışsal</option>
                    <option value="social">Sosyal</option>
                    <option value="personal">Kişisel</option>
                    <option value="career">Kariyer</option>
                    <option value="other">Diğer</option>
                  </select>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hedef Başlığı *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Hedef başlığını girin"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Açıklama
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Hedef açıklamasını girin"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Priority */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Öncelik
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="low">Düşük</option>
                    <option value="medium">Orta</option>
                    <option value="high">Yüksek</option>
                    <option value="urgent">Acil</option>
                  </select>
                </div>

                {/* Target Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hedef Tarihi *
                  </label>
                  <input
                    type="date"
                    value={formData.targetDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, targetDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* Milestones */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kilometre Taşları
                </label>
                
                {/* Add Milestone */}
                <div className="flex space-x-2 mb-4">
                  <input
                    type="text"
                    value={newMilestone}
                    onChange={(e) => setNewMilestone(e.target.value)}
                    placeholder="Kilometre taşı ekle"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={addMilestone}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <PlusIcon className="h-4 w-4" />
                  </button>
                </div>

                {/* Milestones List */}
                <div className="space-y-2">
                  {formData.milestones.map((milestone, milestoneIndex) => (
                    <div key={milestoneIndex} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-900">{milestone.title}</span>
                      <button
                        type="button"
                        onClick={() => removeMilestone(milestoneIndex)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Metrics */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Metrikler
                </label>
                
                {/* Add Metric */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-4">
                  <input
                    type="text"
                    value={newMetric.name}
                    onChange={(e) => setNewMetric(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Metrik adı"
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    type="number"
                    value={newMetric.targetValue}
                    onChange={(e) => setNewMetric(prev => ({ ...prev, targetValue: e.target.value }))}
                    placeholder="Hedef değer"
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    type="text"
                    value={newMetric.unit}
                    onChange={(e) => setNewMetric(prev => ({ ...prev, unit: e.target.value }))}
                    placeholder="Birim"
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={addMetric}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <PlusIcon className="h-4 w-4" />
                  </button>
                </div>

                {/* Metrics List */}
                <div className="space-y-2">
                  {formData.metrics.map((metric, metricIndex) => (
                    <div key={metricIndex} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <span className="text-sm font-medium text-gray-900">{metric.name}</span>
                        <span className="text-sm text-gray-600">
                          Hedef: {metric.targetValue} {metric.unit}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeMetric(metricIndex)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Etiketler
                </label>
                
                {/* Add Tag */}
                <div className="flex space-x-2 mb-4">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Etiket ekle"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <PlusIcon className="h-4 w-4" />
                  </button>
                </div>

                {/* Tags List */}
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, tagIndex) => (
                    <span
                      key={tagIndex}
                      className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                    >
                      #{tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tagIndex)}
                        className="ml-2 text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        <XMarkIcon className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Public Goal */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={formData.isPublic}
                  onChange={(e) => setFormData(prev => ({ ...prev, isPublic: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-900">
                  Bu hedefi diğer öğretmenlerle paylaş
                </label>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Kaydediliyor...' : (goal ? 'Güncelle' : 'Oluştur')}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default GoalModal;

