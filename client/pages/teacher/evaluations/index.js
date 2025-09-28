import { useState, useEffect } from 'react';
import Head from 'next/head';
import TeacherLayout from '../../../components/layout/TeacherLayout';
import { motion } from 'framer-motion';
import {
  ClipboardDocumentCheckIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  AcademicCapIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import { assignmentEvaluationsAPI } from '../../../lib/api';
import toast from 'react-hot-toast';

export default function TeacherEvaluations() {
  const [evaluations, setEvaluations] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [assignmentFilter, setAssignmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [studentFilter, setStudentFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showEvaluateModal, setShowEvaluateModal] = useState(false);
  const [selectedEvaluation, setSelectedEvaluation] = useState(null);

  const [evaluationData, setEvaluationData] = useState({
    grade: 0,
    criteria: [],
    feedback: '',
    strengths: [],
    improvements: [],
    suggestions: []
  });

  useEffect(() => {
    fetchEvaluations();
    fetchAssignments();
    fetchStudents();
  }, [currentPage, assignmentFilter, statusFilter, studentFilter, searchTerm]);

  const fetchEvaluations = async () => {
    try {
      setLoading(true);
      const response = await assignmentEvaluationsAPI.getMyEvaluations({
        page: currentPage,
        assignmentId: assignmentFilter !== 'all' ? assignmentFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        studentId: studentFilter !== 'all' ? studentFilter : undefined,
        search: searchTerm || undefined
      });
      setEvaluations(response.data.evaluations || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      console.error('Evaluations fetch error:', error);
      toast.error('Değerlendirmeler yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignments = async () => {
    try {
      const response = await assignmentEvaluationsAPI.getAssignments();
      setAssignments(response.data || []);
    } catch (error) {
      console.error('Assignments fetch error:', error);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await assignmentEvaluationsAPI.getStudents();
      setStudents(response.data || []);
    } catch (error) {
      console.error('Students fetch error:', error);
    }
  };

  const handleEvaluate = async (e) => {
    e.preventDefault();
    try {
      await assignmentEvaluationsAPI.evaluate(selectedEvaluation._id, evaluationData);
      toast.success('Ödev değerlendirildi');
      setShowEvaluateModal(false);
      setSelectedEvaluation(null);
      setEvaluationData({
        grade: 0,
        criteria: [],
        feedback: '',
        strengths: [],
        improvements: [],
        suggestions: []
      });
      fetchEvaluations();
    } catch (error) {
      console.error('Evaluate error:', error);
      toast.error(error.response?.data?.message || 'Değerlendirme yapılırken bir hata oluştu');
    }
  };

  const handleReturnEvaluation = async (evaluationId) => {
    try {
      await assignmentEvaluationsAPI.returnEvaluation(evaluationId);
      toast.success('Değerlendirme öğrenciye döndürüldü');
      fetchEvaluations();
    } catch (error) {
      console.error('Return evaluation error:', error);
      toast.error('Değerlendirme döndürülürken bir hata oluştu');
    }
  };

  const handleDeleteEvaluation = async (evaluationId) => {
    if (window.confirm('Bu değerlendirmeyi silmek istediğinizden emin misiniz?')) {
      try {
        await assignmentEvaluationsAPI.delete(evaluationId);
        toast.success('Değerlendirme silindi');
        fetchEvaluations();
      } catch (error) {
        console.error('Delete evaluation error:', error);
        toast.error('Değerlendirme silinirken bir hata oluştu');
      }
    }
  };

  const getStatusBadge = (status) => {
    const statuses = {
      submitted: { text: 'Teslim Edildi', color: 'bg-blue-100 text-blue-800', icon: DocumentTextIcon },
      evaluated: { text: 'Değerlendirildi', color: 'bg-green-100 text-green-800', icon: CheckCircleIcon },
      returned: { text: 'Döndürüldü', color: 'bg-purple-100 text-purple-800', icon: ClipboardDocumentCheckIcon },
      resubmitted: { text: 'Yeniden Teslim', color: 'bg-orange-100 text-orange-800', icon: ClockIcon },
      late: { text: 'Geç Teslim', color: 'bg-red-100 text-red-800', icon: ExclamationTriangleIcon }
    };
    return statuses[status] || { text: status, color: 'bg-gray-100 text-gray-800', icon: ClockIcon };
  };

  const getGradeColor = (grade) => {
    if (grade >= 90) return 'text-green-600';
    if (grade >= 80) return 'text-blue-600';
    if (grade >= 70) return 'text-yellow-600';
    if (grade >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const getLetterGrade = (grade) => {
    if (grade >= 97) return 'A+';
    if (grade >= 93) return 'A';
    if (grade >= 90) return 'A-';
    if (grade >= 87) return 'B+';
    if (grade >= 83) return 'B';
    if (grade >= 80) return 'B-';
    if (grade >= 77) return 'C+';
    if (grade >= 73) return 'C';
    if (grade >= 70) return 'C-';
    if (grade >= 67) return 'D+';
    if (grade >= 63) return 'D';
    if (grade >= 60) return 'D-';
    return 'F';
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchEvaluations();
  };

  const openEvaluateModal = (evaluation) => {
    setSelectedEvaluation(evaluation);
    setEvaluationData({
      grade: evaluation.evaluation?.grade || 0,
      criteria: evaluation.evaluation?.criteria || [],
      feedback: evaluation.evaluation?.feedback || '',
      strengths: evaluation.evaluation?.strengths || [],
      improvements: evaluation.evaluation?.improvements || [],
      suggestions: evaluation.evaluation?.suggestions || []
    });
    setShowEvaluateModal(true);
  };

  return (
    <>
      <Head>
        <title>Ödev Değerlendirmeleri - Hedefly</title>
        <meta name="description" content="Ödev değerlendirme yönetimi" />
      </Head>

      <TeacherLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Ödev Değerlendirmeleri</h1>
              <p className="text-gray-600">Öğrenci ödevlerini değerlendirin ve geri bildirim verin</p>
            </div>
          </div>

          {/* Filters */}
          <div className="card p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <form onSubmit={handleSearch} className="flex-1">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Ödev veya öğrenci ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input pl-10 w-full"
                  />
                </div>
              </form>
              
              <div className="flex gap-2">
                <select
                  value={assignmentFilter}
                  onChange={(e) => setAssignmentFilter(e.target.value)}
                  className="input"
                >
                  <option value="all">Tüm Ödevler</option>
                  {assignments.map(assignment => (
                    <option key={assignment._id} value={assignment._id}>
                      {assignment.title}
                    </option>
                  ))}
                </select>
                
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="input"
                >
                  <option value="all">Tüm Durumlar</option>
                  <option value="submitted">Teslim Edildi</option>
                  <option value="evaluated">Değerlendirildi</option>
                  <option value="returned">Döndürüldü</option>
                  <option value="resubmitted">Yeniden Teslim</option>
                  <option value="late">Geç Teslim</option>
                </select>

                <select
                  value={studentFilter}
                  onChange={(e) => setStudentFilter(e.target.value)}
                  className="input"
                >
                  <option value="all">Tüm Öğrenciler</option>
                  {students.map(student => (
                    <option key={student._id} value={student._id}>
                      {student.firstName} {student.lastName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Evaluations List */}
          <div className="space-y-4">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : evaluations.length > 0 ? (
              evaluations.map((evaluation, index) => {
                const status = getStatusBadge(evaluation.status);
                const StatusIcon = status.icon;
                return (
                  <motion.div
                    key={evaluation._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="card p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{evaluation.assignment.title}</h3>
                          <span className={`badge ${status.color}`}>
                            <StatusIcon className="h-4 w-4 mr-1" />
                            {status.text}
                          </span>
                          {evaluation.submission.isLate && (
                            <span className="badge bg-red-100 text-red-800">
                              <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                              {evaluation.submission.lateDays} gün geç
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-6 text-sm text-gray-500 mb-4">
                          <div className="flex items-center">
                            <AcademicCapIcon className="h-4 w-4 mr-1" />
                            {evaluation.student.firstName} {evaluation.student.lastName}
                          </div>
                          <div className="flex items-center">
                            <ClockIcon className="h-4 w-4 mr-1" />
                            {new Date(evaluation.submission.submittedAt).toLocaleDateString('tr-TR')}
                          </div>
                          <div className="flex items-center">
                            <DocumentTextIcon className="h-4 w-4 mr-1" />
                            {evaluation.submission.attachments.length} dosya
                          </div>
                          {evaluation.evaluation?.grade !== undefined && (
                            <div className="flex items-center">
                              <span className={`font-semibold ${getGradeColor(evaluation.evaluation.grade)}`}>
                                {evaluation.evaluation.grade}/100 ({getLetterGrade(evaluation.evaluation.grade)})
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Submission Content Preview */}
                        {evaluation.submission.content && (
                          <div className="mb-4">
                            <h4 className="text-sm font-medium text-gray-900 mb-2">Teslim İçeriği</h4>
                            <p className="text-sm text-gray-600 line-clamp-3">
                              {evaluation.submission.content}
                            </p>
                          </div>
                        )}

                        {/* Feedback Preview */}
                        {evaluation.evaluation?.feedback && (
                          <div className="mb-4">
                            <h4 className="text-sm font-medium text-gray-900 mb-2">Geri Bildirim</h4>
                            <p className="text-sm text-gray-600 line-clamp-2">
                              {evaluation.evaluation.feedback}
                            </p>
                          </div>
                        )}

                        {/* Comments Count */}
                        {evaluation.comments.length > 0 && (
                          <div className="flex items-center text-sm text-gray-500">
                            <ChatBubbleLeftRightIcon className="h-4 w-4 mr-1" />
                            {evaluation.comments.length} yorum
                          </div>
                        )}
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        <button className="btn btn-outline btn-sm">
                          <EyeIcon className="h-4 w-4 mr-1" />
                          Görüntüle
                        </button>
                        
                        {evaluation.status === 'submitted' && (
                          <button
                            onClick={() => openEvaluateModal(evaluation)}
                            className="btn btn-primary btn-sm"
                          >
                            <PencilIcon className="h-4 w-4 mr-1" />
                            Değerlendir
                          </button>
                        )}
                        
                        {evaluation.status === 'evaluated' && (
                          <button
                            onClick={() => handleReturnEvaluation(evaluation._id)}
                            className="btn btn-success btn-sm"
                          >
                            <CheckCircleIcon className="h-4 w-4 mr-1" />
                            Döndür
                          </button>
                        )}
                        
                        <button
                          onClick={() => handleDeleteEvaluation(evaluation._id)}
                          className="btn btn-error btn-sm"
                        >
                          <TrashIcon className="h-4 w-4 mr-1" />
                          Sil
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="text-center py-12">
                <ClipboardDocumentCheckIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Değerlendirme bulunamadı</h3>
                <p className="text-gray-500">Henüz hiç değerlendirmeniz yok.</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center">
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="btn btn-outline btn-sm disabled:opacity-50"
                >
                  Önceki
                </button>
                
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`btn btn-sm ${
                      currentPage === i + 1 ? 'btn-primary' : 'btn-outline'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="btn btn-outline btn-sm disabled:opacity-50"
                >
                  Sonraki
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Evaluate Modal */}
        {showEvaluateModal && selectedEvaluation && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowEvaluateModal(false)} />
              
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
                <form onSubmit={handleEvaluate}>
                  <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      {selectedEvaluation.assignment.title} - {selectedEvaluation.student.firstName} {selectedEvaluation.student.lastName}
                    </h3>
                    
                    <div className="space-y-6">
                      {/* Grade */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Not (0-100)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          required
                          value={evaluationData.grade}
                          onChange={(e) => setEvaluationData({ ...evaluationData, grade: parseInt(e.target.value) })}
                          className="input w-full"
                        />
                      </div>

                      {/* Criteria */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Değerlendirme Kriterleri
                        </label>
                        <div className="space-y-3">
                          {evaluationData.criteria.map((criterion, index) => (
                            <div key={index} className="flex gap-4 items-center">
                              <div className="flex-1">
                                <input
                                  type="text"
                                  value={criterion.name}
                                  onChange={(e) => {
                                    const newCriteria = [...evaluationData.criteria];
                                    newCriteria[index].name = e.target.value;
                                    setEvaluationData({ ...evaluationData, criteria: newCriteria });
                                  }}
                                  className="input w-full"
                                  placeholder="Kriter adı"
                                />
                              </div>
                              <div className="w-24">
                                <input
                                  type="number"
                                  min="0"
                                  max={criterion.maxPoints}
                                  value={criterion.earnedPoints}
                                  onChange={(e) => {
                                    const newCriteria = [...evaluationData.criteria];
                                    newCriteria[index].earnedPoints = parseInt(e.target.value);
                                    setEvaluationData({ ...evaluationData, criteria: newCriteria });
                                  }}
                                  className="input w-full"
                                  placeholder="Puan"
                                />
                              </div>
                              <div className="w-24">
                                <input
                                  type="number"
                                  min="0"
                                  value={criterion.maxPoints}
                                  onChange={(e) => {
                                    const newCriteria = [...evaluationData.criteria];
                                    newCriteria[index].maxPoints = parseInt(e.target.value);
                                    setEvaluationData({ ...evaluationData, criteria: newCriteria });
                                  }}
                                  className="input w-full"
                                  placeholder="Max"
                                />
                              </div>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => setEvaluationData({
                              ...evaluationData,
                              criteria: [...evaluationData.criteria, { name: '', maxPoints: 0, earnedPoints: 0, feedback: '' }]
                            })}
                            className="btn btn-outline btn-sm"
                          >
                            Kriter Ekle
                          </button>
                        </div>
                      </div>

                      {/* Feedback */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Genel Geri Bildirim
                        </label>
                        <textarea
                          value={evaluationData.feedback}
                          onChange={(e) => setEvaluationData({ ...evaluationData, feedback: e.target.value })}
                          rows={4}
                          className="input w-full"
                          placeholder="Öğrenciye geri bildirim verin..."
                        />
                      </div>

                      {/* Strengths */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Güçlü Yönler
                        </label>
                        <div className="space-y-2">
                          {evaluationData.strengths.map((strength, index) => (
                            <div key={index} className="flex gap-2">
                              <input
                                type="text"
                                value={strength}
                                onChange={(e) => {
                                  const newStrengths = [...evaluationData.strengths];
                                  newStrengths[index] = e.target.value;
                                  setEvaluationData({ ...evaluationData, strengths: newStrengths });
                                }}
                                className="input flex-1"
                                placeholder="Güçlü yön"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const newStrengths = evaluationData.strengths.filter((_, i) => i !== index);
                                  setEvaluationData({ ...evaluationData, strengths: newStrengths });
                                }}
                                className="btn btn-error btn-sm"
                              >
                                Sil
                              </button>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => setEvaluationData({
                              ...evaluationData,
                              strengths: [...evaluationData.strengths, '']
                            })}
                            className="btn btn-outline btn-sm"
                          >
                            Güçlü Yön Ekle
                          </button>
                        </div>
                      </div>

                      {/* Improvements */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Geliştirilmesi Gereken Alanlar
                        </label>
                        <div className="space-y-2">
                          {evaluationData.improvements.map((improvement, index) => (
                            <div key={index} className="flex gap-2">
                              <input
                                type="text"
                                value={improvement}
                                onChange={(e) => {
                                  const newImprovements = [...evaluationData.improvements];
                                  newImprovements[index] = e.target.value;
                                  setEvaluationData({ ...evaluationData, improvements: newImprovements });
                                }}
                                className="input flex-1"
                                placeholder="Geliştirilmesi gereken alan"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const newImprovements = evaluationData.improvements.filter((_, i) => i !== index);
                                  setEvaluationData({ ...evaluationData, improvements: newImprovements });
                                }}
                                className="btn btn-error btn-sm"
                              >
                                Sil
                              </button>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => setEvaluationData({
                              ...evaluationData,
                              improvements: [...evaluationData.improvements, '']
                            })}
                            className="btn btn-outline btn-sm"
                          >
                            Geliştirme Alanı Ekle
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                    <button
                      type="submit"
                      className="btn btn-primary w-full sm:w-auto sm:ml-3"
                    >
                      Değerlendir
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowEvaluateModal(false)}
                      className="btn btn-outline w-full sm:w-auto mt-3 sm:mt-0"
                    >
                      İptal
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </TeacherLayout>
    </>
  );
}

