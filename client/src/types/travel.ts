export interface Segment {
  mode: 'bus' | 'metro' | 'walk' | 'uber' | 'auto';
  description: string;
  duration: number;
  cost: number;
  lat?: number;
  lng?: number;
}

export interface RouteOption {
  type: 'public' | 'hybrid' | 'private';
  name: string;
  segments: Segment[];
  switchPoint: string | null;
  switchPointCoords: { lat: number; lng: number } | null;
  switchReason: string | null;
  totalTime: number;
  totalCost: number;
  comfort: number;
  recommended: boolean;
}

export interface Traveler {
  name: string;
  location: string;
  hasCar: boolean;
}

export interface TravelerRoute {
  name: string;
  from: string;
  hasCar: boolean;
  mode: string;
  routeDescription: string;
  duration: number;
  cost: number;
}

export interface MergePointResponse {
  mergePoint: string;
  mergePointArea: string;
  mergePointCoords: { lat: number; lng: number };
  mergeReason: string;
  travelerRoutes: TravelerRoute[];
  finalLeg: {
    description: string;
    duration: number;
    mode: string;
  };
  insight: string;
}
