import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Upload,
    X,
    File,
    FileText,
    Image,
    FileVideo,
    FileAudio
} from 'lucide-react';

interface CompactFileUploadProps {
    label?: string;
    accept?: string;
    multiple?: boolean;
    maxFiles?: number;
    maxSize?: number; // in MB
    onChange?: (files: File[]) => void;
    className?: string;
}

export default function CompactFileUpload({
    label = "Upload Files",
    accept,
    multiple = false,
    maxFiles = 5,
    maxSize = 10,
    onChange,
    className = ""
}: CompactFileUploadProps) {
    const [files, setFiles] = useState<File[]>([]);
    const [dragOver, setDragOver] = useState(false);

    const getFileIcon = (file: File) => {
        const type = file.type;
        if (type.startsWith('image/')) return <Image className="h-3 w-3" />;
        if (type.startsWith('video/')) return <FileVideo className="h-3 w-3" />;
        if (type.startsWith('audio/')) return <FileAudio className="h-3 w-3" />;
        if (type === 'application/pdf' || type.includes('text')) return <FileText className="h-3 w-3" />;
        return <File className="h-3 w-3" />;
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    const handleFileSelect = (selectedFiles: FileList | null) => {
        if (!selectedFiles) return;

        const newFiles = Array.from(selectedFiles).filter(file => {
            // Check file size
            if (file.size > maxSize * 1024 * 1024) {
                alert(`File ${file.name} is too large. Maximum size is ${maxSize}MB.`);
                return false;
            }
            return true;
        });

        const updatedFiles = multiple ?
            [...files, ...newFiles].slice(0, maxFiles) :
            newFiles.slice(0, 1);

        setFiles(updatedFiles);
        onChange?.(updatedFiles);
    };

    const removeFile = (index: number) => {
        const updatedFiles = files.filter((_, i) => i !== index);
        setFiles(updatedFiles);
        onChange?.(updatedFiles);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        handleFileSelect(e.dataTransfer.files);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
    };

    return (
        <div className={`space-y-2 ${className}`}>
            {/* Compact Upload Area */}
            <div
                className={`border-2 border-dashed rounded-lg transition-colors ${dragOver
                        ? 'border-primary bg-primary/5'
                        : 'border-muted-foreground/25 hover:border-muted-foreground/50'
                    }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
            >
                <input
                    type="file"
                    accept={accept}
                    multiple={multiple}
                    onChange={(e) => handleFileSelect(e.target.files)}
                    className="hidden"
                    id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer block">
                    <div className="flex items-center gap-3 p-3">
                        <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                            <Upload className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground">{label}</p>
                            <p className="text-xs text-muted-foreground">
                                {accept ? `${accept} files` : 'Any file type'} • Max {maxSize}MB
                                {multiple && ` • Up to ${maxFiles} files`}
                            </p>
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-7 px-2 text-xs"
                        >
                            Browse
                        </Button>
                    </div>
                </label>
            </div>

            {/* Compact File List */}
            {files.length > 0 && (
                <div className="space-y-1">
                    {files.map((file, index) => (
                        <div
                            key={index}
                            className="flex items-center gap-2 p-2 bg-muted/50 rounded border"
                        >
                            <div className="text-muted-foreground flex-shrink-0">
                                {getFileIcon(file)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-foreground truncate">
                                    {file.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {formatFileSize(file.size)}
                                </p>
                            </div>
                            <Badge variant="secondary" className="text-xs py-0 h-4">
                                {file.type.split('/')[0]}
                            </Badge>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeFile(index)}
                                className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                            >
                                <X className="h-3 w-3" />
                            </Button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}