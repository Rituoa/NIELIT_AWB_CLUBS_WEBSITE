"use client";

import { useRef, useState } from "react";
import { addResource } from "../app/actions/clubActions";

export default function AddResourceForm({ clubId }) {
  const formRef = useRef(null);
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (formData) => {
    setIsPending(true);
    await addResource(clubId, formData);
    formRef.current?.reset();
    setIsPending(false);
  };

  return (
    <form ref={formRef} action={handleSubmit} className="mb-8 p-5 bg-zinc-900 border border-zinc-700 rounded-xl">
      <h3 className="text-lg font-semibold text-white mb-4">📚 Add to Study Vault</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <input type="text" name="title" placeholder="Resource Title (e.g. Unit 1 Notes)" required className="w-full px-4 py-2 rounded-lg bg-black border border-zinc-800 text-white outline-none"/>
        <input type="text" name="type" placeholder="Type (PDF, Link, Doc)" className="w-full px-4 py-2 rounded-lg bg-black border border-zinc-800 text-white outline-none"/>
      </div>
      
      <input type="url" name="url" placeholder="Paste the URL (Google Drive, Notion, etc.)" required className="w-full mb-4 px-4 py-2 rounded-lg bg-black border border-zinc-800 text-white outline-none"/>
      
      <button type="submit" disabled={isPending} className="px-6 py-2 bg-white text-black font-semibold rounded-full hover:bg-zinc-200">
        {isPending ? "Adding..." : "Add Resource"}
      </button>
    </form>
  );
}