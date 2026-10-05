import { z } from 'zod';

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB strict limit
const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
];

export const tattooLocations = [
  'Arm',
  'Back',
  'Leg',
  'Chest',
  'Other',
] as const;
export type TattooLocation = (typeof tattooLocations)[number];

export const appointmentSchema = z.object({
  tattooLocation: z.enum(tattooLocations, {
    message: 'Please select a tattoo placement area.',
  }),
  name: z
    .string()
    .min(1, 'Name is required.')
    .min(2, 'Name must be at least 2 characters.'),
  email: z
    .string()
    .min(1, 'Email address is required.')
    .email('Please enter a valid email address.'),
  number: z
    .string()
    .min(1, 'Phone number is required.')
    .regex(/^[\d\s+\-()]{7,20}$/, 'Please enter a valid phone number.'),
  appointmentTime: z.string().min(1, 'Please select an appointment time.'),
  appointmentDate: z.string().min(1, 'Please select an appointment date.'),
  referenceFiles: z
    .array(
      z
        .custom<File>(
          (val) =>
            (typeof File !== 'undefined' && val instanceof File) ||
            (typeof Blob !== 'undefined' && val instanceof Blob),
          'Invalid file',
        )
        .refine(
          (file) => file.size <= MAX_FILE_SIZE,
          'Each file must be 2MB or less.',
        )
        .refine(
          (file) =>
            ACCEPTED_IMAGE_TYPES.includes(file.type) ||
            /\.(webp|jpe?g|png)$/i.test(file.name),
          'Only .jpg, .jpeg, .png, and .webp formats are supported.',
        ),
    )
    .max(5, 'Maximum 5 reference images allowed.')
    .optional(),
  notes: z.string().optional(),
});

export type AppointmentFormData = z.infer<typeof appointmentSchema>;
