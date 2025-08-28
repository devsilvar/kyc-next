// /components/wizard/WizardController.tsx
'use client';

import { useWizardStore } from '@/app/store/wizad-store';
import { Toaster } from 'react-hot-toast';

// Import all your step components
import { StepPhone } from '@/app/componenets/wizard/StepPhone'; // You will create
import { StepAddress } from '@/app/componenets/wizard/StepAdress';
import { StepIdentity } from '@/app/componenets/wizard/StepIdentity';
import { StepDocument } from '@/app/componenets/wizard/StepDocument';
import { StepLiveness } from './StepLiveliness';
// import { StepIdentity } from './StepIdentity';
// import { StepDocument } from './StepDocument';
// import { StepLiveness } from './StepLiveness';

const steps = [
  { id: 1, name: 'Personal Info' },
  { id: 2, name: 'Address' },
  { id: 3, name: 'Identity' },
  { id: 4, name: 'Document' },
  { id: 5, name: 'Liveness Check' },
];

const ProgressBar = () => {
  const { currentStep } = useWizardStore();
  const progressPercentage = ((currentStep - 1) / (steps.length - 1)) * 100;

  return (
    <div className='w-full mb-8'>
      <div className='relative pt-1'>
        <div className='flex mb-2 items-center justify-between'>
          <div>
            <span className='text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200'>
              Step {currentStep} of {steps.length}
            </span>
          </div>
          <div className='text-right'>
            <span className='text-xs font-semibold inline-block text-blue-600'>
              {steps[currentStep - 1]?.name}
            </span>
          </div>
        </div>
        <div className='overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200'>
          <div
            style={{ width: `${progressPercentage}%` }}
            className='shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500 transition-all duration-500'
          ></div>
        </div>
      </div>
    </div>
  );
};

export function WizardController() {
  const { currentStep } = useWizardStore();

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return <StepPhone />;
      case 2:
        return <StepAddress />;
      case 3:
        return <StepIdentity />;
      case 4:
        return <StepDocument />;
      case 5:
        return <StepLiveness />;
      default:
        return '';
    }
  };

  return (
    <div className='min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8'>
      <Toaster position='top-center' reverseOrder={false} />
      <div className='mt-8 sm:mx-auto sm:w-full sm:max-w-xl'>
        <div className='bg-white py-8 px-4 shadow-xl sm:rounded-lg sm:px-10'>
          <ProgressBar />
          {renderCurrentStep()}
        </div>
      </div>
    </div>
  );
}
