'use client'
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { FaCheckCircle } from "react-icons/fa";
import { FaCircleXmark } from "react-icons/fa6";
import axios from 'axios';

const EmailVerificationSuccess = () => {
  const router = useRouter();
  const [status, setStatus] = useState<string | null>(null);
  const params = useParams(); 
  const { verificationId } = params; 
  console.log(verificationId);
  const validateEmail=async()=>{
    try {
       await axios.get(`/email-email/${verificationId}/`)
       setStatus("success")
       setTimeout(() => {
                 router.push('/');
            }, 3000);
    } catch (error) {
        setStatus("error")
        console.log(error)
    }
  }
  useEffect(()=>{
    validateEmail()
  },[])
  return (
    <div className="flex items-start justify-center h-screen bg-gray-200 ">
      <div className="p-8 mt-20 rounded-lg shadow-lg text-center w-[50%] bg-white">
        {status === 'success' ? (
          <FaCheckCircle className="h-16 w-16 text-green-500 mx-auto" />
        ) : status === 'error' ? (
            <FaCircleXmark  className="h-16 w-16 text-red-500 mx-auto" />
        ) : null}

        <h1 className="text-2xl font-semibold mt-4">Email Verification</h1>
        <p className="text-gray-600 mt-2">
          {status === 'success'
            ? 'Your email was verified. Redirecting to the home page.'
            : status === 'error'
            ? 'Verification failed. Please try again.'
            : 'Verifying your email...'}
        </p>
      </div>
    </div>
  );
};

export default EmailVerificationSuccess;
