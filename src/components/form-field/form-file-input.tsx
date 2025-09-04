import { useState } from 'react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Upload,
    X,
    File,
    FileText,
    Image,
    FileVideo,
    FileAudio,
    FileIcon,
    Asterisk
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CompactFileUploadProps {
    label?: string;
    name: string;
    value?: string | string[];
    placeholder?: string;
    accept?: string;
    multiple?: boolean;
    maxFiles?: number;
    maxSize?: number; // in MB
    onChange?: (files: File[]) => void;
    disabled?: boolean;
    required?: boolean;
    className?: string;
}

export default function FormFileInput(props: CompactFileUploadProps) {
    if (
        props?.value &&
        props.value.length > 0 &&
        (typeof props.value === "string" || (Array.isArray(props.value) && typeof props.value[0] === "string"))
    ) return <FileRenderer files={props.value} />
    return <FileInput {...props} />
}

function FileInput({
    label = "Upload Files",
    name,
    placeholder,
    accept,
    multiple = false,
    maxFiles = 5,
    maxSize = 10,
    onChange,
    disabled,
    required,
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
        <div className={cn(`space-y-2`, className)}>
            {/* Compact Upload Area */}
            <div
                className={`group border-2 border-dashed rounded-lg transition-colors ${dragOver && !disabled
                    ? 'border-primary bg-primary/5'
                    : `border-muted-foreground/25 ${!disabled && 'hover:border-muted-foreground/50'}`
                    }`}
                onDrop={!disabled ? handleDrop : undefined}
                onDragOver={!disabled ? handleDragOver : undefined}
                onDragLeave={!disabled ? handleDragLeave : undefined}
            >
                <input
                    id={name}
                    name={name}
                    type="file"
                    // accept={accept}
                    className="sr-only"
                    disabled={disabled}
                    multiple={multiple}
                    required={required}
                    onChange={(e) => handleFileSelect(e.target.files)}
                />
                <label htmlFor={name} className={`${disabled ? 'cursor-not-allowed' : 'cursor-pointer'} block`}>
                    <div className="flex items-center gap-3 p-3">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 transition ${dragOver && !disabled ? 'bg-primary/10' : 'bg-muted dark:bg-input/60'}`}>
                            <Upload className={`h-5 w-5 transition ${dragOver && !disabled ? 'text-primary' : 'text-muted-foreground/80 dark:text-muted-foreground/40 group-hover:text-muted-foreground dark:group-hover:text-muted-foreground/80'}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2"><p className="text-sm font-medium text-foreground">{label}</p>{required ? <Asterisk className="text-destructive h-4 w-4" /> : null}</div>
                            <p className="text-[10px] 2xl:text-xs text-muted-foreground">{placeholder}</p>
                            <p className="text-[9px] text-muted-foreground">
                                ({accept ? `${accept} files` : 'Any file type'} • Max {maxSize}MB
                                {multiple && ` • Up to ${maxFiles} files`})
                            </p>
                        </div>
                        <div className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), "h-7 px-2 text-xs hover:bg-accent/60 group-hover:bg-accent/60 dark:hover:bg-accent/70 dark:group-hover:bg-accent/70")}>
                            Browse
                        </div>
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

const FileRenderer = ({ files }: { files: string | string[]; }) => {
    const fileList = Array.isArray(files) ? files : [files];

    const getFileType = (url: string) => {
        const ext = url.split(".").pop()?.toLowerCase();
        if (!ext) return "other";

        if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext)) return "image";
        if (["mp4", "webm", "ogg", "mov"].includes(ext)) return "video";
        if (["mp3", "wav", "ogg"].includes(ext)) return "audio";
        if (ext === "pdf") return "pdf";
        if (["doc", "docx"].includes(ext)) return "word";
        if (["xls", "xlsx"].includes(ext)) return "excel";
        return "other";
    };

    return (
        <div className="grid gap-4">
            {fileList.map((url, i) => {
                const type = getFileType(url);

                switch (type) {
                    case "image":
                        return (
                            <img
                                key={i}
                                src={url}
                                alt={`file-${i}`}
                                className="max-w-sm rounded shadow"
                            />
                        );

                    case "video":
                        return (
                            <video key={i} src={url} controls className="max-w-sm rounded shadow" />
                        );

                    case "audio":
                        return <audio key={i} src={url} controls className="w-full max-w-sm" />;

                    case "pdf":
                        return (
                            <embed
                                key={i}
                                src={url}
                                type="application/pdf"
                                className="w-full h-96 rounded shadow"
                            />
                        );

                    case "word":
                    case "excel":
                    case "other":
                    default:
                        return (
                            <a
                                key={i}
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center space-x-2 text-blue-600 underline"
                            >
                                <FileIcon className="h-5 w-5" />
                                <span>Download file</span>
                            </a>
                        );
                }
            })}
        </div>
    );
};
