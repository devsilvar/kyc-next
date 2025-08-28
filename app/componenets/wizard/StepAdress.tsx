// /components/wizard/StepAddress.tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useWizardStore } from '@/app/store/wizad-store';
import {
  addressStepSchema,
  AddressStepData,
} from '@/app/lib/validators/auth-schema';
import toast from 'react-hot-toast';
import Loader from '../ui/Loader';

// --- Reusable UI Components (can be moved to a separate file) ---
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
    {isLoading ? 'Saving...' : children}
  </button>
);

const FormError = ({ message }: { message?: string }) => {
  if (!message) return null;
  return <p className='text-sm font-medium text-red-600 mt-1'>{message}</p>;
};

export function StepAddress() {
  const { data, setData, setStep } = useWizardStore();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<AddressStepData>({
    resolver: zodResolver(addressStepSchema),
    defaultValues: {
      street: (data as any).street || '',
      lga: (data as any).lga || '',
      state: (data as any).state || '',
      country: (data as any).country || 'Nigeria',
    },
  });

  async function onSubmit(values: AddressStepData) {
    setIsLoading(true);
    // No API call needed here, we're just saving to the state
    await new Promise((resolve) => setTimeout(resolve, 500));

    setData(values);
    toast.success('Address saved!');
    setStep(3); // Move to the next step
    setIsLoading(false);
  }

  return (
    <div className='w-full max-w-md mx-auto'>
      <div className='text-center mb-8'>
        <h2 className='text-3xl font-bold tracking-tight text-gray-900'>
          Your Address
        </h2>
        <p className='mt-2 text-sm text-gray-600'>Where can we find you?</p>
      </div>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
        <div>
          <FormLabel htmlFor='street'>Street Address</FormLabel>
          <FormInput
            id='street'
            type='text'
            placeholder='123 Main Street'
            {...form.register('street')}
          />
          <FormError message={form.formState.errors.street?.message} />
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div>
            <FormLabel htmlFor='lga'>LGA / City</FormLabel>
            <FormInput
              id='lga'
              type='text'
              placeholder='Ikeja'
              {...form.register('lga')}
            />
            <FormError message={form.formState.errors.lga?.message} />
          </div>
          <div>
            <FormLabel htmlFor='state'>State</FormLabel>
            <FormInput
              id='state'
              type='text'
              placeholder='Lagos'
              {...form.register('state')}
            />
            <FormError message={form.formState.errors.state?.message} />
          </div>
        </div>

        <div>
          <FormLabel htmlFor='country'>Country</FormLabel>
          <FormInput id='country' type='text' {...form.register('country')} />
          <FormError message={form.formState.errors.country?.message} />
        </div>

        <div className='flex items-center justify-between pt-2 space-x-4'>
          <button
            type='button'
            onClick={() => setStep(1)}
            className='text-sm font-medium text-gray-600 hover:text-blue-600'
          >
            &larr; Back
          </button>
          <FormButton type='submit' isLoading={isLoading}>
            Continue
          </FormButton>
        </div>
      </form>
    </div>
  );
}
