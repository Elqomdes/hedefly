import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import {
  CloudArrowUpIcon,
  DocumentIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { uploadAPI } from '../../lib/api';
import toast from 'react-hot-toast';

const FileUpload = ({
  onUpload,
  onRemove,
  multiple = false,
  maxFiles = 10,
  maxSize = 50 * 1024 * 1024, // 50MB
  acceptedTypes = {
    'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
    'video/*': ['.mp4', '.avi', '.mov', '.wmv', '.webm'],
    'application/pdf': ['.pdf'],
    'application/msword': ['.doc'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    'application/vnd.ms-excel': ['.xls'],
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    'text/plain': ['.txt'],
    'audio/*': ['.mp3', '.wav', '.ogg']
  },
  purpose = 'general',
  className = ''
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const onDrop = useCallback(async (acceptedFiles, rejectedFiles) => {
    if (rejectedFiles.length > 0) {
      rejectedFiles.forEach(file => {
        const error = file.errors[0];
        if (error.code === 'file-too-large') {
          toast.error(`${file.file.name} dosyası çok büyük. Maksimum ${Math.round(maxSize / 1024 / 1024)}MB olabilir.`);
        } else if (error.code === 'file-invalid-type') {
          toast.error(`${file.file.name} desteklenmeyen dosya türü.`);
        } else {
          toast.error(`${file.file.name} yüklenemedi: ${error.message}`);
        }
      });
      return;
    }

    if (acceptedFiles.length === 0) return;

    setUploading(true);

    try {
      const formData = new FormData();
      
      if (multiple) {
        acceptedFiles.forEach(file => {
          formData.append('files', file);
        });
      } else {
        formData.append('file', acceptedFiles[0]);
      }

      let response;
      switch (purpose) {
        case 'assignment':
          response = await uploadAPI.uploadAssignment(formData);
          break;
        case 'profile-picture':
          response = await uploadAPI.uploadProfilePicture(formData);
          break;
        case 'exam':
          response = await uploadAPI.uploadExam(formData);
          break;
        default:
          response = multiple 
            ? await uploadAPI.uploadMultiple(formData)
            : await uploadAPI.uploadSingle(formData);
      }

      if (response.data.success) {
        const files = Array.isArray(response.data.data) ? response.data.data : [response.data.data];
        setUploadedFiles(prev => [...prev, ...files]);
        onUpload && onUpload(files);
        toast.success(response.data.message);
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.message || 'Dosya yüklenirken bir hata oluştu');
    } finally {
      setUploading(false);
    }
  }, [multiple, maxSize, purpose, onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple,
    maxFiles,
    maxSize,
    accept: acceptedTypes
  });

  const handleRemoveFile = async (file) => {
    try {
      await uploadAPI.deleteFile(file.filename, file.subdir);
      setUploadedFiles(prev => prev.filter(f => f.filename !== file.filename));
      onRemove && onRemove(file);
      toast.success('Dosya silindi');
    } catch (error) {
      console.error('Delete file error:', error);
      toast.error('Dosya silinirken bir hata oluştu');
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (mimeType) => {
    if (mimeType.startsWith('image/')) {
      return '🖼️';
    } else if (mimeType.startsWith('video/')) {
      return '🎥';
    } else if (mimeType === 'application/pdf') {
      return '📄';
    } else if (mimeType.includes('document')) {
      return '📝';
    } else if (mimeType.includes('audio/')) {
      return '🎵';
    } else {
      return '📎';
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${isDragActive 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
          }
          ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} disabled={uploading} />
        
        <div className="flex flex-col items-center">
          <CloudArrowUpIcon className="h-12 w-12 text-gray-400 mb-4" />
          
          {uploading ? (
            <div className="space-y-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-sm text-gray-600">Dosya yükleniyor...</p>
            </div>
          ) : isDragActive ? (
            <div className="space-y-2">
              <p className="text-lg font-medium text-blue-600">Dosyaları buraya bırakın</p>
              <p className="text-sm text-gray-500">
                {multiple ? 'Birden fazla dosya yükleyebilirsiniz' : 'Tek dosya yükleyebilirsiniz'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-lg font-medium text-gray-900">
                {multiple ? 'Dosyaları yüklemek için tıklayın veya sürükleyin' : 'Dosya yüklemek için tıklayın veya sürükleyin'}
              </p>
              <p className="text-sm text-gray-500">
                Maksimum {Math.round(maxSize / 1024 / 1024)}MB, {multiple ? `en fazla ${maxFiles} dosya` : 'tek dosya'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-900">Yüklenen Dosyalar</h4>
          <div className="space-y-2">
            {uploadedFiles.map((file, index) => (
              <motion.div
                key={file.filename}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getFileIcon(file.mimeType)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {file.originalName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <CheckCircleIcon className="h-5 w-5 text-green-500" />
                  <button
                    onClick={() => handleRemoveFile(file)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* File Type Info */}
      <div className="text-xs text-gray-500">
        <p>Desteklenen dosya türleri:</p>
        <div className="flex flex-wrap gap-2 mt-1">
          {Object.entries(acceptedTypes).map(([type, extensions]) => (
            <span key={type} className="px-2 py-1 bg-gray-100 rounded text-xs">
              {extensions.join(', ')}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FileUpload;

