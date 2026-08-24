import Link from 'next/link';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../lib/auth"; 
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import JoinClubButton from "../../../ui/JoinClubButton";
import SignInButton from "../../../ui/SignInButton";
import PostAnnouncementForm from "../../../ui/PostAnnouncementForm";
import CreateEventForm from "../../../ui/CreateEventForm";
import CreateProjectForm from "../../../ui/CreateProjectForm";
import AddResourceForm from "../../../ui/AddResourceForm";


const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export default async function ClubPage({ params }) {
  const resolvedParams = await params;
  const clubId = resolvedParams.id;

  const session = await getServerSession(authOptions);

  const club = await prisma.club.findUnique({
    where: { id: clubId },
    include: { 
      president: true,
      vicePresident: true,
      technicalHead: true,
      members: true,
      announcements: { orderBy: { createdAt: 'desc' }},
      events: { orderBy: { date: 'asc' } },
      projects: { orderBy: { createdAt: 'desc' } },
      resources: { orderBy: { createdAt: 'desc' } }
    }
  });

  if (!club) {
    return (
      <main className="min-h-screen bg-black text-white p-12 flex flex-col items-center pt-[20vh]">
        <h1 className="text-4xl font-bold mb-4">Club Not Found</h1>
        <p className="text-zinc-400 mb-8">This club does not exist in the database.</p>
        <Link href="/" className="text-zinc-400 hover:text-white underline">
          &larr; Back to Directory
        </Link>
      </main>
    );
  }

  const userEmail = session?.user?.email;
  const isMember = club.members.some(member => member.email === userEmail);
  const isLeadership = 
    club.president?.email === userEmail ||
    club.vicePresident?.email === userEmail ||
    club.technicalHead?.email === userEmail;
  const hasAccessToAnnouncements = isMember || isLeadership;

  return (
    <main className="min-h-screen bg-black text-white p-10 max-w-4xl mx-auto">
      
      <Link href="/" className="text-zinc-400 hover:text-white mb-8 inline-block transition-colors">
        &larr; Back to Directory
      </Link>

      {/* --- PUBLIC SECTION: Visible to Everyone --- */}
      <div className="mb-12">
        <h1 className="text-5xl font-bold mb-4">{club.name}</h1>
        <p className="text-xl text-zinc-400 mb-8">{club.description}</p>
        
        <div className="p-6 border border-zinc-800 rounded-xl bg-zinc-900/50 max-w-md mb-8">
          <h3 className="text-lg font-semibold mb-4 border-b border-zinc-800 pb-2">Executive Board</h3>
          <div className="space-y-2 mb-4">
            <p className="text-zinc-300"><span className="text-zinc-500 w-32 inline-block">President:</span> {club.president?.name || "TBA"}</p>
            
            {club.vicePresident && (
              <p className="text-zinc-300"><span className="text-zinc-500 w-32 inline-block">Vice President:</span> {club.vicePresident.name}</p>
            )}
            
            {club.technicalHead && (
              <p className="text-zinc-300"><span className="text-zinc-500 w-32 inline-block">Technical Head:</span> {club.technicalHead.name}</p>
            )}
          </div>
          <p className="text-zinc-400 text-sm border-t border-zinc-800 pt-3"><strong>Total Members:</strong> {club.members.length}</p>
        </div>
        
        {/* If logged in but NOT a member/lead, show the Join button */}
        {session && !isMember && !isLeadership && (
          <JoinClubButton clubId={club.id} />
        )}
        
        {/* If not logged in at all, prompt them to sign in */}
        {!session && (
          <SignInButton />
        )}
      </div>

      {/* --- PUBLIC SECTION: Upcoming Events --- */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold border-b border-zinc-800 pb-2 mb-6">Upcoming Events</h2>

        {isLeadership && <CreateEventForm clubId={club.id} />}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {club.events.length === 0 ? (
            <p className="text-zinc-500 col-span-2">No upcoming events scheduled.</p>
          ) : (
            club.events.map((event) => (
              <div key={event.id} className="p-5 border border-zinc-800 rounded-xl bg-black">
                <h3 className="font-semibold text-lg text-white">{event.title}</h3>
                <p className="text-blue-400 text-sm mb-3">
                  {new Date(event.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                </p>
                <p className="text-zinc-400 text-sm mb-3">{event.description}</p>
                <div className="inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-md bg-zinc-900 text-zinc-300 border border-zinc-800">
                  📍 {event.location}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* --- PUBLIC SECTION: Project Showcase --- */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold border-b border-zinc-800 pb-2 mb-6 text-white flex items-center gap-2">
          🚀 Active Projects
        </h2>
        
        {/* Only the Executive Board sees the creation form */}
        {isLeadership && <CreateProjectForm clubId={club.id} />}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {club.projects.length === 0 ? (
            <div className="col-span-2 p-8 border border-zinc-800 border-dashed rounded-xl bg-black/50 text-center text-zinc-500">
              No projects showcased yet.
            </div>
          ) : (
            club.projects.map((project) => (
              <div key={project.id} className="p-6 border border-zinc-800 rounded-xl bg-black hover:border-zinc-600 transition-colors flex flex-col h-full">
                <h3 className="font-semibold text-lg text-white mb-2">{project.title}</h3>
                <p className="text-zinc-400 text-sm mb-6 flex-grow">{project.description}</p>
                
                {project.link && (
                  <a 
                    href={project.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex w-max items-center text-xs font-semibold px-3 py-1.5 rounded-md bg-zinc-900 text-blue-400 border border-zinc-800 hover:bg-zinc-800 transition-colors"
                  >
                    View Repository/Demo &rarr;
                  </a>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* --- PUBLIC SECTION: Resource & Study Vault --- */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold border-b border-zinc-800 pb-2 mb-6 text-white flex items-center gap-2">
          📚 Study Vault
        </h2>
        
        {/* Only the Executive Board sees the upload form */}
        {isLeadership && <AddResourceForm clubId={club.id} />}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {club.resources.length === 0 ? (
            <div className="col-span-full p-8 border border-zinc-800 border-dashed rounded-xl bg-black/50 text-center text-zinc-500">
              No resources have been added to the vault yet.
            </div>
          ) : (
            club.resources.map((resource) => (
              <a 
                key={resource.id}
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer" 
                className="flex items-center gap-4 p-4 border border-zinc-800 rounded-xl bg-black hover:border-zinc-500 transition-colors group"
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-zinc-900 text-zinc-400 group-hover:text-blue-400 group-hover:bg-blue-400/10 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </div>
                <div className="flex-1 overflow-hidden">
                  <h3 className="font-semibold text-white text-sm truncate">{resource.title}</h3>
                  {resource.type && (
                    <p className="text-zinc-500 text-xs mt-0.5">{resource.type}</p>
                  )}
                </div>
              </a>
            ))
          )}
        </div>
      </div>

      {/* --- PRIVATE SECTION: Only visible to Members and Leads --- */}
      {hasAccessToAnnouncements ? (
        <div className="bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            🔒 Member Announcements
          </h2>
          {isLeadership && <PostAnnouncementForm clubId={club.id} />}
          {club.announcements.length === 0 ? (
            <p className="text-zinc-500">No announcements yet.</p>
          ) : (
            club.announcements.map((announcement) => (
              <div key={announcement.id} className="mb-6 last:mb-0 pb-6 border-b border-zinc-800/50 last:border-0 last:pb-0">
                <h3 className="font-medium text-white text-lg">{announcement.title}</h3>
                <p className="text-zinc-400 mt-2">{announcement.content}</p>
                <span className="text-xs text-zinc-600 mt-3 block">
                  Posted on {new Date(announcement.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="bg-zinc-900/20 p-8 rounded-2xl border border-zinc-800 border-dashed text-center">
          <p className="text-zinc-500 font-medium">🔒 Join the club to see internal announcements and updates.</p>
        </div>
      )}

    </main>
  );
}