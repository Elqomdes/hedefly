import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import TeacherLayout from '../../../components/layout/TeacherLayout';
import { motion } from 'framer-motion';
import { ArrowLeftIcon, BookOpenIcon, PlusIcon, XMarkIcon, LinkIcon, DocumentIcon } from '@heroicons/react/24/outline';
import { assignmentsAPI, classesAPI, teachersAPI } from '../../../lib/api';
import toast from 'react-hot-toast';

const subjects = [
  'Matematik', 'Fizik', 'Kimya', 'Biyoloji', 'Türkçe', 'Edebiyat',
  'Tarih', 'Coğrafya', 'Felsefe', 'İngilizce', 'Almanca', 'Fransızca',
  'Bilgisayar', 'Müzik', 'Resim', 'Beden Eğitimi', 'Diğer'
];

export default function CreateAssignmentPage() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    type: 'individual',
    dueDate: '',
    classId: '',
    studentIds: [],
    videoLinks: []
  });
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [newVideoLink, setNewVideoLink] = useState({ title: '', url: '', description: '' });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchClasses();
    fetchStudents();
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await classesAPI.getAll();
      setClasses(response.data?.classes || []);
    } catch (error) {
      console.error('Classes fetch error:', error);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await teachersAPI.getStudents();
      setStudents(response.data || []);
    } catch (error) {
      console.error('Students fetch error:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const newAttachments = files.map(file => ({
      file,
      name: file.name,
      size: file.size,
      type: file.type
    }));
    setAttachments(prev => [...prev, ...newAttachments]);
  };

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const addVideoLink = () => {
    if (newVideoLink.title && newVideoLink.url) {
      setFormData(prev => ({
        ...prev,
        videoLinks: [...prev.videoLinks, { ...newVideoLink }]
      }));
      setNewVideoLink({ title: '', url: '', description: '' });
    }
  };

  const removeVideoLink = (index) => {
    setFormData(prev => ({
      ...prev,
      videoLinks: prev.videoLinks.filter((_, i) => i !== index)
    }));
  };

  const handleStudentSelection = (studentId, checked) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        studentIds: [...prev.studentIds, studentId]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        studentIds: prev.studentIds.filter(id => id !== studentId)
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formDataToSend = new FormData();
      
      // Add basic fields
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('subject', formData.subject);
      formDataToSend.append('type', formData.type);
      formDataToSend.append('dueDate', formData.dueDate);
      
      // Add class or students
      if (formData.type === 'class' && formData.classId) {
        formDataToSend.append('classId', formData.classId);
      } else if (formData.type === 'individual' && formData.studentIds.length > 0) {
        formDataToSend.append('studentIds', JSON.stringify(formData.studentIds));
      }
      
      // Add video links
      if (formData.videoLinks.length > 0) {
        formDataToSend.append('videoLinks', JSON.stringify(formData.videoLinks));
      }
      
      // Add attachments
      attachments.forEach((attachment, index) => {
        formDataToSend.append('attachments', attachment.file);
      });

      const result = await assignmentsAPI.create(formDataToSend);
      if (result.success) {
        toast.success('Ödev başarıyla oluşturuldu!');
        router.push('/teacher/assignments');
      } else {
        toast.error(result.error || 'Ödev oluşturulurken bir hata oluştu');
      }
    } catch (error) {
      console.error('Create assignment error:', error);
      toast.error('Ödev oluşturulurken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Yeni Ödev Oluştur - Hedefly</title>
        <meta name="description" content="Yeni ödev oluştur - Hedefly" />
      </Head>

      <TeacherLayout>
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <Link href="/teacher/assignments" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4">
              <ArrowLeftIcon className="h-4 w-4 mr-1" />
              Ödevlere Dön
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Yeni Ödev Oluştur</h1>
            <p className="text-gray-600">Öğrencilerinize yeni bir ödev verin</p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="card p-8"
          >
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Temel Bilgiler</h3>
                <div className="space-y-6">
                  <div>
                    <label htmlFor="title" className="label block text-sm font-medium text-gray-700 mb-2">
                      Ödev Başlığı *
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      required
                      value={formData.title}
                      onChange={handleChange}
                      className="input w-full"
                      placeholder="Ödev başlığını girin"
                    />
                  </div>

                  <div>
                    <label htmlFor="description" className="label block text-sm font-medium text-gray-700 mb-2">
                      Açıklama
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      rows={4}
                      value={formData.description}
                      onChange={handleChange}
                      className="input w-full resize-none"
                      placeholder="Ödev açıklamasını girin..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="subject" className="label block text-sm font-medium text-gray-700 mb-2">
                        Ders *
                      </label>
                      <select
                        id="subject"
                        name="subject"
                        required
                        value={formData.subject}
                        onChange={handleChange}
                        className="input w-full"
                      >
                        <option value="">Ders seçin</option>
                        {subjects.map(subject => (
                          <option key={subject} value={subject}>{subject}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="dueDate" className="label block text-sm font-medium text-gray-700 mb-2">
                        Son Tarih *
                      </label>
                      <input
                        type="datetime-local"
                        id="dueDate"
                        name="dueDate"
                        required
                        value={formData.dueDate}
                        onChange={handleChange}
                        className="input w-full"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Assignment Type */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Ödev Türü</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className={`relative flex cursor-pointer rounded-lg p-4 border-2 ${
                    formData.type === 'individual' 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 bg-white'
                  }`}>
                    <input
                      type="radio"
                      name="type"
                      value="individual"
                      checked={formData.type === 'individual'}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <div className="flex flex-col">
                      <div className="text-sm font-medium text-gray-900">Bireysel Ödev</div>
                      <div className="text-xs text-gray-500">Belirli öğrencilere ödev verin</div>
                    </div>
                  </label>
                  
                  <label className={`relative flex cursor-pointer rounded-lg p-4 border-2 ${
                    formData.type === 'class' 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 bg-white'
                  }`}>
                    <input
                      type="radio"
                      name="type"
                      value="class"
                      checked={formData.type === 'class'}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <div className="flex flex-col">
                      <div className="text-sm font-medium text-gray-900">Sınıf Ödevi</div>
                      <div className="text-xs text-gray-500">Tüm sınıfa ödev verin</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Target Selection */}
              {formData.type === 'class' ? (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Sınıf Seçimi</h3>
                  <select
                    name="classId"
                    value={formData.classId}
                    onChange={handleChange}
                    className="input w-full"
                    required
                  >
                    <option value="">Sınıf seçin</option>
                    {classes.map(classItem => (
                      <option key={classItem._id} value={classItem._id}>
                        {classItem.name} - {classItem.subject}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Öğrenci Seçimi</h3>
                  <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-4">
                    <div className="space-y-2">
                      {students.map(student => (
                        <label key={student._id} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.studentIds.includes(student._id)}
                            onChange={(e) => handleStudentSelection(student._id, e.target.checked)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-900">
                            {student.firstName} {student.lastName} ({student.studentId})
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {formData.studentIds.length} öğrenci seçildi
                  </p>
                </div>
              )}

              {/* File Attachments */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Dosya Ekleri</h3>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <div className="text-center">
                      <DocumentIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-sm text-gray-600">
                        Dosyaları sürükleyin veya{' '}
                        <span className="text-blue-600 hover:text-blue-500">tıklayarak seçin</span>
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        PDF, DOC, DOCX, TXT, JPG, PNG dosyaları desteklenir
                      </p>
                    </div>
                  </label>
                </div>

                {attachments.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {attachments.map((attachment, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <DocumentIcon className="h-5 w-5 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">{attachment.name}</span>
                          <span className="text-xs text-gray-500 ml-2">
                            ({(attachment.size / 1024 / 1024).toFixed(2)} MB)
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeAttachment(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Video Links */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Video Linkleri</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input
                      type="text"
                      placeholder="Video başlığı"
                      value={newVideoLink.title}
                      onChange={(e) => setNewVideoLink(prev => ({ ...prev, title: e.target.value }))}
                      className="input"
                    />
                    <input
                      type="url"
                      placeholder="Video URL'si"
                      value={newVideoLink.url}
                      onChange={(e) => setNewVideoLink(prev => ({ ...prev, url: e.target.value }))}
                      className="input"
                    />
                    <button
                      type="button"
                      onClick={addVideoLink}
                      className="btn btn-outline btn-md"
                    >
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Ekle
                    </button>
                  </div>

                  {formData.videoLinks.length > 0 && (
                    <div className="space-y-2">
                      {formData.videoLinks.map((link, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center">
                            <LinkIcon className="h-5 w-5 text-gray-400 mr-2" />
                            <div>
                              <span className="text-sm font-medium text-gray-900">{link.title}</span>
                              <p className="text-xs text-gray-500">{link.url}</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeVideoLink(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <XMarkIcon className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Submit */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <Link href="/teacher/assignments">
                  <button type="button" className="btn btn-outline btn-md">
                    İptal
                  </button>
                </Link>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn btn-primary btn-md group"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Oluşturuluyor...
                    </div>
                  ) : (
                    <>
                      <BookOpenIcon className="h-5 w-5 mr-2" />
                      Ödevi Oluştur
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </TeacherLayout>
    </>
  );
}

