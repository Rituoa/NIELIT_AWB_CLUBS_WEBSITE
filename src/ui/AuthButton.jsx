"use client";

import { signIn, signOut } from "next-auth/react";

export default function AuthButton({ session }) {
  // Safely check if session AND user exist
  if (session?.user) {
    // Fallback to "Student" if the Google account doesn't have a name
    const firstName = session.user.name ? session.user.name.split(" ")[0] : "Student";
    
    return (
      <button 
        onClick={() => signOut()} 
        className="px-6 py-2 mt-8 rounded-full bg-zinc-800 text-white font-medium hover:bg-zinc-700 transition-colors border border-zinc-700"
      >
        Sign Out ({firstName})
      </button>
    );
  }

  return (
    <button 
      onClick={() => signIn("google")} 
      className="px-6 py-2 mt-8 rounded-full bg-white text-black font-medium hover:bg-zinc-200 transition-colors"
    >
      Sign in with Google
    </button>
  );
}