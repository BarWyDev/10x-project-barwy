/**
 * ResetPasswordForm - Formularz resetowania hasła
 * 
 * Funkcjonalność:
 * - Ustawienie nowego hasła
 * - Walidacja siły hasła
 * - Potwierdzenie hasła
 * 
 * Backend (do implementacji później):
 * - Wywołanie supabase.auth.updateUser() z nowym hasłem
 * - Token resetowania z URL (Supabase)
 * - Przekierowanie do /login po sukcesie
 */
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { resetPasswordSchema, type ResetPasswordFormData } from '@/lib/validation/auth.schemas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';

export function ResetPasswordForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordFormData>();

  const password = watch('password');

  const onSubmit = async (data: ResetPasswordFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      // TODO: Backend - wywołanie supabase.auth.updateUser()
      console.log('Password reset attempt');
      
      // Symulacja opóźnienia
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // TODO: Po sukcesie - window.location.href = '/login' z komunikatem
      setSuccess(true);
    } catch (err) {
      setError('Wystąpił błąd podczas resetowania hasła. Link może być nieprawidłowy lub wygasł.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Hasło zostało zmienione
          </CardTitle>
          <CardDescription className="text-center">
            Możesz teraz zalogować się używając nowego hasła
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Alert className="border-green-200 bg-green-50 text-green-900">
            <p className="text-sm">
              Twoje hasło zostało pomyślnie zmienione. Możesz teraz zalogować się
              do swojego konta.
            </p>
          </Alert>
        </CardContent>

        <CardFooter>
          <Button asChild className="w-full">
            <a href="/login">Przejdź do logowania</a>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">
          Ustaw nowe hasło
        </CardTitle>
        <CardDescription className="text-center">
          Wprowadź nowe hasło dla swojego konta
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive" className="mb-4">
              {error}
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="password">Nowe hasło</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              {...register('password', {
                required: 'Hasło jest wymagane',
                minLength: {
                  value: 8,
                  message: 'Hasło musi mieć co najmniej 8 znaków',
                },
                pattern: {
                  value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                  message: 'Hasło musi zawierać małą literę, dużą literę i cyfrę',
                },
              })}
              aria-invalid={errors.password ? 'true' : 'false'}
              disabled={isSubmitting}
              autoFocus
            />
            {errors.password && (
              <p className="text-sm text-destructive" role="alert">
                {errors.password.message}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Minimum 8 znaków, zawiera małą literę, dużą literę i cyfrę
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Potwierdź nowe hasło</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              {...register('confirmPassword', {
                required: 'Potwierdzenie hasła jest wymagane',
                validate: (value) =>
                  value === password || 'Hasła muszą być identyczne',
              })}
              aria-invalid={errors.confirmPassword ? 'true' : 'false'}
              disabled={isSubmitting}
            />
            {errors.confirmPassword && (
              <p className="text-sm text-destructive" role="alert">
                {errors.confirmPassword.message}
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
            {isSubmitting ? 'Zmienianie hasła...' : 'Zmień hasło'}
          </Button>

          <p className="text-sm text-center text-muted-foreground">
            <a href="/login" className="text-primary hover:underline font-medium">
              Wróć do logowania
            </a>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}


