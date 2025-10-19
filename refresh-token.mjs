/**
 * Refresh JWT Token
 * Signs in with existing test user to get fresh token
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const SUPABASE_URL = 'http://127.0.0.1:54321';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const TEST_USER_EMAIL = 'testuser@example.com';
const TEST_USER_PASSWORD = 'testpassword123';

async function refreshToken() {
  console.log('🔄 Refreshing JWT token...\n');

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  // Sign in to get fresh token
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email: TEST_USER_EMAIL,
    password: TEST_USER_PASSWORD,
  });

  if (signInError) {
    console.error('❌ Error signing in:', signInError.message);
    process.exit(1);
  }

  const accessToken = signInData.session.access_token;
  const userId = signInData.user.id;

  console.log('✅ Signed in successfully');
  console.log('📝 User ID:', userId);

  // Get existing deck
  const { data: deckData } = await supabase
    .from('decks')
    .select('*')
    .eq('user_id', userId)
    .limit(1)
    .single();

  if (!deckData) {
    console.error('❌ No deck found for user');
    process.exit(1);
  }

  console.log('📦 Deck ID:', deckData.id);

  // Update credentials file
  const creds = {
    email: TEST_USER_EMAIL,
    password: TEST_USER_PASSWORD,
    userId: userId,
    deckId: deckData.id,
    accessToken: accessToken,
    supabaseUrl: SUPABASE_URL
  };

  fs.writeFileSync('test-credentials.json', JSON.stringify(creds, null, 2));

  console.log('\n✅ Token refreshed!');
  console.log('📄 Updated: test-credentials.json\n');
}

refreshToken().catch(console.error);

