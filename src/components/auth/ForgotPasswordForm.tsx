/**
 * ForgotPasswordForm - Formularz przypomnienia hasła
 * 
 * Funkcjonalność:
 * - Wysyłanie instrukcji resetowania hasła na email
 * - Generyczny komunikat sukcesu (bez ujawniania czy email istnieje)
 * - Link do logowania
 * 
 * Backend (do implementacji później):
 * - Wywołanie supabase.auth.resetPasswordForEmail()
 * - Email z linkiem do resetowania hasła
 */
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { forgotPasswordSchema, type ForgotPasswordFormData } from '@/lib/validation/auth.schemas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';

export function ForgotPasswordForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>();

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsSubmitting(true);

    try {
      // TODO: Backend - wywołanie supabase.auth.resetPasswordForEmail()
      console.log('Password reset request for:', data.email);
      
      // Symulacja opóźnienia
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Zawsze pokazujemy sukces (ze względów bezpieczeństwa)
      setSuccess(true);
    } catch (err) {
      // Nawet w przypadku błędu pokazujemy generyczny komunikat
      setSuccess(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Sprawdź swoją skrzynkę
          </CardTitle>
          <CardDescription className="text-center">
            Jeśli konto istnieje, instrukcje zostały wysłane
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Alert className="border-green-200 bg-green-50 text-green-900">
            <p className="text-sm">
              Jeśli podany adres email jest zarejestrowany w naszym systemie,
              otrzymasz wiadomość z instrukcjami resetowania hasła.
            </p>
            <p className="text-sm mt-2">
              Sprawdź również folder spam, jeśli wiadomość nie pojawi się w skrzynce odbiorczej.
            </p>
          </Alert>
        </CardContent>

        <CardFooter>
          <Button asChild className="w-full" variant="outline">
            <a href="/login">Wróć do logowania</a>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">
          Zapomniałeś hasła?
        </CardTitle>
        <CardDescription className="text-center">
          Wprowadź swój email, a wyślemy instrukcje resetowania hasła
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="twoj@email.pl"
              {...register('email', {
                required: 'Email jest wymagany',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Nieprawidłowy format email',
                },
              })}
              aria-invalid={errors.email ? 'true' : 'false'}
              disabled={isSubmitting}
              autoFocus
            />
            {errors.email && (
              <p className="text-sm text-destructive" role="alert">
                {errors.email.message}
              </p>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4">
          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Wysyłanie...' : 'Wyślij instrukcje'}
          </Button>

          <p className="text-sm text-center text-muted-foreground">
            Pamiętasz hasło?{' '}
            <a href="/login" className="text-primary hover:underline font-medium">
              Zaloguj się
            </a>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}


