import { z } from "zod";
import {
  userNameSchema,
  emailSchema,
  passwordSchema,
  roleSchema,
} from "./CommonSchemas";

export const userSeedSchema = z.object({
  name: userNameSchema,
  email: emailSchema,
  password: passwordSchema,
  role: roleSchema,
});

export type UserSeed = z.infer<typeof userSeedSchema>;
