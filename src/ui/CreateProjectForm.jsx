"use client";

import { useRef, useState } from "react";
import { createProject } from "../app/actions/clubActions";

export default function CreateProjectForm({ clubId }) {
  const formRef = useRef(null);
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (formData) => {
    setIsPending(true);
    await createProject(clubId, formData);
    formRef.current?.reset();
    setIsPending(false);
  };

  return (
    <form ref={formRef} action={handleSubmit} className="mb-8 p-5 bg-zinc-900 border border-zinc-700 rounded-xl">
      <h3 className="text-lg font-semibold text-white mb-4">🚀 Showcase a Project</h3>
      <input 
        type="text" name="title" placeholder="Project Title (e.g. Custom OS Kernel)" required 
        className="w-full mb-4 px-4 py-2 rounded-lg bg-black border border-zinc-800 text-white outline-none"
      />
      <textarea 
        name="description" placeholder="What is the team building?" rows="3" required
        className="w-full mb-4 px-4 py-2 rounded-lg bg-black border border-zinc-800 text-white outline-none resize-none"
      ></textarea>
      <input 
        type="url" name="link" placeholder="Demo or GitHub URL (Optional)"
        className="w-full mb-4 px-4 py-2 rounded-lg bg-black border border-zinc-800 text-white outline-none"
      />
      <button type="submit" disabled={isPending} className="px-6 py-2 bg-white text-black font-semibold rounded-full hover:bg-zinc-200">
        {isPending ? "Posting..." : "Publish Project"}
      </button>
    </form>
  );
}