/**
 * RegisterForm - Formularz rejestracji nowego użytkownika
 * 
 * Funkcjonalność:
 * - Walidacja formularza z potwierdzeniem hasła (react-hook-form + zod)
 * - Integracja z Supabase Auth
 * - Wymagania dotyczące silnego hasła
 * - Automatyczne zalogowanie i przekierowanie do /app (US-001)
 */
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, type RegisterFormData } from '@/lib/validation/auth.schemas';
import { supabaseClient } from '@/db/supabase.client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function RegisterForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const password = watch('password', '');

  const onSubmit = async (data: RegisterFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const { data: authData, error: authError } = await supabaseClient.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          // Explicitly set emailRedirectTo to current origin
          emailRedirectTo: `${window.location.origin}/app`,
          // Pass user metadata if needed
          data: {
            email: data.email,
          }
        }
      });

      if (authError) {
        // Handle specific error cases
        if (authError.message.includes('already registered')) {
          setError('Ten adres email jest już w użyciu. Możesz się zalogować lub użyć innego adresu.');
        } else if (authError.message.includes('Password')) {
          setError('Hasło jest za słabe. Spróbuj dodać więcej znaków lub symboli.');
        } else {
          setError(authError.message || 'Nie udało się utworzyć konta. Spróbuj ponownie.');
        }
        return;
      }

      // US-001: Automatic login after registration
      if (authData.session) {
        // Success - user is automatically logged in with session from signUp
        // Wait a bit for session to be saved to cookies by @supabase/ssr
        await new Promise(resolve => setTimeout(resolve, 300));
        window.location.replace('/app');
      } else if (authData.user) {
        // User created but no session - try to sign in with password
        
        const { data: signInData, error: signInError } = await supabaseClient.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        });

        if (signInError) {
          // Check if email confirmation is required
          if (signInError.message.includes('Email not confirmed')) {
            setError('Konto utworzone! Sprawdź swoją skrzynkę email (http://127.0.0.1:54324) i kliknij link aktywacyjny, aby móc się zalogować.');
          } else {
            setError('Konto utworzone, ale nie udało się automatycznie zalogować. Przejdź do strony logowania.');
            // Redirect to login page after 2 seconds
            setTimeout(() => {
              window.location.href = '/login';
            }, 2000);
          }
          return;
        }

        if (signInData.session) {
          // Success - user is now logged in
          // Wait a bit for session to be saved to cookies by @supabase/ssr
          await new Promise(resolve => setTimeout(resolve, 300));
          window.location.replace('/app');
        } else {
          setError('Konto utworzone, ale nie udało się automatycznie zalogować. Przejdź do strony logowania.');
        }
      } else {
        // No user created - this shouldn't happen
        setError('Wystąpił błąd podczas rejestracji. Spróbuj ponownie.');
      }
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
            <Alert className="mb-4 border-amber-200 bg-amber-50">
              <AlertDescription className="text-amber-800">
                ⚠️ {error}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="twoj@email.pl"
              {...register('email', {
                required: 'Wpisz swój adres email',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Sprawdź format email (np. nazwa@domena.pl)',
                },
              })}
              aria-invalid={errors.email ? 'true' : 'false'}
              disabled={isSubmitting}
            />
            {errors.email && (
              <p className="text-sm text-blue-600" role="alert">
                💡 {errors.email.message}
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
                required: 'Wpisz hasło',
                minLength: {
                  value: 8,
                  message: 'Dodaj jeszcze kilka znaków (minimum 8)',
                },
                pattern: {
                  value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                  message: 'Hasło powinno zawierać: małą literę, dużą literę i cyfrę',
                },
              })}
              aria-invalid={errors.password ? 'true' : 'false'}
              disabled={isSubmitting}
            />
            {errors.password && (
              <p className="text-sm text-blue-600" role="alert">
                💡 {errors.password.message}
              </p>
            )}
            {!errors.password && (
              <p className="text-xs text-muted-foreground">
                Minimum 8 znaków, zawiera małą literę, dużą literę i cyfrę
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Potwierdź hasło</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              {...register('confirmPassword', {
                required: 'Wpisz hasło ponownie',
                validate: (value) =>
                  value === password || 'Hasła nie są takie same - sprawdź jeszcze raz',
              })}
              aria-invalid={errors.confirmPassword ? 'true' : 'false'}
              disabled={isSubmitting}
            />
            {errors.confirmPassword && (
              <p className="text-sm text-blue-600" role="alert">
                💡 {errors.confirmPassword.message}
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


