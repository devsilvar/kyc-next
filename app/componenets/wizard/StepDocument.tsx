// /components/wizard/StepDocument.tsx
'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { useWizardStore } from '@/app/store/wizad-store';
import {
  documentStepSchema,
  DocumentStepData,
} from '@/app/lib/validators/auth-schema';
import toast from 'react-hot-toast';

// --- Reusable UI Components ---
const FormLabel = ({
  children,
  htmlFor,
}: {
  children: React.ReactNode;
  htmlFor?: string;
}) => (
  <label
    htmlFor={htmlFor}
    className='block text-sm font-medium text-gray-700 mb-1'
  >
    {children}
  </label>
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

const documentTypes = [
  { id: 'DRIVER_LICENSE', label: "Driver's License" },
  { id: 'PASSPORT', label: 'International Passport' },
  { id: 'VOTER_CARD', label: "Voter's Card" },
];

export function StepDocument() {
  const { data, setData, setStep, setStepStatus } = useWizardStore();
  const [isLoading, setIsLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const form = useForm<DocumentStepData>({
    resolver: zodResolver(documentStepSchema),
    defaultValues: {
      documentType: undefined,
      documentImage: null,
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue('documentImage', file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  async function onSubmit(values: DocumentStepData) {
    setIsLoading(true);
    const loadingToast = toast.loading('Uploading and verifying document...');

    try {
      const formData = new FormData();
      formData.append('documentType', values.documentType);
      formData.append('documentImage', values.documentImage);
      // Append other user data if needed by the API
      formData.append('first_name', data.first_name || '');
      formData.append('last_name', data.last_name || '');

      const response = await axios.post('/api/verify-document', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data.success) {
        setData({ documentImage: values.documentImage });
        setStepStatus('isDocumentVerified', true);
        toast.success('Document verified successfully!', { id: loadingToast });
        setStep(5); // Move to the liveness check step
      } else {
        throw new Error(response.data.error || 'Document verification failed.');
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        'An unexpected error occurred.';
      toast.error(errorMessage, { id: loadingToast });
    } finally {
      setStep(5);
      setIsLoading(false);
    }
  }

  return (
    <div className='w-full max-w-md mx-auto'>
      <div className='text-center mb-6'>
        <h2 className='text-3xl font-bold tracking-tight text-gray-900'>
          Document Upload
        </h2>
        <p className='mt-2 text-sm text-gray-600'>
          Please upload a valid government-issued ID.
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
        <div>
          <FormLabel>Select Document Type</FormLabel>
          <div className='grid grid-cols-3 gap-2 rounded-lg bg-gray-100 p-1'>
            {documentTypes.map((doc) => (
              <Controller
                key={doc.id}
                name='documentType'
                control={form.control}
                render={({ field }) => (
                  <button
                    type='button'
                    onClick={() => field.onChange(doc.id)}
                    className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      field.value === doc.id
                        ? 'bg-white text-blue-600 shadow'
                        : 'text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {doc.label}
                  </button>
                )}
              />
            ))}
          </div>
          <FormError message={form.formState.errors.documentType?.message} />
        </div>

        <div>
          <FormLabel htmlFor='documentImage'>Upload Image</FormLabel>
          <div className='mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md'>
            <div className='space-y-1 text-center'>
              {preview ? (
                <img
                  src={preview}
                  alt='Document Preview'
                  className='mx-auto h-24 w-auto rounded-md'
                />
              ) : (
                <svg
                  className='mx-auto h-12 w-12 text-gray-400'
                  stroke='currentColor'
                  fill='none'
                  viewBox='0 0 48 48'
                  aria-hidden='true'
                >
                  <path
                    d='M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8'
                    strokeWidth='2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  />
                </svg>
              )}
              <div className='flex text-sm text-gray-600'>
                <label
                  htmlFor='documentImage'
                  className='relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500'
                >
                  <span>Upload a file</span>
                  <input
                    id='documentImage'
                    name='documentImage'
                    type='file'
                    className='sr-only'
                    accept='image/png, image/jpeg'
                    onChange={handleFileChange}
                  />
                </label>
                <p className='pl-1'>or drag and drop</p>
              </div>
              <p className='text-xs text-gray-500'>PNG, JPG up to 5MB</p>
            </div>
          </div>
          <FormError
            message={form.formState.errors.documentImage?.message as string}
          />
        </div>

        <div className='flex items-center justify-between pt-2 space-x-4'>
          <button
            type='button'
            onClick={() => setStep(3)}
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
