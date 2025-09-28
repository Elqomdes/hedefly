import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import TeacherLayout from '../../../components/layout/TeacherLayout';
import { motion } from 'framer-motion';
import { ArrowLeftIcon, ClipboardDocumentListIcon, PlusIcon, XMarkIcon, TrashIcon } from '@heroicons/react/24/outline';
import { examsAPI, classesAPI, teachersAPI } from '../../../lib/api';
import toast from 'react-hot-toast';

const subjects = [
  'Matematik', 'Fizik', 'Kimya', 'Biyoloji', 'Türkçe', 'Edebiyat',
  'Tarih', 'Coğrafya', 'Felsefe', 'İngilizce', 'Almanca', 'Fransızca',
  'Bilgisayar', 'Müzik', 'Resim', 'Beden Eğitimi', 'Diğer'
];

const examTypes = [
  { value: 'quiz', label: 'Quiz', description: 'Kısa süreli test' },
  { value: 'exam', label: 'Sınav', description: 'Normal sınav' },
  { value: 'practice', label: 'Deneme', description: 'Deneme sınavı' }
];

export default function CreateExamPage() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    type: 'quiz',
    examDate: '',
    duration: 60,
    totalPoints: 100,
    classId: '',
    studentIds: [],
    questions: []
  });
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
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

  const addQuestion = () => {
    const newQuestion = {
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      points: 1
    };
    setFormData(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion]
    }));
  };

  const updateQuestion = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => 
        i === index ? { ...q, [field]: value } : q
      )
    }));
  };

  const updateQuestionOption = (questionIndex, optionIndex, value) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => 
        i === questionIndex 
          ? { 
              ...q, 
              options: q.options.map((opt, j) => 
                j === optionIndex ? value : opt
              )
            }
          : q
      )
    }));
  };

  const removeQuestion = (index) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
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
    
    if (formData.questions.length === 0) {
      toast.error('En az bir soru eklemelisiniz');
      return;
    }

    setIsLoading(true);

    try {
      const result = await examsAPI.create(formData);
      if (result.success) {
        toast.success('Sınav başarıyla oluşturuldu!');
        router.push('/teacher/exams');
      } else {
        toast.error(result.error || 'Sınav oluşturulurken bir hata oluştu');
      }
    } catch (error) {
      console.error('Create exam error:', error);
      toast.error('Sınav oluşturulurken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Yeni Sınav Oluştur - Hedefly</title>
        <meta name="description" content="Yeni sınav oluştur - Hedefly" />
      </Head>

      <TeacherLayout>
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <Link href="/teacher/exams" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4">
              <ArrowLeftIcon className="h-4 w-4 mr-1" />
              Sınavlara Dön
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Yeni Sınav Oluştur</h1>
            <p className="text-gray-600">Online sınav oluşturun ve öğrencilerinize verin</p>
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
                      Sınav Başlığı *
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      required
                      value={formData.title}
                      onChange={handleChange}
                      className="input w-full"
                      placeholder="Sınav başlığını girin"
                    />
                  </div>

                  <div>
                    <label htmlFor="description" className="label block text-sm font-medium text-gray-700 mb-2">
                      Açıklama
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      rows={3}
                      value={formData.description}
                      onChange={handleChange}
                      className="input w-full resize-none"
                      placeholder="Sınav açıklamasını girin..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                      <label htmlFor="type" className="label block text-sm font-medium text-gray-700 mb-2">
                        Sınav Türü *
                      </label>
                      <select
                        id="type"
                        name="type"
                        required
                        value={formData.type}
                        onChange={handleChange}
                        className="input w-full"
                      >
                        {examTypes.map(type => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="examDate" className="label block text-sm font-medium text-gray-700 mb-2">
                        Sınav Tarihi *
                      </label>
                      <input
                        type="datetime-local"
                        id="examDate"
                        name="examDate"
                        required
                        value={formData.examDate}
                        onChange={handleChange}
                        className="input w-full"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="duration" className="label block text-sm font-medium text-gray-700 mb-2">
                        Süre (Dakika) *
                      </label>
                      <input
                        type="number"
                        id="duration"
                        name="duration"
                        required
                        min="1"
                        value={formData.duration}
                        onChange={handleChange}
                        className="input w-full"
                      />
                    </div>

                    <div>
                      <label htmlFor="totalPoints" className="label block text-sm font-medium text-gray-700 mb-2">
                        Toplam Puan *
                      </label>
                      <input
                        type="number"
                        id="totalPoints"
                        name="totalPoints"
                        required
                        min="1"
                        value={formData.totalPoints}
                        onChange={handleChange}
                        className="input w-full"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Target Selection */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Hedef Seçimi</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="label block text-sm font-medium text-gray-700 mb-2">
                      Sınıf Seçimi
                    </label>
                    <select
                      name="classId"
                      value={formData.classId}
                      onChange={handleChange}
                      className="input w-full"
                    >
                      <option value="">Sınıf seçin (opsiyonel)</option>
                      {classes.map(classItem => (
                        <option key={classItem._id} value={classItem._id}>
                          {classItem.name} - {classItem.subject}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="label block text-sm font-medium text-gray-700 mb-2">
                      Bireysel Öğrenci Seçimi
                    </label>
                    <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-3">
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
                </div>
              </div>

              {/* Questions */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Sorular</h3>
                  <button
                    type="button"
                    onClick={addQuestion}
                    className="btn btn-outline btn-sm"
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Soru Ekle
                  </button>
                </div>

                {formData.questions.length === 0 ? (
                  <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                    <ClipboardDocumentListIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Henüz soru eklenmedi</p>
                    <p className="text-sm text-gray-400">Yukarıdaki butona tıklayarak soru ekleyin</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {formData.questions.map((question, questionIndex) => (
                      <div key={questionIndex} className="border border-gray-200 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-medium text-gray-900">
                            Soru {questionIndex + 1}
                          </h4>
                          <button
                            type="button"
                            onClick={() => removeQuestion(questionIndex)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <label className="label block text-sm font-medium text-gray-700 mb-2">
                              Soru Metni *
                            </label>
                            <textarea
                              value={question.question}
                              onChange={(e) => updateQuestion(questionIndex, 'question', e.target.value)}
                              className="input w-full"
                              rows={3}
                              placeholder="Soruyu yazın..."
                              required
                            />
                          </div>

                          <div>
                            <label className="label block text-sm font-medium text-gray-700 mb-2">
                              Seçenekler *
                            </label>
                            <div className="space-y-2">
                              {question.options.map((option, optionIndex) => (
                                <div key={optionIndex} className="flex items-center space-x-3">
                                  <input
                                    type="radio"
                                    name={`correctAnswer_${questionIndex}`}
                                    checked={question.correctAnswer === optionIndex}
                                    onChange={() => updateQuestion(questionIndex, 'correctAnswer', optionIndex)}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                  />
                                  <input
                                    type="text"
                                    value={option}
                                    onChange={(e) => updateQuestionOption(questionIndex, optionIndex, e.target.value)}
                                    className="input flex-1"
                                    placeholder={`Seçenek ${optionIndex + 1}`}
                                    required
                                  />
                                </div>
                              ))}
                            </div>
                          </div>

                          <div>
                            <label className="label block text-sm font-medium text-gray-700 mb-2">
                              Puan *
                            </label>
                            <input
                              type="number"
                              min="1"
                              value={question.points}
                              onChange={(e) => updateQuestion(questionIndex, 'points', parseInt(e.target.value))}
                              className="input w-24"
                              required
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <Link href="/teacher/exams">
                  <button type="button" className="btn btn-outline btn-md">
                    İptal
                  </button>
                </Link>
                <button
                  type="submit"
                  disabled={isLoading || formData.questions.length === 0}
                  className="btn btn-primary btn-md group"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Oluşturuluyor...
                    </div>
                  ) : (
                    <>
                      <ClipboardDocumentListIcon className="h-5 w-5 mr-2" />
                      Sınavı Oluştur
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

