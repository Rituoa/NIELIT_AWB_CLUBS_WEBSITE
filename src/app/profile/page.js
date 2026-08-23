import Link from 'next/link';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../lib/auth"; 
import { redirect } from "next/navigation";
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

// --- Database Setup ---
const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export default async function ProfilePage() {
  // 1. Get session. If not logged in, kick them back to the homepage.
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    redirect("/");
  }

  // 2. Fetch the user and include BOTH the clubs they joined and the ones they lead
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      clubsJoined: true,
      clubsLed: true,
    }
  });

  return (
    <main className="min-h-screen bg-black text-white p-10 max-w-4xl mx-auto">
      
      <Link href="/" className="text-zinc-400 hover:text-white mb-8 inline-block transition-colors">
        &larr; Back to Home
      </Link>

      {/* --- Header Profile Section --- */}
      <div className="flex items-center gap-6 mb-12 p-6 bg-zinc-900/50 border border-zinc-800 rounded-2xl">
        {user.image ? (
          <img src={user.image} alt="Profile" className="w-20 h-20 rounded-full border border-zinc-700" />
        ) : (
          <div className="w-20 h-20 rounded-full bg-zinc-800 flex items-center justify-center text-2xl font-bold">
            {user.name?.charAt(0)}
          </div>
        )}
        <div>
          <h1 className="text-3xl font-bold text-white">{user.name}</h1>
          <p className="text-zinc-400">{user.email}</p>
        </div>
      </div>

      {/* --- Clubs You Lead --- */}
      {user.clubsLed.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-semibold border-b border-zinc-800 pb-2 mb-6 text-blue-400">
            👑 Clubs You Lead
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {user.clubsLed.map(club => (
              <Link href={`/clubs/${club.id}`} key={club.id} className="block p-5 border border-zinc-800 rounded-xl bg-black hover:border-zinc-500 transition-colors">
                <h3 className="font-bold text-lg text-white">{club.name}</h3>
                <p className="text-zinc-400 text-sm mt-1 line-clamp-2">{club.description}</p>
                <span className="text-xs text-blue-400 mt-3 block font-medium">Manage Club &rarr;</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* --- Clubs You've Joined --- */}
      <div>
        <h2 className="text-2xl font-semibold border-b border-zinc-800 pb-2 mb-6">
          ✅ Enrolled Clubs
        </h2>
        {user.clubsJoined.length === 0 ? (
          <div className="p-8 border border-zinc-800 border-dashed rounded-xl text-center">
            <p className="text-zinc-500 mb-4">You haven't joined any clubs yet.</p>
            <Link href="/" className="px-6 py-2 bg-white text-black font-semibold rounded-full hover:bg-zinc-200 transition-colors">
              Explore Clubs
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {user.clubsJoined.map(club => (
              <Link href={`/clubs/${club.id}`} key={club.id} className="block p-5 border border-zinc-800 rounded-xl bg-black hover:border-zinc-500 transition-colors">
                <h3 className="font-bold text-lg text-white">{club.name}</h3>
                <span className="text-xs text-zinc-400 mt-3 block">View Announcements &rarr;</span>
              </Link>
            ))}
          </div>
        )}
      </div>

    </main>
  );
}