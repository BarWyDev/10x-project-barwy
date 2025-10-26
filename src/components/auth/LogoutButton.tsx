/**
 * LogoutButton - Przycisk wylogowania użytkownika
 * 
 * Funkcjonalność:
 * - Wylogowanie użytkownika z Supabase Auth
 * - Przekierowanie do strony logowania
 */
import React, { useState } from 'react';
import { supabaseClient } from '@/db/supabase.client';
import { Button } from '@/components/ui/button';

export function LogoutButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);

    try {
      const { error } = await supabaseClient.auth.signOut();
      
      if (error) {
        console.error('Logout error:', error);
        return;
      }

      // Success - redirect to login page
      window.location.href = '/login';
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


