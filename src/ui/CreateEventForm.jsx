"use client";

import { useRef, useState } from "react";
import { createEvent } from "../app/actions/clubActions";

export default function CreateEventForm({ clubId }) {
  const formRef = useRef(null);
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (formData) => {
    setIsPending(true);
    await createEvent(clubId, formData);
    formRef.current?.reset();
    setIsPending(false);
  };

  return (
    <form 
      ref={formRef} 
      action={handleSubmit} 
      className="mb-8 p-5 bg-zinc-900 border border-zinc-700 rounded-xl"
    >
      <h3 className="text-lg font-semibold text-white mb-4">📅 Schedule an Event</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <input 
          type="text" name="title" placeholder="Event Title" required 
          className="w-full px-4 py-2 rounded-lg bg-black border border-zinc-800 text-white focus:border-zinc-500 outline-none"
        />
        <input 
          type="text" name="location" placeholder="Location (e.g. Room 101)" required 
          className="w-full px-4 py-2 rounded-lg bg-black border border-zinc-800 text-white focus:border-zinc-500 outline-none"
        />
      </div>
      
      <input 
        type="datetime-local" name="date" required 
        className="w-full mb-4 px-4 py-2 rounded-lg bg-black border border-zinc-800 text-white focus:border-zinc-500 outline-none [color-scheme:dark]"
      />
      
      <textarea 
        name="description" placeholder="Event details..." rows="2"
        className="w-full mb-4 px-4 py-2 rounded-lg bg-black border border-zinc-800 text-white focus:border-zinc-500 outline-none resize-none"
      ></textarea>
      
      <button 
        type="submit" disabled={isPending}
        className="px-6 py-2 bg-white text-black font-semibold rounded-full hover:bg-zinc-200 transition-colors disabled:opacity-50"
      >
        {isPending ? "Scheduling..." : "Create Event"}
      </button>
    </form>
  );
}