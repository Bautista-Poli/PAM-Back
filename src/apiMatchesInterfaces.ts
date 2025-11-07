// Interfaces para los partidos de espn 

export interface Team {
  id: string;
  uid: string;
  abbreviation: string;
  displayName: string;
  shortDisplayName: string;
  name: string;
  location: string;
  color: string;
  alternateColor: string;
  isActive: boolean;
  logo: string;
  links: Array<{
    rel: string[];
    href: string;
    text: string;
    isExternal: boolean;
    isPremium: boolean;
    isHidden: boolean;
  }>;
  venue: { id: string };
}

export interface Competitor {
  id: string;
  uid: string;
  type: string;
  order: number;
  homeAway: 'home' | 'away';
  winner: boolean;
  form: string;
  score: string;
  team: Team;
  records: Array<{
    name: string;
    type: string;
    summary: string;
    abbreviation: string;
  }>;
  statistics: any[];
  leaders: Array<{
    name: string;
    displayName: string;
    shortDisplayName: string;
    abbreviation: string;
    leaders: Array<{
      displayValue: string;
      value: number;
      athlete: {
        id: string;
        displayName: string;
        shortName: string;
        fullName: string;
        jersey: string;
        active: boolean;
        team: { id: string };
        links: Array<{
          rel: string[];
          href: string;
          isHidden: boolean;
        }>;
        position: { abbreviation: string };
      };
      team: { id: string };
    }>;
  }>;
}

export interface Competition {
  id: string;
  uid: string;
  date: string;
  startDate: string;
  attendance: number;
  timeValid: boolean;
  recent: boolean;
  status: {
    clock: number;
    displayClock: string;
    type: {
      id: string;
      name: string;
      state: string;
      completed: boolean;
      description: string;
      detail: string;
      shortDetail: string;
    };
  };
  venue: {
    id: string;
    fullName: string;
    address: { city: string; country: string };
  };
  format: { regulation: { periods: number } };
  notes: any[];
  geoBroadcasts: any[];
  broadcasts: any[];
  broadcast: string;
  competitors: Competitor[];
  details: any[];
  odds: Array<{
    overUnder: number;
    provider: { id: string; name: string; priority: number };
    awayTeamOdds: any;
    homeTeamOdds: any;
    drawOdds: any;
    total: any;
    pointSpread: any;
    moneyline: any;
    details: string;
  }>;
  wasSuspended: boolean;
  playByPlayAvailable: boolean;
  playByPlayAthletes: boolean;
}

export interface Event {
  id: string;
  uid: string;
  date: string;
  name: string;
  shortName: string;
  season: { year: number; type: number; slug: string };
  competitions: Competition[];
  status: {
    clock: number;
    displayClock: string;
    type: {
      id: string;
      name: string;
      state: string;
      completed: boolean;
      description: string;
      detail: string;
      shortDetail: string;
    };
  };
  venue: { displayName: string };
  links: Array<{
    language: string;
    rel: string[];
    href: string;
    text: string;
    shortText: string;
    isExternal: boolean;
    isPremium: boolean;
    isHidden: boolean;
  }>;
}

export interface League {
  id: string;
  uid: string;
  name: string;
  abbreviation: string;
  midsizeName: string;
  slug: string;
  season: {
    year: number;
    startDate: string;
    endDate: string;
    displayName: string;
    type: { id: string; type: number; name: string; abbreviation: string };
  };
  logos: Array<{
    href: string;
    width: number;
    height: number;
    alt: string;
    rel: string[];
    lastUpdated: string;
  }>;
  calendarType: string;
  calendarIsWhitelist: boolean;
  calendarStartDate: string;
  calendarEndDate: string;
  calendar: string[];
}

export interface ApiMatchesResponse {
  leagues: League[];
  season: { type: number; year: number };
  day: { date: string };
  events: Event[];
}
