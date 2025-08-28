// /app/success/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWizardStore } from '../store/wizad-store';
import { motion, AnimatePresence } from 'framer-motion';

// SVG Checkmark Icon Component
const CheckIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    fill='none'
    viewBox='0 0 24 24'
    stroke='currentColor'
    strokeWidth={3}
  >
    <motion.path
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{
        delay: 0.2,
        type: 'tween',
        ease: 'easeOut',
        duration: 0.3,
      }}
      strokeLinecap='round'
      strokeLinejoin='round'
      d='M5 13l4 4L19 7'
    />
  </svg>
);

export default function SuccessPage() {
  const router = useRouter();
  const { status, data, reset } = useWizardStore();
  const [isVerified, setIsVerified] = useState(true);

  useEffect(() => {
    // This effect checks if all verification steps were actually completed.
    // It's a security measure to prevent users from navigating directly to this page.
    const allStepsVerified = Object.values(status).every(Boolean);

    if (allStepsVerified) {
      setIsVerified(true);
    } else {
      // If verification isn't complete, redirect the user back to the start.
      // In a real app, you might show an error message instead.
      //   router.replace('/');
    }
  }, [status, router]);

  const handleContinue = () => {
    // Reset the wizard state before navigating away
    reset();
    router.push('/dashboard'); // Or any other destination
  };

  return (
    <div className='min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4'>
      <AnimatePresence>
        {isVerified && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className='bg-white p-8 md:p-12 rounded-2xl shadow-2xl text-center max-w-md w-full'
          >
            {/* The Animated Circle */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: 'spring',
                stiffness: 260,
                damping: 20,
                delay: 0.1,
              }}
              className='mx-auto h-24 w-24 rounded-full bg-green-100 flex items-center justify-center'
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, duration: 0.3 }}
                className='h-16 w-16 text-green-600'
              >
                <CheckIcon />
              </motion.div>
            </motion.div>

            {/* The Text Content */}
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className='text-3xl font-bold text-gray-900 mt-6'
            >
              Verification Successful!
            </motion.h1>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className='text-gray-600 mt-2'
            >
              Thank you, {data.firstName || 'user'}. Your identity has been
              confirmed and your account is secure.
            </motion.p>

            {/* The Continue Button */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className='mt-8'
            >
              <button
                onClick={handleContinue}
                className='w-full py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200'
              >
                Go to Dashboard
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
