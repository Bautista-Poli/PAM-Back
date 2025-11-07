// Interfaces para standings (tabla de posiciones) de espn


interface Logo {
  href: string;
  width: number;
  height: number;
  alt: string;
  rel: string[];
  lastUpdated: string;
}

interface TeamLink {
  language: string;
  rel: string[];
  href: string;
  text: string;
  shortText: string;
  isExternal: boolean;
  isPremium: boolean;
}

interface Team {
  id: string;
  uid: string;
  location: string;
  name: string;
  abbreviation: string;
  displayName: string;
  shortDisplayName: string;
  isActive: boolean;
  logos: Logo[];
  links: TeamLink[];
  isNational: boolean;
}

interface Stat {
  name: string;
  displayName: string;
  shortDisplayName: string;
  description: string;
  abbreviation: string;
  type: string;
  value: number;
  displayValue: string;
  id?: string;
  summary?: string;
}

export interface StandingsEntry {
  team: Team;
  stats: Stat[];
}

interface StandingsGroup {
  id: string;
  name: string;
  displayName: string;
  links: Array<{
    language: string;
    rel: string[];
    href: string;
    text: string;
    shortText: string;
    isExternal: boolean;
    isPremium: boolean;
  }>;
  season: number;
  seasonType: number;
  seasonDisplayName: string;
  entries: StandingsEntry[];
}

interface ChildLeague {
  uid: string;
  id: string;
  name: string;
  abbreviation: string;
  standings: StandingsGroup;
}

interface SeasonType {
  id: string;
  name: string;
  abbreviation: string;
  startDate: string;
  endDate: string;
  hasStandings: boolean;
}

interface Season {
  year: number;
  startDate: string;
  endDate: string;
  displayName: string;
  types: SeasonType[];
  seasonYears: string;
}

export interface ApiStandingsResponse {
  uid: string;
  id: string;
  name: string;
  abbreviation: string;
  children: ChildLeague[];
  seasons: Season[];
}