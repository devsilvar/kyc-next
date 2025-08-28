// /components/wizard/StepLiveness.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWizardStore } from '@/app/store/wizad-store';
import toast from 'react-hot-toast';
import axios from 'axios';

// --- Reusable UI Components ---
const FormButton = ({
  children,
  isLoading,
  ...props
}: {
  children: React.ReactNode;
  isLoading?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    {...props}
    disabled={isLoading}
    className='w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 disabled:cursor-not-allowed transition-all duration-200'
  >
    {isLoading ? (
      <svg
        className='animate-spin -ml-1 mr-3 h-5 w-5 text-white'
        xmlns='http://www.w3.org/2000/svg'
        fill='none'
        viewBox='0 0 24 24'
      >
        <circle
          className='opacity-25'
          cx='12'
          cy='12'
          r='10'
          stroke='currentColor'
          strokeWidth='4'
        ></circle>
        <path
          className='opacity-75'
          fill='currentColor'
          d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
        ></path>
      </svg>
    ) : null}
    {isLoading ? 'Processing...' : children}
  </button>
);

export function StepLiveness() {
  const { data, setStep, setStepStatus, reset } = useWizardStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckStarted, setIsCheckStarted] = useState(false);
  const router = useRouter();

  // In a real application, this function would initialize the Smile ID SDK.
  // The SDK would then provide a callback with the liveness data.
  const handleStartLivenessCheck = async () => {
    setIsCheckStarted(true);
    setIsLoading(true);
    const loadingToast = toast.loading(
      'Please follow the on-screen instructions...'
    );

    try {
      // --- MOCK SMILE ID PROCESS ---
      // This simulates the user completing the liveness check.
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // This simulates the data you would get back from the SDK.
      const mockLivenessData = {
        selfie: 'base64_encoded_image_string',
        livenessPassed: true,
      };
      // --- END MOCK ---

      // Now, send this data to your backend for final verification.
      const response = await axios.post('/api/verify-liveness', {
        livenessData: mockLivenessData,
        userId: data.phoneNumber, // Example of sending a user identifier
      });

      if (response.data.success) {
        setStepStatus('isLivenessVerified', true);
        toast.success('Verification complete! Thank you.', {
          id: loadingToast,
        });

        // Redirect to success page and reset the wizard state
        router.push('/success');
        reset();
      } else {
        throw new Error(response.data.error || 'Liveness check failed.');
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        'An unexpected error occurred.';
      toast.error(errorMessage, { id: loadingToast });
      setIsCheckStarted(false); // Allow user to retry
    } finally {
      router.push('/success');
      setIsLoading(false);
    }
  };

  return (
    <div className='w-full max-w-md mx-auto'>
      <div className='text-center mb-6'>
        <h2 className='text-3xl font-bold tracking-tight text-gray-900'>
          Liveness Check
        </h2>
        <p className='mt-2 text-sm text-gray-600'>
          We need to verify you're a real person. Please position your face in
          the frame.
        </p>
      </div>

      {/* This is the placeholder where the Smile ID camera UI would mount */}
      <div className='w-full aspect-square bg-gray-900 rounded-lg flex items-center justify-center text-white mb-6'>
        {isCheckStarted ? (
          <p>Smile ID SDK is active...</p>
        ) : (
          <p>Camera will appear here</p>
        )}
      </div>

      {!isCheckStarted && (
        <FormButton onClick={handleStartLivenessCheck} isLoading={isLoading}>
          Start Liveness Check
        </FormButton>
      )}

      <div className='text-center mt-4'>
        <button
          type='button'
          onClick={() => router.push('/success')}
          className='text-sm font-medium text-gray-600 hover:text-blue-600'
        >
          Submit
        </button>
      </div>
    </div>
  );
}
