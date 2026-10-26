/**
 * Single source of truth for event categories (SCRUM-167).
 *
 * Consumed by:
 *  - the public calendar legend + event pill colors (EventsPage.vue)
 *  - the admin Add/Edit Event category dropdown (AdminEventEditModal.vue)
 *
 * Colors are muted hex values chosen to stay distinct from one another and
 * readable with white text on calendar pills.
 */
export interface EventCategory {
  name: string
  color: string
}

export const EVENT_CATEGORIES: EventCategory[] = [
  { name: 'Magic: The Gathering', color: '#7c3aed' },
  { name: 'Pokémon', color: '#e11d48' },
  { name: 'Riftbound', color: '#65a30d' },
  { name: 'Lorcana', color: '#2563eb' },
  { name: 'Tabletop Games', color: '#0d9488' },
]

/** Default color for events with old or missing categories. */
export const DEFAULT_CATEGORY_COLOR = '#1e3a8a'

export const getCategoryColor = (category: string): string =>
  EVENT_CATEGORIES.find(c => c.name === category)?.color ?? DEFAULT_CATEGORY_COLOR
