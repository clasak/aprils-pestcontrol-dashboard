/**
 * File Upload Component
 * 
 * A reusable component for uploading files to Supabase Storage
 * with drag-and-drop support, progress indication, and validation.
 */

import React, { useState, useCallback, useRef } from 'react';
import {
  Box,
  Typography,
  Button,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Alert,
  Paper,
  Chip,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  InsertDriveFile as FileIcon,
  Image as ImageIcon,
  PictureAsPdf as PdfIcon,
  Description as DocIcon,
  Delete as DeleteIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import {
  uploadFile,
  STORAGE_BUCKETS,
  StorageBucket,
  EntityType,
  formatFileSize,
  isAllowedFileType,
  getAllowedTypes,
  getMaxFileSize,
} from '../../lib/storage';

interface FileUploadProps {
  bucket: StorageBucket;
  orgId: string;
  entityType?: EntityType;
  entityId?: string;
  multiple?: boolean;
  maxFiles?: number;
  onUploadComplete?: (paths: string[]) => void;
  onError?: (error: string) => void;
  compact?: boolean;
}

interface FileItem {
  file: File;
  id: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress: number;
  path?: string;
  error?: string;
}

const getFileIcon = (type: string) => {
  if (type.startsWith('image/')) return <ImageIcon color="primary" />;
  if (type === 'application/pdf') return <PdfIcon color="error" />;
  if (type.includes('document') || type.includes('msword')) return <DocIcon color="info" />;
  return <FileIcon color="action" />;
};

export const FileUpload: React.FC<FileUploadProps> = ({
  bucket,
  orgId,
  entityType,
  entityId,
  multiple = true,
  maxFiles = 10,
  onUploadComplete,
  onError,
  compact = false,
}) => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const allowedTypes = getAllowedTypes(bucket);
  const maxSize = getMaxFileSize(bucket);

  const validateFile = useCallback((file: File): string | null => {
    if (!isAllowedFileType(file, allowedTypes)) {
      return `File type ${file.type || 'unknown'} is not allowed`;
    }
    if (file.size > maxSize) {
      return `File size exceeds ${formatFileSize(maxSize)} limit`;
    }
    return null;
  }, [allowedTypes, maxSize]);

  const addFiles = useCallback((newFiles: FileList | File[]) => {
    const fileArray = Array.from(newFiles);
    
    // Check max files limit
    if (files.length + fileArray.length > maxFiles) {
      setError(`Maximum ${maxFiles} files allowed`);
      return;
    }

    const validFiles: FileItem[] = [];
    
    fileArray.forEach(file => {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
      } else {
        validFiles.push({
          file,
          id: `${file.name}-${Date.now()}-${Math.random()}`,
          status: 'pending',
          progress: 0,
        });
      }
    });

    if (validFiles.length > 0) {
      setFiles(prev => [...prev, ...validFiles]);
      setError(null);
    }
  }, [files.length, maxFiles, validateFile]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      addFiles(droppedFiles);
    }
  }, [addFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(e.target.files);
    }
    // Reset input
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  }, [addFiles]);

  const removeFile = useCallback((id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  }, []);

  const uploadFiles = useCallback(async () => {
    const pendingFiles = files.filter(f => f.status === 'pending');
    if (pendingFiles.length === 0) return;

    const uploadedPaths: string[] = [];

    for (const fileItem of pendingFiles) {
      // Update status to uploading
      setFiles(prev => 
        prev.map(f => 
          f.id === fileItem.id ? { ...f, status: 'uploading' as const } : f
        )
      );

      const result = await uploadFile(fileItem.file, {
        bucket,
        orgId,
        entityType,
        entityId,
      });

      if (result.success && result.path) {
        uploadedPaths.push(result.path);
        setFiles(prev => 
          prev.map(f => 
            f.id === fileItem.id 
              ? { ...f, status: 'success' as const, progress: 100, path: result.path } 
              : f
          )
        );
      } else {
        setFiles(prev => 
          prev.map(f => 
            f.id === fileItem.id 
              ? { ...f, status: 'error' as const, error: result.error } 
              : f
          )
        );
        onError?.(result.error || 'Upload failed');
      }
    }

    if (uploadedPaths.length > 0) {
      onUploadComplete?.(uploadedPaths);
    }
  }, [files, bucket, orgId, entityType, entityId, onUploadComplete, onError]);

  const hasPendingFiles = files.some(f => f.status === 'pending');
  const isUploading = files.some(f => f.status === 'uploading');

  if (compact) {
    return (
      <Box>
        <input
          ref={inputRef}
          type="file"
          multiple={multiple}
          accept={allowedTypes.join(',')}
          onChange={handleFileSelect}
          style={{ display: 'none' }}
          id="file-upload-input-compact"
        />
        <label htmlFor="file-upload-input-compact">
          <Button
            variant="outlined"
            component="span"
            startIcon={<UploadIcon />}
            size="small"
          >
            Upload File{multiple ? 's' : ''}
          </Button>
        </label>
        
        {files.length > 0 && (
          <Box sx={{ mt: 1 }}>
            {files.map(fileItem => (
              <Chip
                key={fileItem.id}
                label={fileItem.file.name}
                size="small"
                onDelete={() => removeFile(fileItem.id)}
                color={
                  fileItem.status === 'success' ? 'success' :
                  fileItem.status === 'error' ? 'error' : 'default'
                }
                sx={{ mr: 0.5, mb: 0.5 }}
              />
            ))}
          </Box>
        )}
        
        {hasPendingFiles && (
          <Button
            variant="contained"
            size="small"
            onClick={uploadFiles}
            disabled={isUploading}
            sx={{ mt: 1 }}
          >
            {isUploading ? 'Uploading...' : 'Upload'}
          </Button>
        )}
      </Box>
    );
  }

  return (
    <Paper sx={{ p: 2 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Drop Zone */}
      <Box
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        sx={{
          border: '2px dashed',
          borderColor: isDragging ? 'primary.main' : 'divider',
          borderRadius: 2,
          p: 4,
          textAlign: 'center',
          bgcolor: isDragging ? 'action.hover' : 'background.default',
          cursor: 'pointer',
          transition: 'all 0.2s',
          '&:hover': {
            borderColor: 'primary.light',
            bgcolor: 'action.hover',
          },
        }}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          multiple={multiple}
          accept={allowedTypes.join(',')}
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
        <UploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
        <Typography variant="body1" gutterBottom>
          Drag and drop files here
        </Typography>
        <Typography variant="body2" color="text.secondary">
          or click to browse
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
          Max {formatFileSize(maxSize)} per file
        </Typography>
      </Box>

      {/* File List */}
      {files.length > 0 && (
        <List sx={{ mt: 2 }}>
          {files.map(fileItem => (
            <ListItem
              key={fileItem.id}
              sx={{
                bgcolor: 'background.paper',
                borderRadius: 1,
                mb: 1,
                border: 1,
                borderColor: 'divider',
              }}
            >
              <ListItemIcon>
                {getFileIcon(fileItem.file.type)}
              </ListItemIcon>
              <ListItemText
                primary={fileItem.file.name}
                secondary={
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      {formatFileSize(fileItem.file.size)}
                    </Typography>
                    {fileItem.status === 'uploading' && (
                      <LinearProgress 
                        variant="indeterminate" 
                        sx={{ mt: 0.5 }} 
                      />
                    )}
                    {fileItem.status === 'error' && (
                      <Typography variant="caption" color="error" display="block">
                        {fileItem.error}
                      </Typography>
                    )}
                  </Box>
                }
              />
              <ListItemSecondaryAction>
                {fileItem.status === 'success' && (
                  <SuccessIcon color="success" />
                )}
                {fileItem.status === 'error' && (
                  <ErrorIcon color="error" />
                )}
                {(fileItem.status === 'pending' || fileItem.status === 'error') && (
                  <IconButton 
                    edge="end" 
                    onClick={() => removeFile(fileItem.id)}
                    size="small"
                  >
                    <DeleteIcon />
                  </IconButton>
                )}
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      )}

      {/* Upload Button */}
      {hasPendingFiles && (
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            onClick={uploadFiles}
            disabled={isUploading}
            startIcon={isUploading ? undefined : <UploadIcon />}
          >
            {isUploading ? 'Uploading...' : `Upload ${files.filter(f => f.status === 'pending').length} file(s)`}
          </Button>
        </Box>
      )}
    </Paper>
  );
};

export default FileUpload;

