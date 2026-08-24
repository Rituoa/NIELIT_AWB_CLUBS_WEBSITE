"use client";

import { useTransition } from "react";
import { leaveClub } from "../app/actions/clubActions";

export default function LeaveClubButton({ clubId }) {
  const [isPending, startTransition] = useTransition();

  const handleLeave = (e) => {
    e.preventDefault(); // Prevents the Link wrapping the card from triggering
    if (window.confirm("Are you sure you want to leave this club?")) {
      startTransition(() => leaveClub(clubId));
    }
  };

  return (
    <button
      onClick={handleLeave}
      disabled={isPending}
      className="text-xs text-red-400 font-medium hover:text-red-300 transition-colors disabled:opacity-50 px-3 py-1 rounded-md bg-red-400/10 hover:bg-red-400/20"
    >
      {isPending ? "Leaving..." : "Leave Club"}
    </button>
  );
}