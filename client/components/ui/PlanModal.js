import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  XMarkIcon,
  CalendarIcon,
  AcademicCapIcon,
  TargetIcon,
  PlusIcon,
  TrashIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const PlanModal = ({ isOpen, onClose, onSave, plan = null, students = [] }) => {
  const [formData, setFormData] = useState({
    studentId: '',
    type: 'daily',
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    subjects: [],
    goals: [],
    tags: []
  });
  const [newSubject, setNewSubject] = useState({ name: '', topics: [] });
  const [newTopic, setNewTopic] = useState('');
  const [newGoal, setNewGoal] = useState('');
  const [newTag, setNewTag] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (plan) {
      setFormData({
        studentId: plan.student?._id || plan.student || '',
        type: plan.type || 'daily',
        title: plan.title || '',
        description: plan.description || '',
        startDate: plan.startDate ? new Date(plan.startDate).toISOString().split('T')[0] : '',
        endDate: plan.endDate ? new Date(plan.endDate).toISOString().split('T')[0] : '',
        subjects: plan.subjects || [],
        goals: plan.goals || [],
        tags: plan.tags || []
      });
    } else {
      setFormData({
        studentId: '',
        type: 'daily',
        title: '',
        description: '',
        startDate: '',
        endDate: '',
        subjects: [],
        goals: [],
        tags: []
      });
    }
  }, [plan, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.studentId || !formData.title || !formData.startDate || !formData.endDate) {
      toast.error('Lütfen tüm gerekli alanları doldurun');
      return;
    }

    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      toast.error('Bitiş tarihi başlangıç tarihinden sonra olmalıdır');
      return;
    }

    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Plan save error:', error);
      toast.error('Plan kaydedilirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const addSubject = () => {
    if (!newSubject.name.trim()) {
      toast.error('Ders adı gerekli');
      return;
    }

    setFormData(prev => ({
      ...prev,
      subjects: [...prev.subjects, { ...newSubject, topics: [...newSubject.topics] }]
    }));
    setNewSubject({ name: '', topics: [] });
  };

  const addTopic = (subjectIndex) => {
    if (!newTopic.trim()) {
      toast.error('Konu adı gerekli');
      return;
    }

    const updatedSubjects = [...formData.subjects];
    updatedSubjects[subjectIndex].topics.push({
      title: newTopic,
      completed: false,
      notes: ''
    });
    
    setFormData(prev => ({
      ...prev,
      subjects: updatedSubjects
    }));
    setNewTopic('');
  };

  const removeTopic = (subjectIndex, topicIndex) => {
    const updatedSubjects = [...formData.subjects];
    updatedSubjects[subjectIndex].topics.splice(topicIndex, 1);
    
    setFormData(prev => ({
      ...prev,
      subjects: updatedSubjects
    }));
  };

  const addGoal = () => {
    if (!newGoal.trim()) {
      toast.error('Hedef adı gerekli');
      return;
    }

    setFormData(prev => ({
      ...prev,
      goals: [...prev.goals, {
        title: newGoal,
        completed: false,
        notes: ''
      }]
    }));
    setNewGoal('');
  };

  const removeGoal = (goalIndex) => {
    const updatedGoals = [...formData.goals];
    updatedGoals.splice(goalIndex, 1);
    
    setFormData(prev => ({
      ...prev,
      goals: updatedGoals
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

  const removeSubject = (subjectIndex) => {
    const updatedSubjects = [...formData.subjects];
    updatedSubjects.splice(subjectIndex, 1);
    
    setFormData(prev => ({
      ...prev,
      subjects: updatedSubjects
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
                {plan ? 'Planı Düzenle' : 'Yeni Plan Oluştur'}
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

                {/* Plan Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Plan Türü *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="daily">Günlük</option>
                    <option value="weekly">Haftalık</option>
                    <option value="monthly">Aylık</option>
                  </select>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Plan Başlığı *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Plan başlığını girin"
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
                  placeholder="Plan açıklamasını girin"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Start Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Başlangıç Tarihi *
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* End Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bitiş Tarihi *
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* Subjects */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dersler
                </label>
                
                {/* Add Subject */}
                <div className="mb-4 p-4 border border-gray-200 rounded-lg">
                  <div className="flex space-x-2 mb-2">
                    <input
                      type="text"
                      value={newSubject.name}
                      onChange={(e) => setNewSubject(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Ders adı"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={addSubject}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <PlusIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Subjects List */}
                {formData.subjects.map((subject, subjectIndex) => (
                  <div key={subjectIndex} className="mb-4 p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{subject.name}</h4>
                      <button
                        type="button"
                        onClick={() => removeSubject(subjectIndex)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                    
                    {/* Add Topic */}
                    <div className="flex space-x-2 mb-2">
                      <input
                        type="text"
                        value={newTopic}
                        onChange={(e) => setNewTopic(e.target.value)}
                        placeholder="Konu ekle"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => addTopic(subjectIndex)}
                        className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <PlusIcon className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Topics List */}
                    <div className="space-y-1">
                      {subject.topics.map((topic, topicIndex) => (
                        <div key={topicIndex} className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">{topic.title}</span>
                          <button
                            type="button"
                            onClick={() => removeTopic(subjectIndex, topicIndex)}
                            className="text-red-600 hover:text-red-800 transition-colors"
                          >
                            <TrashIcon className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Goals */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hedefler
                </label>
                
                {/* Add Goal */}
                <div className="flex space-x-2 mb-4">
                  <input
                    type="text"
                    value={newGoal}
                    onChange={(e) => setNewGoal(e.target.value)}
                    placeholder="Hedef ekle"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={addGoal}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <PlusIcon className="h-4 w-4" />
                  </button>
                </div>

                {/* Goals List */}
                <div className="space-y-2">
                  {formData.goals.map((goal, goalIndex) => (
                    <div key={goalIndex} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-900">{goal.title}</span>
                      <button
                        type="button"
                        onClick={() => removeGoal(goalIndex)}
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
                  {loading ? 'Kaydediliyor...' : (plan ? 'Güncelle' : 'Oluştur')}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PlanModal;

