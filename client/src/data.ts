export const songLists=[
    {title: 'Strategy', artist: 'Twice', limit:1},
    {title: 'Psycho', artist: 'Red Velvet', limit:1},
    {title: 'drivers license', artist: 'Olivia Rodrigo', limit:1},
    {title: 'borderline', 'artist': 'Tame Impala', limit:1},
    {title: 'chihiro', artist: 'billie eilish', limit:1},
    {title: 'vampire', artist: 'Olivia Rodrigo', limit:1}
]


export interface SongMeta{
    title: string,
    artist: string,
    previewUrl?: string,
    trackId: string,
    albumName: string,
    releaseDate: string,
    popularity: string,
}
