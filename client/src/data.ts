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

export const images=[
    'https://i.pinimg.com/736x/b0/c4/36/b0c43678e789e0df7d4395e37426912b.jpg',
    'https://i.pinimg.com/736x/c5/15/5c/c5155cb3827bded3a437ff8e4fd1b35e.jpg',
    'https://i.pinimg.com/1200x/6c/ad/6b/6cad6b0b90816dd693ac963fe3841cf4.jpg',
    'https://i.pinimg.com/736x/9b/27/93/9b2793739819d9cc1f6ddde9fb2bd176.jpg',
    'https://i.pinimg.com/736x/ad/60/a3/ad60a35c899c49d25a8cf2789ced2204.jpg',
    'https://i.pinimg.com/736x/10/cf/f4/10cff445b32b849b98146dc6a4b9104c.jpg'
    ]
