"use client";

import { signIn } from "next-auth/react";

export default function SignInButton() {
  return (
    <button
      onClick={() => signIn("google")}
      className="mt-6 px-6 py-2 bg-white text-black font-semibold rounded-full hover:bg-zinc-200 transition-colors"
    >
      Sign in to Join
    </button>
  );
}