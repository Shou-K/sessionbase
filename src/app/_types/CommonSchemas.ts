import { z } from "zod";
import { Role } from "./Role";

export const passwordSchema = z.string().min(5);
export const emailSchema = z.string().email();
export const userNameSchema = z.string().min(1);
export const roleSchema = z.nativeEnum(Role);

// prettier-ignore
export const isUUID = (value: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

export const uuidSchema = z.string().refine(isUUID, {
  message: "Invalid UUID format.",
});
