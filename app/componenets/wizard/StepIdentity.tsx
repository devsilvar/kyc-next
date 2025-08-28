// /components/wizard/StepIdentity.tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { useWizardStore } from '@/app/store/wizad-store';
import {
  identityStepSchema,
  IdentityStepData,
} from '@/app/lib/validators/auth-schema';
import toast from 'react-hot-toast';

// --- Reusable UI Components ---
const FormLabel = ({
  children,
  htmlFor,
}: {
  children: React.ReactNode;
  htmlFor: string;
}) => (
  <label
    htmlFor={htmlFor}
    className='block text-sm font-medium text-gray-700 mb-1'
  >
    {children}
  </label>
);

const FormInput = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    {...props}
    className='block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out'
  />
);

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
    {isLoading ? 'Verifying...' : children}
  </button>
);

const FormError = ({ message }: { message?: string }) => {
  if (!message) return null;
  return <p className='text-sm font-medium text-red-600 mt-1'>{message}</p>;
};

export function StepIdentity() {
  const { data, setData, setStep, setStepStatus } = useWizardStore();
  const [isLoading, setIsLoading] = useState(false);
  const [identityType, setIdentityType] = useState<'NIN' | 'BVN'>('NIN');

  const form = useForm<IdentityStepData>({
    resolver: zodResolver(identityStepSchema),
    defaultValues: {
      nin: data.nin || '',
      bvn: data.bvn || '',
    },
  });

  async function onSubmit(values: IdentityStepData) {
    setIsLoading(true);
    const loadingToast = toast.loading('Verifying your identity...');

    try {
      const payload = {
        firstName: data.firstName,
        lastName: data.lastName,
        nin: values.nin,
        bvn: values.bvn,
      };

      const response = await axios.post('/api/verify-nin-bvn', payload);

      if (response.data.success) {
        setData(values);
        setStepStatus('isIdentityVerified', true);
        toast.success('Identity verified successfully!', { id: loadingToast });
        setStep(4);
      } else {
        throw new Error(response.data.error || 'Verification failed.');
      } // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        'An unexpected error occurred.';
      toast.error(errorMessage, { id: loadingToast });
    } finally {
      setStep(4);
      setIsLoading(false);
    }
  }

  return (
    <div className='w-full max-w-md mx-auto'>
      <div className='text-center mb-6'>
        <h2 className='text-3xl font-bold tracking-tight text-gray-900'>
          Identity Verification
        </h2>
        <p className='mt-2 text-sm text-gray-600'>
          Please provide your NIN or BVN.
        </p>
      </div>

      {/* --- REDESIGNED SELECTOR --- */}
      <div className='grid grid-cols-2 gap-2 rounded-lg bg-gray-100 p-1 mb-6'>
        <button
          type='button'
          onClick={() => setIdentityType('NIN')}
          className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
            identityType === 'NIN'
              ? 'bg-white text-blue-600 shadow'
              : 'text-gray-600 hover:bg-gray-200'
          }`}
        >
          NIN
        </button>
        <button
          type='button'
          onClick={() => setIdentityType('BVN')}
          className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
            identityType === 'BVN'
              ? 'bg-white text-blue-600 shadow'
              : 'text-gray-600 hover:bg-gray-200'
          }`}
        >
          BVN
        </button>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
        {identityType === 'NIN' && (
          <div>
            <FormLabel htmlFor='nin'>
              National Identification Number (NIN)
            </FormLabel>
            <FormInput
              id='nin'
              type='text'
              placeholder='Enter your 11-digit NIN'
              {...form.register('nin')}
            />
            <FormError message={form.formState.errors.nin?.message} />
          </div>
        )}

        {identityType === 'BVN' && (
          <div>
            <FormLabel htmlFor='bvn'>Bank Verification Number (BVN)</FormLabel>
            <FormInput
              id='bvn'
              type='text'
              placeholder='Enter your 11-digit BVN'
              {...form.register('bvn')}
            />
            <FormError message={form.formState.errors.bvn?.message} />
          </div>
        )}

        <div className='flex items-center justify-between pt-2 space-x-4'>
          <button
            type='button'
            onClick={() => setStep(2)}
            className='text-sm font-medium text-gray-600 hover:text-blue-600'
          >
            &larr; Back
          </button>
          <FormButton type='submit' isLoading={isLoading}>
            Verify & Continue
          </FormButton>
        </div>
      </form>
    </div>
  );
}
