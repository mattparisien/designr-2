"use client"

import React, { createContext, useContext, useState, useCallback, useRef, PropsWithChildren } from 'react';

interface DropZoneContextValue {
    isDragging: boolean;
    dropZoneRef: React.RefObject<HTMLDivElement | null>;
    onDragEnter: (e: React.DragEvent) => void;
    onDragLeave: (e: React.DragEvent) => void;
    onDragOver: (e: React.DragEvent) => void;
    onDrop: (e: React.DragEvent, handler?: (files: FileList) => void) => void;
    processFiles: (files: FileList, acceptedTypes?: string[]) => File[];
    uploadFiles: (files: FileList | File[]) => Promise<void>;
    isUploading: boolean;
}

const DropZoneContext = createContext<DropZoneContextValue | undefined>(undefined);

export function DropZoneProvider({ children }: PropsWithChildren) {
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const dropZoneRef = useRef<HTMLDivElement>(null);
    const dragCounter = useRef(0);
    
    // Add window-level event listeners to catch files dragged from outside the browser
    React.useEffect(() => {
        const handleWindowDragEnter = (e: DragEvent) => {
            e.preventDefault();
            
            // Check if files are being dragged
            if (e.dataTransfer && Array.from(e.dataTransfer.types).includes('Files')) {
                dragCounter.current++;
                setIsDragging(true);
            }
        };
        
        const handleWindowDragOver = (e: DragEvent) => {
            e.preventDefault(); // Necessary to allow dropping
        };
        
        const handleWindowDrop = (e: DragEvent) => {
            e.preventDefault();
            dragCounter.current = 0;
            setIsDragging(false);
        };
        
        const handleWindowDragLeave = (e: DragEvent) => {
            e.preventDefault();
            
            // Only count drag leave if it's leaving to the window
            // e.clientX/Y of 0 or less, or greater than/equal to window width/height means it's leaving the window
            if (
                e.clientX <= 0 ||
                e.clientY <= 0 ||
                e.clientX >= window.innerWidth ||
                e.clientY >= window.innerHeight
            ) {
                dragCounter.current--;
                if (dragCounter.current <= 0) {
                    dragCounter.current = 0;
                    setIsDragging(false);
                }
            }
        };
        
        window.addEventListener('dragenter', handleWindowDragEnter);
        window.addEventListener('dragover', handleWindowDragOver);
        window.addEventListener('drop', handleWindowDrop);
        window.addEventListener('dragleave', handleWindowDragLeave);
        
        return () => {
            window.removeEventListener('dragenter', handleWindowDragEnter);
            window.removeEventListener('dragover', handleWindowDragOver);
            window.removeEventListener('drop', handleWindowDrop);
            window.removeEventListener('dragleave', handleWindowDragLeave);
        };
    }, []);

    const onDragEnter = useCallback((e: React.DragEvent) => {
        console.log('Drag entered', e.dataTransfer.types);
        e.preventDefault();
        e.stopPropagation();
        dragCounter.current++;

        // Check for files in the dataTransfer
        // This will detect files from Finder/Explorer being dragged in
        const hasFiles = Array.from(e.dataTransfer.types).includes('Files');
        if (hasFiles) {
            setIsDragging(true);
        }
    }, []);

    const onDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        dragCounter.current--;

        if (dragCounter.current === 0) {
            setIsDragging(false);
        }
    }, []);

    const onDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    // Function to upload files using the assets API
    const uploadFiles = useCallback(async (files: FileList | File[]) => {
        setIsUploading(true);
        
        try {
            const fileArray = Array.from(files);
            
            // Upload each file
            for (const file of fileArray) {
                const formData = new FormData();
                formData.append('asset', file);
                formData.append('name', file.name);
                
                // Use the assets API upload endpoint
                const response = await fetch('/api/assets/upload', {
                    method: 'POST',
                    body: formData,
                    headers: {
                        // Note: Don't set Content-Type when using FormData
                        // The browser will set it automatically with the boundary
                        'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
                    }
                });
                
                if (!response.ok) {
                    throw new Error(`Failed to upload ${file.name}`);
                }
                
                const result = await response.json();
                console.log('Asset uploaded successfully:', result);
            }
        } catch (error) {
            console.error('Error uploading files:', error);
            // You might want to add toast notifications here
        } finally {
            setIsUploading(false);
        }
    }, []);

    const onDrop = useCallback((e: React.DragEvent, handler?: (files: FileList) => void) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        dragCounter.current = 0;

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            console.log('Files dropped:', e.dataTransfer.files);
            
            // If a custom handler is provided, use it
            if (handler) {
                handler(e.dataTransfer.files);
            } else {
                // Default behavior: automatically upload files
                uploadFiles(e.dataTransfer.files);
            }
            
            e.dataTransfer.clearData();
        }
    }, [uploadFiles]);
    
    // Utility function to filter and process dropped files
    const processFiles = useCallback((files: FileList, acceptedTypes?: string[]) => {
        const processedFiles: File[] = [];
        
        Array.from(files).forEach(file => {
            // If no acceptedTypes are provided, or file type is accepted
            if (!acceptedTypes || acceptedTypes.some(type => {
                // Handle wildcards like 'image/*'
                if (type.endsWith('/*')) {
                    const category = type.split('/')[0];
                    return file.type.startsWith(`${category}/`);
                }
                return file.type === type;
            })) {
                processedFiles.push(file);
            }
        });
        
        return processedFiles;
    }, []);

    return (
        <DropZoneContext.Provider value={{ isDragging, dropZoneRef, onDragEnter, onDragLeave, onDragOver, onDrop, processFiles, uploadFiles, isUploading }}>
            {children}
            {isDragging && (
                <div 
                    ref={dropZoneRef} 
                    className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center pointer-events-auto"
                    onDragEnter={onDragEnter}
                    onDragLeave={onDragLeave}
                    onDragOver={onDragOver}
                    onDrop={onDrop}
                >
                    <div className="bg-white p-8 rounded-lg shadow-lg text-center">
                        <div className="text-4xl mb-4">📁</div>
                        <h3 className="text-2xl font-semibold mb-2">Drop files here</h3>
                        <p className="text-gray-500">Drop your files to upload them as assets</p>
                    </div>
                </div>
            )}
            {isUploading && (
                <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center pointer-events-none">
                    <div className="bg-white p-8 rounded-lg shadow-lg text-center">
                        <div className="text-4xl mb-4">⏳</div>
                        <h3 className="text-2xl font-semibold mb-2">Uploading...</h3>
                        <p className="text-gray-500">Please wait while your files are being uploaded</p>
                    </div>
                </div>
            )}
        </DropZoneContext.Provider>
    );
}

export function useDropZone() {
    const context = useContext(DropZoneContext);

    if (context === undefined) {
        throw new Error('useDropZone must be used within a DropZoneProvider');
    }

    return context;
}
