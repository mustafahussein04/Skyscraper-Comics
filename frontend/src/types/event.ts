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
  registrationLink?: string | null
  image?: string
}

