'use client'
import { getAccessToken } from '@/app/[locale]/auth/Acces';
import { AxiosPrivate, invalidateAll } from '@/app/[locale]/auth/AxiosPrivate';
import { retrieveGymId } from '@/app/[locale]/auth/InfoCookies';
import { useState, DragEvent, ChangeEvent } from 'react';
import toast from 'react-hot-toast';
import { IoMdDownload } from 'react-icons/io';
import { Button, Text, Title } from 'rizzui';

export default function MemberImport() {
  const [file, setFile] = useState<File | null>(null);
  const [verified,setVerified]=useState(false)
  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (validateFile(droppedFile)) {
      setFile(droppedFile);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    if (validateFile(selectedFile)) {
      setFile(selectedFile);
    }
  };

  const validateFile = (file: File | null) => {
    if (!file) return false;
    const allowedExtensions = ['csv', 'xlsx', 'xls'];
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    return allowedExtensions.includes(fileExtension || '');
  };

  const handleVerify = async () => {
    if (file) {
    
      try {
        const token = await getAccessToken(); 
        const gym_id = await retrieveGymId();  
    
    
  
        const response = await AxiosPrivate.post(
          `/api/data_import/memberdata/?gym_id=${gym_id}`,
          {
            file:file,
            gym_id: parseInt(gym_id as string)
          },
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              Authorization: `Bearer ${token}`,
            },
          }
        );
  
        if (response.status === 200 || response.status === 201) {
            toast.success('file verified successfully procced to upload');
            setVerified(true)
        } else {
            toast.error('Failed to upload file.');
        }
      } catch (error) {
        console.error('Error uploading file:', error);
        toast.error('file not valid please upload valid file');
      }
    } else {
      toast.error('No file selected.');
    }
  };
  const handleUpload = async () => {
    if (file) {
    
      try {
        const token = await getAccessToken(); 
        const gym_id = await retrieveGymId();  
    
    
  
        const response = await AxiosPrivate.put(
          '/api/data_import/memberdata/',
          {
            file:file,
            gym_id:gym_id
          },
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              Authorization: `Bearer ${token}`,
            },
          }
        ).then(()=>invalidateAll());
  
  
       
        toast.success('File uploaded successfully!');
        handleCancel()
        setVerified(false)
      } catch (error) {
        console.error('Error uploading file:', error);
        toast.error('failed to upload file');
      }
    } else {
      toast.error('No file selected.');
    }
  };

  const handleCancel = () => {
    setFile(null);
    setVerified(false)
  };

  const handleTemplateDownload = () => {
    const link = document.createElement('a');
    link.href = 'https://docs.google.com/spreadsheets/d/1-FGAWDefDy0grlCPhnUqV8IufqHwGWOZ/export?format=xlsx';
    link.download = 'template-member.xlsx';
    link.click();
  };

  return (
    <div className="mt-3">
     <div className='flex flex-col items-center gap-3'>
      <Title as='h3'>Member Import</Title>
      <p className="mb-8">Easily migrate your existing member data into our platform.</p>
      </div>
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">Instructions</h3>
        <ol className="text-left inline-block text-sm list-decimal list-inside mb-4">
          <li>Download the sample template file.</li>
          <li>Prepare your member data in the template format.</li>
          <li>Upload the file to begin the import process.</li>
          <li>Review the preview and confirm the import.</li>
        </ol>
        <div className='flex justify-center'>
        <Button 
          onClick={handleTemplateDownload} 
          className=" text-black px-4 py-2 rounded-md border bg-gray-100 hover:bg-gray-200 flex gap-2 items-center"
        >
         <IoMdDownload /> <p>Download Template</p>
        </Button>
        </div>
      </div>

      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="border-2 border-dashed border-gray-300 p-10 mt-4 rounded-lg"
      >
        {file ? (
          <div>
            <p className="mb-4">{file.name}</p>
            <Button 
              onClick={handleVerify} 
              className="bg-green-500 text-white px-4 py-2 mr-2 rounded-md hover:bg-green-600"
            >
              verify File
            </Button>
            <Button 
              onClick={handleUpload} 
              className={`${verified?"bg-green-500 hover:bg-green-600":"bg-gray-400"} text-white px-4 py-2 mr-2 rounded-md `}
              disabled={!verified}
            >
              Upload File
            </Button>
            <Button 
              onClick={handleCancel} 
              className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
            >
              Cancel
            </Button>
          </div>
        ) : (
          <div>
            <p className="mb-4">Drop files here or click to upload</p>
            <input 
              type="file" 
              onChange={handleFileChange} 
              accept=".csv,.xlsx,.xls" 
              className="mb-4 block mx-auto" 
            />
            <p className="text-sm text-gray-500">Accepted formats: CSV, Excel</p>
          </div>
        )}
      </div>
    </div>
  );
}
