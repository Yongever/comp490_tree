import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const supabaseUrl = 'https://qrpsxkszvsneojwdzufr.supabase.co';
const supabaseKey = 'your-supabase-key';
const supabase = createClient(supabaseUrl, supabaseKey);

async function updateProfileIcon() {
  const { data: { session } } = await supabase.auth.getSession();
  const profileIcon = document.getElementById('profile-icon');

  if (session) {
    // User is logged in
    profileIcon.innerHTML = '<img src="logged-in-icon.png" alt="Logged In">';
    profileIcon.href = 'profile.html';
  } else {
    // User is not logged in
    profileIcon.innerHTML = '<img src="logged-out-icon.png" alt="Not Logged In">';
    profileIcon.href = 'login.html';
  }
}

async function logout() {
    await supabase.auth.signOut();
    window.location.href = 'login.html';
  }
  
  // Expose the logout function globally
  window.logout = logout;
// Call this function when the page loads
document.addEventListener('DOMContentLoaded', updateProfileIcon);