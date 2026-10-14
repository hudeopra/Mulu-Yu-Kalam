import { z } from 'zod';

export const appointmentStatusValues = [
  'pending',
  'confirmed',
  'completed',
  'canceled',
] as const;

export const depositStatusValues = ['unpaid', 'partial', 'paid'] as const;

export const appointmentEditSchema = z
  .object({
    status: z.enum(appointmentStatusValues, {
      message: 'Please select a valid appointment status.',
    }),
    depositStatus: z.enum(depositStatusValues, {
      message: 'Please select a valid deposit status.',
    }),
    appointmentDate: z.string().min(1, 'Appointment date is required.'),
    appointmentTime: z.string().min(1, 'Appointment time is required.'),
    estimatedPrice: z
      .string()
      .optional()
      .refine(
        (val) => !val || (!isNaN(Number(val)) && Number(val) >= 0),
        'Estimated price must be a valid non-negative number.',
      ),
    partialPaymentAmount: z
      .string()
      .optional()
      .refine(
        (val) => !val || (!isNaN(Number(val)) && Number(val) >= 0),
        'Partial deposit must be a valid non-negative number.',
      ),
    internalNotes: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.depositStatus === 'partial') {
      const partial = Number(data.partialPaymentAmount);
      if (!data.partialPaymentAmount || isNaN(partial) || partial <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Please specify a partial deposit amount greater than 0.',
          path: ['partialPaymentAmount'],
        });
      } else if (data.estimatedPrice && !isNaN(Number(data.estimatedPrice))) {
        const estimated = Number(data.estimatedPrice);
        if (partial > estimated) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Partial deposit cannot exceed the estimated price.',
            path: ['partialPaymentAmount'],
          });
        }
      }
    }
  });

export type AppointmentEditFormData = z.infer<typeof appointmentEditSchema>;
