export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth/next";
import { authOptions } from "../../lib/auth"; // Adjust path if your auth.js is elsewhere
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import Link from "next/link";
import AuthButton from "../../ui/AuthButton";

// Initialize Database
const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return (
      <main className="min-h-screen bg-[#09090b] flex items-center justify-center text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-zinc-400 mb-6">Please initialize a connection to view your command center.</p>
          <AuthButton />
        </div>
      </main>
    );
  }

  const userEmail = session.user.email;

  // 1. Fetch clubs the user is a general member of
  const memberClubs = await prisma.club.findMany({
    where: { members: { some: { email: userEmail } } }
  });

  // 2. Fetch clubs the user leads (Executive Board)
  const leadingClubs = await prisma.club.findMany({
    where: {
      OR: [
        { president: { email: userEmail } },
        { vicePresident: { email: userEmail } },
        { technicalHead: { email: userEmail } }
      ]
    },
    include: {
      president: true,
      vicePresident: true,
      technicalHead: true
    }
  });

  return (
    <main className="relative min-h-screen bg-[#09090b] text-zinc-200 pb-24 overflow-hidden selection:bg-cyan-500/30">
      
      {/* --- BACKGROUND EFFECTS --- */}
      <div className="absolute inset-0 z-0 h-full w-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
      
      {/* Ambient Glowing Orbs */}
      <div className="absolute left-0 right-0 top-0 -z-0 m-auto h-[310px] w-[310px] rounded-full bg-purple-600 opacity-20 blur-[100px] pointer-events-none"></div>
      <div className="absolute -left-40 top-40 -z-0 h-[400px] w-[400px] rounded-full bg-blue-600 opacity-10 blur-[120px] pointer-events-none"></div>
      <div className="absolute -right-40 top-80 -z-0 h-[400px] w-[400px] rounded-full bg-cyan-500 opacity-10 blur-[120px] pointer-events-none"></div>

      {/* --- PAGE CONTENT --- */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 pt-12 md:pt-20">
        
        {/* Navigation */}
        <Link href="/" className="inline-flex items-center text-sm font-semibold text-zinc-400 hover:text-cyan-400 transition-colors mb-8 group">
          <span className="mr-2 group-hover:-translate-x-1 transition-transform">&larr;</span> 
          Return to Hub
        </Link>

        {/* --- 1. USER IDENTITY CARD --- */}
        <div className="p-8 md:p-12 mb-16 bg-zinc-900/40 backdrop-blur-md border border-zinc-800/80 rounded-3xl shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center md:items-start gap-8 text-center md:text-left">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500"></div>
          
          <img 
            src={session.user.image || `https://ui-avatars.com/api/?name=${session.user.name}&background=0D8ABC&color=fff`} 
            alt="Profile" 
            className="w-32 h-32 rounded-full border-4 border-zinc-800/80 shadow-[0_0_30px_rgba(6,182,212,0.2)] object-cover shrink-0"
          />
          
          <div className="flex-1 w-full flex flex-col md:flex-row justify-between items-center md:items-start gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-2">
                {session.user.name}
              </h1>
              <p className="text-zinc-400 font-mono text-sm tracking-widest uppercase mb-4">
                {session.user.email}
              </p>
              
              <div className="flex flex-wrap justify-center md:justify-start gap-3">
                <span className="px-3 py-1 bg-zinc-800/50 border border-zinc-700 rounded-lg text-xs font-bold text-zinc-300 tracking-wider">
                  NEXUS USER
                </span>
                {leadingClubs.length > 0 && (
                  <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-lg text-xs font-bold text-blue-400 tracking-wider shadow-[0_0_10px_rgba(59,130,246,0.2)]">
                    EXECUTIVE BOARD
                  </span>
                )}
              </div>
            </div>
            
            <div className="shrink-0 mt-2 md:mt-0">
              <AuthButton />
            </div>
          </div>
        </div>

        {/* --- 2. EXECUTIVE DASHBOARD (Only visible if they lead a club) --- */}
        {leadingClubs.length > 0 && (
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
              <div className="w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.8)] animate-pulse"></div>
              <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400">
                Executive Command
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {leadingClubs.map(club => {
                // Determine their specific role for this club
                let role = "Leader";
                if (club.president?.email === userEmail) role = "President";
                else if (club.vicePresident?.email === userEmail) role = "Vice President";
                else if (club.technicalHead?.email === userEmail) role = "Technical Head";

                return (
                  <Link href={`/clubs/${club.id}`} key={club.id} className="group p-6 border border-zinc-800 rounded-2xl bg-zinc-900/40 backdrop-blur-sm hover:border-cyan-500/50 hover:bg-zinc-800/60 transition-all flex flex-col h-full shadow-lg">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="font-bold text-xl text-white group-hover:text-cyan-400 transition-colors">{club.name}</h3>
                      <span className="px-2.5 py-1 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-md text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
                        {role}
                      </span>
                    </div>
                    <p className="text-zinc-500 text-sm mb-6 flex-grow line-clamp-2">{club.description}</p>
                    <div className="text-xs font-bold text-cyan-500 uppercase tracking-widest border-t border-white/5 pt-4">
                      Manage Subsystem <span className="group-hover:translate-x-2 transition-transform duration-300 inline-block">&rarr;</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* --- 3. ACTIVE SUBSYSTEMS (Memberships) --- */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
            <div className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.8)]"></div>
            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400">
              Active Subscriptions
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {memberClubs.length === 0 ? (
              <div className="col-span-full p-8 border border-zinc-800 border-dashed rounded-2xl bg-zinc-900/20 backdrop-blur-sm text-center text-zinc-500">
                You are not currently subscribed to any subsystems.
              </div>
            ) : (
              memberClubs.map(club => (
                <Link href={`/clubs/${club.id}`} key={club.id} className="group p-6 border border-zinc-800 rounded-2xl bg-zinc-900/40 backdrop-blur-sm hover:border-purple-500/50 hover:bg-zinc-800/60 transition-all flex flex-col h-full shadow-lg">
                  <h3 className="font-bold text-xl text-white group-hover:text-purple-400 transition-colors mb-2">{club.name}</h3>
                  <p className="text-zinc-500 text-sm mb-6 flex-grow line-clamp-2">{club.description}</p>
                  <div className="text-xs font-bold text-purple-400 uppercase tracking-widest border-t border-white/5 pt-4">
                    Access Network <span className="group-hover:translate-x-2 transition-transform duration-300 inline-block">&rarr;</span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

      </div>
    </main>
  );
}