// Direct API calls to Supabase Edge Functions (replacing tRPC)

const SUPABASE_FUNCTIONS_URL = "https://gbnfaysfuevpuwdovrbg.supabase.co/functions/v1";

export interface Video {
  id: string;
  title: string;
  publishedAt: string;
  duration: string;
}

export interface PlaylistResponse {
  videos: Video[];
}

export interface VideosResponse {
  videos: Video[];
}

export async function extractPlaylist(playlistId: string): Promise<PlaylistResponse> {
  const response = await fetch(
    `${SUPABASE_FUNCTIONS_URL}/youtube-api/playlist`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ playlistId }),
    }
  );

  const data = await response.json();
  
  if (!response.ok || data?.error) {
    throw new Error(data?.error || 'Failed to fetch playlist data');
  }

  return data;
}

export async function extractVideos(videoIds: string[]): Promise<VideosResponse> {
  const response = await fetch(
    `${SUPABASE_FUNCTIONS_URL}/youtube-api/videos`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ videoIds }),
    }
  );

  const data = await response.json();
  
  if (!response.ok || data?.error) {
    throw new Error(data?.error || 'Failed to fetch video data');
  }

  return data;
}

// Mastering API for content dashboard
export interface ContentCounts {
  videos: number;
  shorts: number;
  notes: number;
  keyConcepts: number;
  flashcards: number;
  mcqs: number;
}

export interface Program {
  id: string;
  title: string;
  courseCount: number;
  chapterCount: number;
  contentCounts: ContentCounts;
}

export interface Chapter {
  id: string;
  title: string;
  chapterNumber: number;
  videos?: number;
  shorts?: number;
  notes?: number;
  flashcards?: number;
  mcqs?: number;
  keyConcepts?: number;
  contentCounts?: ContentCounts;
}

export interface Course {
  id: string;
  title: string;
  chapters: Chapter[];
}

export interface ProgramDetail {
  id: string;
  title: string;
  courses: Course[];
}

export async function fetchPrograms(): Promise<Program[]> {
  const response = await fetch(
    `${SUPABASE_FUNCTIONS_URL}/mastering-api/programs`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  const data = await response.json();
  
  if (!response.ok || data?.error) {
    throw new Error(data?.error || 'Failed to fetch programs');
  }

  return data.programs || [];
}

export async function fetchProgram(id: string): Promise<{ program: ProgramDetail; courses: Course[] }> {
  const response = await fetch(
    `${SUPABASE_FUNCTIONS_URL}/mastering-api/program?id=${id}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  const data = await response.json();
  
  if (!response.ok || data?.error) {
    throw new Error(data?.error || 'Failed to fetch program');
  }

  if (!data.program) {
    throw new Error('No program data received');
  }

  return data;
}
