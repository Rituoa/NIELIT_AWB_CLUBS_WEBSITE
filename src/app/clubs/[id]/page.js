import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../lib/auth";
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import Link from "next/link";
import JoinClubButton from "../../../ui/JoinClubButton";
import CreateProjectForm from "../../../ui/CreateProjectForm";
import AddResourceForm from "../../../ui/AddResourceForm";

// Initialize Database
const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export default async function ClubPage({ params }) {
  // 1. Await the params first!
  const resolvedParams = await params;
  const clubId = resolvedParams.id;
  
  const session = await getServerSession(authOptions);
  const userEmail = session?.user?.email;

  // 2. Pass the resolved clubId into your Prisma query
  const club = await prisma.club.findUnique({
    where: { id: clubId },
    include: {
      president: true,
      vicePresident: true,
      technicalHead: true,
      members: true,
      announcements: { orderBy: { createdAt: 'desc' } },
      events: { orderBy: { date: 'asc' } },
      projects: { orderBy: { createdAt: 'desc' } },
      resources: { orderBy: { createdAt: 'desc' } }
    }
  });
  if (!club) {
    return (
      <main className="min-h-screen bg-[#09090b] flex items-center justify-center text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Club Not Found</h1>
          <Link href="/" className="text-blue-400 hover:underline">Return to Nexus Hub</Link>
        </div>
      </main>
    );
  }

  // Security Checks
  const isLeadership = 
    club.president?.email === userEmail || 
    club.vicePresident?.email === userEmail || 
    club.technicalHead?.email === userEmail;

  const isMember = club.members.some(member => member.email === userEmail);

  return (
    <main className="relative min-h-screen bg-[#09090b] text-zinc-200 pb-24 overflow-hidden selection:bg-purple-500/30">
      
      {/* --- BACKGROUND EFFECTS (Matching the Homepage) --- */}
      <div className="absolute inset-0 z-0 h-full w-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
      
      {/* Ambient Glowing Orbs */}
      <div className="absolute left-0 right-0 top-0 -z-0 m-auto h-[310px] w-[310px] rounded-full bg-purple-600 opacity-20 blur-[100px] pointer-events-none"></div>
      <div className="absolute -left-40 top-40 -z-0 h-[400px] w-[400px] rounded-full bg-blue-600 opacity-10 blur-[120px] pointer-events-none"></div>
      <div className="absolute -right-40 top-80 -z-0 h-[400px] w-[400px] rounded-full bg-indigo-500 opacity-10 blur-[120px] pointer-events-none"></div>

      {/* --- PAGE CONTENT --- */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 pt-12">
        
        {/* Navigation */}
        <Link href="/" className="inline-flex items-center text-sm font-semibold text-zinc-400 hover:text-purple-400 transition-colors mb-8 group">
          <span className="mr-2 group-hover:-translate-x-1 transition-transform">&larr;</span> 
          Back to Directory
        </Link>

        {/* --- 1. CLUB HEADER (Glassmorphism) --- */}
        <div className="p-8 md:p-12 mb-12 bg-zinc-900/40 backdrop-blur-md border border-zinc-800/80 rounded-3xl shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-400"></div>
          
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">{club.name}</h1>
              <p className="text-lg text-zinc-300 leading-relaxed max-w-2xl">{club.description}</p>
              
              <div className="mt-6 flex flex-wrap items-center gap-4 text-sm font-medium">
                <span className="px-3 py-1 bg-purple-500/10 text-purple-300 border border-purple-500/20 rounded-full">
                  President: {club.president?.name || "Vacant"}
                </span>
                <span className="px-3 py-1 bg-blue-500/10 text-blue-300 border border-blue-500/20 rounded-full">
                  Members: {club.members.length}
                </span>
              </div>
            </div>

            <div className="shrink-0 mt-4 md:mt-0">
              {session?.user ? (
                !isMember && !isLeadership && <JoinClubButton clubId={club.id} />
              ) : (
                <Link href="/" className="px-6 py-2.5 bg-white text-black font-semibold rounded-full hover:bg-zinc-200 transition-colors">
                  Sign in to Join
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* --- 2. ACTIVE PROJECTS --- */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <span className="text-xl">🚀</span> Active Projects
          </h2>
          
          {isLeadership && <CreateProjectForm clubId={club.id} />}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            {club.projects.length === 0 ? (
              <div className="col-span-2 p-8 border border-zinc-800 border-dashed rounded-2xl bg-zinc-900/20 backdrop-blur-sm text-center text-zinc-500">
                No active projects showcased yet.
              </div>
            ) : (
              club.projects.map((project) => (
                <div key={project.id} className="p-6 border border-zinc-800 rounded-2xl bg-zinc-900/40 backdrop-blur-sm hover:bg-zinc-800/60 transition-colors flex flex-col h-full shadow-lg">
                  <h3 className="font-semibold text-lg text-white mb-2">{project.title}</h3>
                  <p className="text-zinc-400 text-sm mb-6 flex-grow">{project.description}</p>
                  
                  {project.link && (
                    <a href={project.link} target="_blank" rel="noopener noreferrer" className="inline-flex w-max items-center text-xs font-semibold px-4 py-2 rounded-lg bg-zinc-800 text-blue-300 border border-zinc-700 hover:bg-zinc-700 transition-colors">
                      View Repository &rarr;
                    </a>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* --- 3. STUDY VAULT (Resources) --- */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <span className="text-xl">📚</span> Study Vault
          </h2>
          
          {isLeadership && <AddResourceForm clubId={club.id} />}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            {club.resources.length === 0 ? (
              <div className="col-span-full p-8 border border-zinc-800 border-dashed rounded-2xl bg-zinc-900/20 backdrop-blur-sm text-center text-zinc-500">
                The vault is currently empty.
              </div>
            ) : (
              club.resources.map((resource) => (
                <a key={resource.id} href={resource.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 border border-zinc-800 rounded-2xl bg-zinc-900/40 backdrop-blur-sm hover:bg-zinc-800/80 hover:border-zinc-600 transition-all group shadow-lg">
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-zinc-800 text-zinc-400 group-hover:text-purple-400 group-hover:bg-purple-500/10 transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <h3 className="font-semibold text-zinc-200 text-sm truncate group-hover:text-white transition-colors">{resource.title}</h3>
                    {resource.type && <p className="text-zinc-500 text-xs mt-1 uppercase tracking-wider">{resource.type}</p>}
                  </div>
                </a>
              ))
            )}
          </div>
        </div>

      </div>
    </main>
  );
}