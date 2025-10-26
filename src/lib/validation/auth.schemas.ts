/**
 * Schematy walidacji dla formularzy autentykacji
 * Używane z react-hook-form do walidacji po stronie klienta
 */
import { z } from "zod";

/**
 * Schemat dla formularza logowania
 */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email jest wymagany")
    .email("Nieprawidłowy format email"),
  password: z
    .string()
    .min(1, "Hasło jest wymagane")
    .min(6, "Hasło musi mieć co najmniej 6 znaków"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

/**
 * Schemat dla formularza rejestracji
 */
export const registerSchema = z
  .object({
    email: z
      .string()
      .min(1, "Email jest wymagany")
      .email("Nieprawidłowy format email"),
    password: z
      .string()
      .min(1, "Hasło jest wymagane")
      .min(8, "Hasło musi mieć co najmniej 8 znaków")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Hasło musi zawierać małą literę, dużą literę i cyfrę",
      ),
    confirmPassword: z.string().min(1, "Potwierdzenie hasła jest wymagane"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Hasła muszą być identyczne",
    path: ["confirmPassword"],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;

/**
 * Schemat dla formularza przypomnienia hasła
 */
export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Email jest wymagany")
    .email("Nieprawidłowy format email"),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

/**
 * Schemat dla formularza resetowania hasła
 */
export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(1, "Hasło jest wymagane")
      .min(8, "Hasło musi mieć co najmniej 8 znaków")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Hasło musi zawierać małą literę, dużą literę i cyfrę",
      ),
    confirmPassword: z.string().min(1, "Potwierdzenie hasła jest wymagane"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Hasła muszą być identyczne",
    path: ["confirmPassword"],
  });

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;


