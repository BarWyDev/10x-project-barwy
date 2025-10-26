/**
 * RegisterForm - Formularz rejestracji nowego użytkownika
 * 
 * Funkcjonalność:
 * - Walidacja formularza z potwierdzeniem hasła
 * - Wymagania dotyczące silnego hasła
 * - Link do logowania
 * 
 * Backend (do implementacji później):
 * - Wywołanie supabase.auth.signUp()
 * - Automatyczne zalogowanie i przekierowanie do /app
 * - Zgodnie z US-001: bez potwierdzenia email
 */
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { registerSchema, type RegisterFormData } from '@/lib/validation/auth.schemas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';

export function RegisterForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>();

  const password = watch('password');

  const onSubmit = async (data: RegisterFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      // TODO: Backend - wywołanie supabase.auth.signUp()
      console.log('Registration attempt:', { email: data.email });
      
      // Symulacja opóźnienia
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // TODO: Po sukcesie - window.location.href = '/app'
      
      // Tymczasowo - symulacja błędu dla demonstracji UI
      setError('Ten adres email jest już zarejestrowany');
    } catch (err) {
      setError('Wystąpił błąd podczas rejestracji. Spróbuj ponownie.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">
          Rejestracja
        </CardTitle>
        <CardDescription className="text-center">
          Utwórz nowe konto, aby zacząć tworzyć fiszki
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
            />
            {errors.email && (
              <p className="text-sm text-destructive" role="alert">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Hasło</Label>
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
            <Label htmlFor="confirmPassword">Potwierdź hasło</Label>
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
            {isSubmitting ? 'Rejestracja...' : 'Zarejestruj się'}
          </Button>

          <p className="text-sm text-center text-muted-foreground">
            Masz już konto?{' '}
            <a href="/login" className="text-primary hover:underline font-medium">
              Zaloguj się
            </a>
          </p>

          <p className="text-xs text-center text-muted-foreground px-4">
            Rejestrując się, akceptujesz nasze warunki korzystania z usługi
            i politykę prywatności
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}


