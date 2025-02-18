'use client'
import React from 'react'
import { Upload, XCircle } from 'lucide-react'
import { Button } from '../ui/button'

interface UploadStepHeaderProps {
    browserFiles: File[]
    uploading: boolean
    setBrowserFiles: React.Dispatch<React.SetStateAction<File[]>>
    inputFileRef: React.RefObject<HTMLInputElement | null>
    handleUpload: () => void
    accept: string
    handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void
}

function UploadStepHeader({ browserFiles, uploading, setBrowserFiles, inputFileRef, handleUpload, accept, handleFileChange }: UploadStepHeaderProps) {


    const handleFileSelectClick = () => {
        if (inputFileRef.current) {
            inputFileRef.current.value = ""; // ✅ Clear file input value before opening
            inputFileRef.current.click();
        }
    };
      
    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault(); // Prevent default browser behavior
        setBrowserFiles(Array.from(event.dataTransfer.files));
    };


    return (
        <div>
            <h2 className='text-xl md:text-2xl lg:text-2xl font-bold mb-8'>Step 1: Upload Media</h2>
            <div className='p-10 border-2 border-dashed border-main bg-white rounded-3xl text-center cursor-pointer mb-10'
                onDrop={handleDrop}
                onClick={handleFileSelectClick}
                onDragOver={e => e.preventDefault()}>
                {browserFiles.length === 0 ? (
                    <div className=''>
                        <Upload className='mx-auto h-8 w-8 sm:h-10 sm:w-10 text-main' />
                        <input type='file'
                            accept={accept}
                            multiple
                            ref={inputFileRef}
                            className='hidden'
                            onChange={handleFileChange}
                        />
                        <p className='text-main mt-2 sm:text-sm font-semibold'>Drag & Drop your files here, or click to select files</p>
                    </div>
                ) : (
                    <div>
                        <h3 className='font-bold mb-2'>Selected Files:</h3>
                        <ul className='text-sm'>
                            {browserFiles.map((file, index) => (
                                <li key={index}>{file.name}</li>
                            ))}
                        </ul>
                        <Button
                            onClick={handleUpload}
                            disabled={uploading}
                            className='mt-4 bg-main text-white rounded-3xl text-sm'>
                            <Upload className='h-4 w-4 sm:h-5 sm:w-5 mr-1' />
                            {uploading ? 'Uploading...' : 'Upload Files'}
                        </Button>
                        <Button
                                onClick={(() => setBrowserFiles([]))}
                                variant="outline"
                                className="border border-gray-400 text-gray-700 rounded-3xl text-sm ml-2"
                            >
                                <XCircle className="h-4 w-4 sm:h-5 sm:w-5 mr-1" />
                                Clear Files
                            </Button>
                    </div>
                )}
            </div>
        </div>
    )
}

export default UploadStepHeader