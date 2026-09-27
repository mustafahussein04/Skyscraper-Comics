export interface AdminEvent {
  id: number
  title: string
  description: string
  date: string // YYYY-MM-DD
  category: string
  time: string
  game: string
  capacity: string
  entryFee: string
  image?: string
}

export const adminEvents: AdminEvent[] = [
  {
    id: 1,
    title: 'Magic Commander Night',
    description: 'Standard format tournament with prizes for top finishers.',
    date: '2026-10-02',
    category: 'Tournament',
    time: '7:00 PM - 10:00 PM',
    game: 'Magic: The Gathering',
    capacity: '32 players',
    entryFee: '$5',
  },
  {
    id: 2,
    title: 'Pokemon League',
    description: 'Casual Pokemon play for all skill levels. Bring your own deck!',
    date: '2026-10-04',
    category: 'Casual Play',
    time: '2:00 PM - 5:00 PM',
    game: 'Pokemon TCG',
    capacity: '20 players',
    entryFee: 'Free',
  },
  {
    id: 3,
    title: 'Yu-Gi-Oh! Regional Qualifier',
    description: 'Official Konami-sanctioned regional tournament. Deck lists required at check-in.',
    date: '2026-10-11',
    category: 'Tournament',
    time: '12:00 PM - 8:00 PM',
    game: 'Yu-Gi-Oh!',
    capacity: '64 players',
    entryFee: '$20',
  },
  {
    id: 4,
    title: 'Board Game Open Night',
    description: 'Try new arrivals from the shelf or bring your own. All are welcome.',
    date: '2026-09-10',
    category: 'Casual Play',
    time: '5:00 PM - 9:00 PM',
    game: 'Board Games',
    capacity: '40 players',
    entryFee: 'Free',
  },
]
