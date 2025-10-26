/**
 * LogoutButton - Przycisk wylogowania użytkownika
 * 
 * Funkcjonalność:
 * - Wylogowanie użytkownika
 * - Przekierowanie do strony logowania
 * 
 * Backend (do implementacji później):
 * - Wywołanie supabase.auth.signOut()
 * - Przekierowanie do /login po wylogowaniu
 */
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

export function LogoutButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);

    try {
      // TODO: Backend - wywołanie supabase.auth.signOut()
      console.log('Logout attempt');
      
      // Symulacja opóźnienia
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      // TODO: Po sukcesie - window.location.href = '/login'
      console.log('User logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handleLogout}
      disabled={isLoading}
    >
      {isLoading ? 'Wylogowywanie...' : 'Wyloguj się'}
    </Button>
  );
}


