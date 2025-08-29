// /components/wizard/StepPhone.tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { useWizardStore } from '@/app/store/wizad-store';
import {
  personalInfoStepSchema,
  PersonalInfoStepData,
} from '@/app/lib/validators/auth-schema';
import toast from 'react-hot-toast'; // Assuming you have a toast component
import Loader from '../ui/Loader';

// --- UI Component Imports ---
// Since we are not using a UI library, let's define some simple, reusable
// styled components right here or in a separate file.

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
    {isLoading ? <Loader /> : null}
    {isLoading ? 'Verifying...' : children}
  </button>
);

const FormError = ({ message }: { message?: string }) => {
  if (!message) return null;
  return <p className='text-sm font-medium text-red-600 mt-1'>{message}</p>;
};

export function StepPhone() {
  const { data, setData, setStep, setStepStatus } = useWizardStore(); // You'll need to create a simple toast component
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<PersonalInfoStepData>({
    resolver: zodResolver(personalInfoStepSchema),
    defaultValues: {
      firstName: data.firstName || '',
      lastName: data.lastName || '',
      phoneNumber: data.phoneNumber || '',
    },
  });

  async function onSubmit(values: PersonalInfoStepData) {
    setIsLoading(true);
    try {
      // In a real app, this API call would trigger an OTP to be sent.
      // For now, we'll simulate a successful verification.
      const response = await axios.post(
        'https://kyc-next.vercel.app/api/verify-phone',
        values
      );

      console.log(response.data);
      // MOCK API CALL
      // await new Promise((resolve) => setTimeout(resolve, 1500));
      // Update our global state
      console.log(values);
      setData(values);
      setStepStatus('isPhoneVerified', true);
      toast.success('Personal details saved');
      // Move to the next step
      setStep(2);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className='w-full max-w-md mx-auto'>
      <div className='text-center mb-8'>
        <h2 className='text-3xl font-bold tracking-tight text-gray-900'>
          Let`&apos;s Get Started
        </h2>
        <p className='mt-2 text-sm text-gray-600'>
          First, we need some basic information to identify you.
        </p>
      </div>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
        <div>
          <FormLabel htmlFor='firstName'>First Name</FormLabel>
          <FormInput
            id='firstName'
            type='text'
            placeholder='John'
            {...form.register('firstName')}
          />
          <FormError message={form.formState.errors.firstName?.message} />
        </div>

        <div>
          <FormLabel htmlFor='lastName'>Last Name</FormLabel>
          <FormInput
            id='lastName'
            type='text'
            placeholder='Doe'
            {...form.register('lastName')}
          />
          <FormError message={form.formState.errors.lastName?.message} />
        </div>

        <div>
          <FormLabel htmlFor='phoneNumber'>Phone Number</FormLabel>
          <FormInput
            id='phoneNumber'
            type='tel'
            placeholder='08012345678'
            {...form.register('phoneNumber')}
          />
          <FormError message={form.formState.errors.phoneNumber?.message} />
        </div>

        <div className='pt-2'>
          <FormButton type='submit' isLoading={isLoading}>
            Continue
          </FormButton>
        </div>
      </form>
    </div>
  );
}
