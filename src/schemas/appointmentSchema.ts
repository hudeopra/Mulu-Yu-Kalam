import { z } from "zod";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

export const tattooLocations = [
  "Arm",
  "Back",
  "Leg",
  "Chest",
  "Other",
] as const;
export type TattooLocation = (typeof tattooLocations)[number];

export const appointmentSchema = z.object({
  tattooLocation: z.enum(tattooLocations, {
    message: "Please select a tattoo placement area.",
  }),
  name: z
    .string()
    .min(1, "Name is required.")
    .min(2, "Name must be at least 2 characters."),
  email: z
    .string()
    .min(1, "Email address is required.")
    .email("Please enter a valid email address."),
  number: z
    .string()
    .min(1, "Phone number is required.")
    .regex(/^[\d\s+\-()]{7,20}$/, "Please enter a valid phone number."),
  appointmentTime: z.string().min(1, "Please select an appointment time."),
  appointmentDate: z.string().min(1, "Please select an appointment date."),
  referenceFile: z
    .custom<File | null>(
      (val) => val === null || val instanceof File,
      "Invalid file",
    )
    .optional()
    .refine(
      (file) => !file || file.size <= MAX_FILE_SIZE,
      "Max file size is 5MB.",
    )
    .refine(
      (file) => !file || ACCEPTED_IMAGE_TYPES.includes(file.type),
      "Only .jpg, .jpeg, .png, and .webp formats are supported.",
    ),
  notes: z.string().optional(),
});

export type AppointmentFormData = z.infer<typeof appointmentSchema>;
