// /lib/validators/auth-schemas.ts
import { z } from 'zod';
/**
 * Schema for Step 1: Personal Information Verification
 * This validates the user's name and phone number.
 */
export const personalInfoStepSchema = z.object({
  firstName: z.string().min(2, { message: "First name must be at least 2 characters." }),
  lastName: z.string().min(2, { message: "Last name must be at least 2 characters." }),
  // Basic validation for a Nigerian phone number (starts with 0, followed by 10 digits)
  phoneNumber: z.string().regex(/^0[789][01]\d{8}$/, { message: "Please enter a valid Nigerian phone number." }),
});

/**
 * Schema for Step 2: Address Verification
 * This validates the user's full address details.
 */
export const addressStepSchema = z.object({
    street: z.string().min(5, { message: "Street address must be at least 5 characters." }),
    lga: z.string().min(3, { message: "LGA/City must be at least 3 characters." }),
    state: z.string().min(3, { message: "State must be at least 3 characters." }),
    country: z.string().min(2, { message: "Please enter a valid country." }),
});


/**
 * Schema for Step 3: Identity (NIN/BVN) Verification
 * This validates that EITHER a NIN or a BVN is provided.
 */
/**
 * Schema for Step 3: Identity (NIN/BVN) Verification
 * This validates that EITHER a NIN or a BVN is provided and is valid.
 */
export const identityStepSchema = z.object({
  nin: z.string().optional(),
  bvn: z.string().optional(),
})
.superRefine((data, ctx) => {
  const ninProvided = data.nin && data.nin.length > 0;
  const bvnProvided = data.bvn && data.bvn.length > 0;

  // 1. Check if at least one is provided
  if (!ninProvided && !bvnProvided) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "You must provide either a NIN or a BVN.",
      path: ["nin"], // Show error on the first field
    });
    return;
  }

  // 2. If NIN is provided, validate it
  if (ninProvided && !/^\d{11}$/.test(data.nin!)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "NIN must be exactly 11 digits.",
      path: ["nin"],
    });
  }

  // 3. If BVN is provided, validate it
  if (bvnProvided && !/^\d{11}$/.test(data.bvn!)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "BVN must be exactly 11 digits.",
      path: ["bvn"],
    });
  }
});

// Define a max file size (e.g., 5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024; 
// Define accepted image types
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

/**
 * Schema for Step 4: Document Upload Verification
 * This validates the document type and the uploaded file.
 */
export const documentStepSchema = z.object({
  documentType: z.enum(["VOTER_CARD", "DRIVER_LICENSE", "PASSPORT"]),
  documentImage: z
    .any() // Using `any` because file objects are complex
    .refine((file) => !!file, "Document image is required.") // Check if file exists
    .refine((file) => file?.size <= MAX_FILE_SIZE, `Max file size is 5MB.`)
    .refine(
      (file) => ACCEPTED_IMAGE_TYPES.includes(file?.type),
      ".jpg, .jpeg, .png and .webp files are accepted."
    ),
});

// Export types for type safety in your components
export type PersonalInfoStepData = z.infer<typeof personalInfoStepSchema>;
export type AddressStepData = z.infer<typeof addressStepSchema>;
export type IdentityStepData = z.infer<typeof identityStepSchema>;
export type DocumentStepData = z.infer<typeof documentStepSchema>;
