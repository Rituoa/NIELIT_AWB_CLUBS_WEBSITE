"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import Link from 'next/link'

export default function AuthButton() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <button disabled className="px-6 py-2 mt-8 rounded-full bg-zinc-800 text-zinc-500 font-medium">
        Checking session...
      </button>
    );
  }

  if (session?.user) {
    const firstName = session.user.name ? session.user.name.split(" ")[0] : "Student";
    return (
      <div className="flex flex-col sm:flex-row gap-4 mt-8">
        <Link 
          href="/profile"
          className="px-6 py-2 rounded-full bg-white text-black font-medium hover:bg-zinc-200 transition-colors text-center"
        >
          My Profile Dashboard
        </Link>
        <button 
          onClick={() => signOut()} 
          className="px-6 py-2 mt-8 rounded-full bg-zinc-800 text-white font-medium hover:bg-zinc-700 transition-colors border border-zinc-700"
        >
          Sign Out ({firstName})
        </button>
      </div>
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