import React, { useState } from 'react';
import { Avatar } from 'rizzui';
// import { useController } from 'react-hook-form';

interface AvatarUploadProps {
  name: string;
  setValue: (name: string, value: any) => void;
  getValues: (name: string) => any;
  error: string | undefined;
}

const convertToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

const AvatarUpload: React.FC<AvatarUploadProps> = ({ name, setValue, getValues, error }) => {
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const base64String = await convertToBase64(file);
      setValue(name, base64String);
      setPreview(base64String);
    }
  };

  return (
    <div>
      {/* {preview && <img src={preview} alt="Avatar Preview" className='asp'/>} */}
      {preview && <Avatar src={preview} name='Preview' size='xl' />}
      <input type="file" accept="image/*" onChange={handleFileChange} />
      {error && <p className="error">{error}</p>}
    </div>
  );
};

export default AvatarUpload;
