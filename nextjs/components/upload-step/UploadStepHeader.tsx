'use client'
import { Upload } from 'lucide-react'
import React, {  useRef, useState } from 'react'
import { Button } from '../ui/button'

function UploadStepHeader() {
    const [browserFiles, setBrowserFiles] = useState<File[]>([])
    const [uploading, setUploading] = useState(false)
    const inputFileRef = useRef<HTMLInputElement | null>(null)

    const handleFileSelectClick = () => {
        if (inputFileRef.current) {
            inputFileRef.current.click();
        }
    }
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setBrowserFiles(Array.from(e.target.files)); 
            setUploading(true); 
        }      
    }
    const handleDrop = (event: React.DragEvent<HTMLInputElement>) => {
        setBrowserFiles(Array.from(event.dataTransfer.files));      
    };
  return (
    <div>
        <h2 className='text-xl md:text-2xl lg:text-2xl font-bold mb-8'>Step 1: Upload Media</h2>
        <div className='p-10 border-2 border-dashed border-main bg-white rounded-3xl text-center cursor-pointer mb-10'
        onDrop={handleDrop} onClick={handleFileSelectClick}
        onDragOver={e=>e.preventDefault}>
            {browserFiles.length === 0 ? (
                <div>
                    <Upload className='mx-auto h-8 w-8 sm:h-10 sm:w-10 text-main' />
                    <input type='file' 
                    accept='.mp4, .txt,.md,video/*,audio/*,text/plain,text/markdown'
                    multiple
                    ref={inputFileRef}
                    className='hidden' 
                    onChange={handleFileChange}
                    onDrag={e=>e.preventDefault()}
                    />
                    
                    <p className='text-main mt-2 sm:text-sm font-semibold'>Drag & Drop your files here, or click the select files</p>
                </div>
            ) :(
                <div>
                    <h3 className='font-bold mb-2'>Selected Files:</h3>
                    <ul className='text-sm'>{
                        browserFiles.map((files, index) => 
                        <li key={index}>{files.name}</li>
                        )}</ul>
                        <Button className='mt-4 bg-main text-white round-3xl text-sm'>
                            <Upload className='h-4 w-4 sm:h-5 sm:w-5 mr-1' />
                            {uploading ? 'Uploading...' : 'Upload Files'}
                        </Button>
                </div>
            )}
        </div>
    </div>
  )
}

export default UploadStepHeader