"use client";

import { useRef, useState } from "react";
import { postAnnouncement } from "../app/actions/clubActions";

export default function PostAnnouncementForm({ clubId }) {
  const formRef = useRef(null);
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (formData) => {
    setIsPending(true);
    await postAnnouncement(clubId, formData);
    formRef.current?.reset(); // Clears the inputs after posting
    setIsPending(false);
  };

  return (
    <form 
      ref={formRef} 
      action={handleSubmit} 
      className="mb-8 p-5 bg-zinc-900 border border-zinc-700 rounded-xl"
    >
      <h3 className="text-lg font-semibold text-white mb-4">📢 Post a New Update</h3>
      
      <input 
        type="text" 
        name="title" 
        placeholder="Announcement Title" 
        required 
        className="w-full mb-3 px-4 py-2 rounded-lg bg-black border border-zinc-800 text-white focus:outline-none focus:border-zinc-500 transition-colors"
      />
      
      <textarea 
        name="content" 
        placeholder="What's happening in the club?" 
        required 
        rows="3"
        className="w-full mb-4 px-4 py-2 rounded-lg bg-black border border-zinc-800 text-white focus:outline-none focus:border-zinc-500 transition-colors resize-none"
      ></textarea>
      
      <button 
        type="submit" 
        disabled={isPending}
        className="px-6 py-2 bg-white text-black font-semibold rounded-full hover:bg-zinc-200 transition-colors disabled:opacity-50"
      >
        {isPending ? "Posting..." : "Post Announcement"}
      </button>
    </form>
  );
}