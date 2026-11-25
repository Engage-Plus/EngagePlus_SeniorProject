// Enums shared by web and api. Must match prisma/schema.prisma
// (checked by the api test "TC-52 shared enums match the Prisma schema").
import { z } from "zod";

export const CategorySchema = z.enum(["ACADEMIC", "CULTURAL", "PROFESSIONAL", "SOCIAL", "OTHER"]);
export type Category = z.infer<typeof CategorySchema>;

export const RoleSchema = z.enum(["STUDENT", "ADMIN"]);
export type Role = z.infer<typeof RoleSchema>;

/** RIGHT = RSVP (event) or follow (org); LEFT = pass / skip. */
export const SwipeActionSchema = z.enum(["RIGHT", "LEFT"]);
export type SwipeAction = z.infer<typeof SwipeActionSchema>;
