declare module 'spotify-preview-finder' {
  interface SpotifyPreviewResult {
    success: boolean;
    searchQuery: string;
    results: {
      name: string;
      albumName: string;
      releaseDate: string;
      popularity: number;
      durationMs: number;
      spotifyUrl: string;
      previewUrls: string[];
    }[];
    error?: string;
  }

  function spotifyPreviewFinder(query: string, limit?: number): Promise<SpotifyPreviewResult>;

  export = spotifyPreviewFinder;
}
