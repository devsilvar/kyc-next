// /store/wizard-store.ts
import { create } from 'zustand';

// This object holds the data collected from the user across all steps.
type VerificationData = {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  state?: string;
  lga?:string;
  street?:string;
  country?:string;
  nin?: string;
  bvn?: string;
  documentImage?: File;
  selfieImage?: Blob;
};



// This new object will track the completion status of each verification step.
type VerificationStatus = {
  isPhoneVerified: boolean;
  isAddressVerified:boolean;
  isIdentityVerified: boolean; // For NIN/BVN
  isDocumentVerified: boolean;
  isLivenessVerified: boolean;
};

// The main state for our wizard.
type WizardState = {
  currentStep: number;
  data: VerificationData;
  status: VerificationStatus; // <-- New status object
  setStep: (step: number) => void;
  setData: (data: Partial<VerificationData>) => void;
  // New action to update the status of a specific step.
  setStepStatus: (step: keyof VerificationStatus, isVerified: boolean) => void;
  reset: () => void;
};

const initialStatus: VerificationStatus = {
    isPhoneVerified: false,
    isAddressVerified:false,
    isIdentityVerified: false,
    isDocumentVerified: false,
    isLivenessVerified: false,
};

const initialData: VerificationData = {};

export const useWizardStore = create<WizardState>((set) => ({
  currentStep: 1,
  data: initialData,
  status: initialStatus,
  setStep: (step) => set({ currentStep: step }),
  setData: (newData) => set((state) => ({ data: { ...state.data, ...newData } })),
  
  /**
   * Updates the verification status for a given step.
   * @param step - The key of the step to update (e.g., 'isPhoneVerified').
   * @param isVerified - The new boolean status for that step.
   */
  setStepStatus: (step, isVerified) =>
    set((state) => ({
      status: {
        ...state.status,
        [step]: isVerified,
      },
    })),

  /**
   * Resets the entire wizard state to its initial values.
   */
  reset: () => set({ currentStep: 1, data: initialData, status: initialStatus }),
}));
