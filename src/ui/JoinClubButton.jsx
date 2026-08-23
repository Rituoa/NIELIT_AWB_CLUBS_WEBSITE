"use client";

import { useTransition } from "react";
import { joinClub } from "../app/actions/clubActions";

export default function JoinClubButton({ clubId }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      onClick={() => startTransition(() => joinClub(clubId))}
      disabled={isPending}
      className="mt-6 px-6 py-2 bg-white text-black font-semibold rounded-full hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isPending ? "Joining..." : "Join this Club"}
    </button>
  );
}