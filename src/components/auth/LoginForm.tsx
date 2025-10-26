/**
 * LoginForm - Formularz logowania użytkownika
 * 
 * Funkcjonalność:
 * - Walidacja formularza za pomocą react-hook-form + zod
 * - Wyświetlanie błędów walidacji
 * - Link do rejestracji i przypomnienia hasła
 * 
 * Backend (do implementacji później):
 * - Wywołanie supabase.auth.signInWithPassword()
 * - Przekierowanie do /app po sukcesie
 */
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { loginSchema, type LoginFormData } from '@/lib/validation/auth.schemas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';

export function LoginForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    // Integracja z zod będzie wymagała @hookform/resolvers
    // Na razie zostawimy podstawową walidację HTML5
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      // TODO: Backend - wywołanie supabase.auth.signInWithPassword()
      console.log('Login attempt:', { email: data.email });
      
      // Symulacja opóźnienia
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // TODO: Po sukcesie - window.location.href = '/app'
      
      // Tymczasowo - symulacja błędu dla demonstracji UI
      setError('Nieprawidłowy email lub hasło');
    } catch (err) {
      setError('Wystąpił błąd podczas logowania. Spróbuj ponownie.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">
          Logowanie
        </CardTitle>
        <CardDescription className="text-center">
          Zaloguj się do swojego konta
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
                  value: 6,
                  message: 'Hasło musi mieć co najmniej 6 znaków',
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
          </div>

          <div className="text-sm text-right">
            <a
              href="/forgot-password"
              className="text-primary hover:underline"
            >
              Zapomniałeś hasła?
            </a>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4">
          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Logowanie...' : 'Zaloguj się'}
          </Button>

          <p className="text-sm text-center text-muted-foreground">
            Nie masz konta?{' '}
            <a href="/register" className="text-primary hover:underline font-medium">
              Zarejestruj się
            </a>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}


