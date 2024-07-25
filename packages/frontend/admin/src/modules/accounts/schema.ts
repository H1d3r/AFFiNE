import { z } from 'zod';

export const userSchema = z.object({
  __typename: z.literal('UserType').optional(),
  id: z.string(),
  name: z.string(),
  email: z.string(),
  features: z.array(z.string()),
  hasPassword: z.boolean().nullable(),
  emailVerified: z.boolean(),
  avatarUrl: z.string().nullable(),
  quota: z
    .object({
      __typename: z.literal('UserQuota').optional(),
      humanReadable: z.object({
        __typename: z.literal('UserQuotaHumanReadable').optional(),
        blobLimit: z.string(),
        historyPeriod: z.string(),
        memberLimit: z.string(),
        name: z.string(),
        storageQuota: z.string(),
      }),
    })
    .nullable(),
});

export type User = z.infer<typeof userSchema>;
