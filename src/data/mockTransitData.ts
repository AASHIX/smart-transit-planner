export interface BusStop {
  id: string;
  name: string;
  lat: number;
  lng: number;
  routes: string[];
}

export interface BusPosition {
  id: string;
  routeId: string;
  lat: number;
  lng: number;
  heading: number;
  speed: number;
  delay: number; // seconds, negative = early
  tripId: string;
  label: string;
}

export interface RouteResult {
  id: string;
  routeName: string;
  routeNumber: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  transfers: number;
  status: 'on-time' | 'delayed';
  delayMinutes?: number;
  stops: { name: string; time: string }[];
  polyline: [number, number][];
}

// Durham Region center
export const DURHAM_CENTER: [number, number] = [43.8971, -78.8658];

export const mockStops: BusStop[] = [
  { id: 's1', name: 'Oshawa Centre Terminal', lat: 43.8975, lng: -78.8570, routes: ['401', '910'] },
  { id: 's2', name: 'Whitby Station', lat: 43.8679, lng: -78.9420, routes: ['910', '302'] },
  { id: 's3', name: 'Ajax Station', lat: 43.8484, lng: -79.0260, routes: ['910', '115'] },
  { id: 's4', name: 'Pickering Town Centre', lat: 43.8385, lng: -79.0870, routes: ['110', '115'] },
  { id: 's5', name: 'UOIT/Durham College', lat: 43.9456, lng: -78.8968, routes: ['401', '915'] },
  { id: 's6', name: 'Harmony Terminal', lat: 43.9070, lng: -78.8220, routes: ['401', '407'] },
  { id: 's7', name: 'Simcoe St & King St', lat: 43.8997, lng: -78.8658, routes: ['401', '302'] },
  { id: 's8', name: 'Taunton Rd & Thickson Rd', lat: 43.9180, lng: -78.8800, routes: ['407', '915'] },
  { id: 's9', name: 'Dundas St & Brock St', lat: 43.8930, lng: -78.8610, routes: ['302', '110'] },
  { id: 's10', name: 'Courtice Rd & Durham Hwy 2', lat: 43.8815, lng: -78.7900, routes: ['407'] },
];

export const mockBuses: BusPosition[] = [
  { id: 'b1', routeId: '401', lat: 43.9010, lng: -78.8600, heading: 45, speed: 35, delay: 0, tripId: 't1', label: '401' },
  { id: 'b2', routeId: '910', lat: 43.8750, lng: -78.9100, heading: 270, speed: 40, delay: 120, tripId: 't2', label: '910' },
  { id: 'b3', routeId: '302', lat: 43.8900, lng: -78.8700, heading: 180, speed: 25, delay: -30, tripId: 't3', label: '302' },
  { id: 'b4', routeId: '115', lat: 43.8500, lng: -79.0400, heading: 90, speed: 45, delay: 0, tripId: 't4', label: '115' },
  { id: 'b5', routeId: '407', lat: 43.9120, lng: -78.8400, heading: 315, speed: 30, delay: 300, tripId: 't5', label: '407' },
];

export const mockRouteResults: RouteResult[] = [
  {
    id: 'r1',
    routeName: 'Simcoe Express',
    routeNumber: '401',
    departureTime: '10:15 AM',
    arrivalTime: '10:48 AM',
    duration: '33 min',
    transfers: 0,
    status: 'on-time',
    stops: [
      { name: 'Oshawa Centre Terminal', time: '10:15 AM' },
      { name: 'Simcoe St & King St', time: '10:22 AM' },
      { name: 'UOIT/Durham College', time: '10:35 AM' },
      { name: 'Harmony Terminal', time: '10:48 AM' },
    ],
    polyline: [
      [43.8975, -78.8570],
      [43.8997, -78.8658],
      [43.9200, -78.8800],
      [43.9456, -78.8968],
      [43.9070, -78.8220],
    ],
  },
  {
    id: 'r2',
    routeName: 'Lakeshore Connection',
    routeNumber: '910',
    departureTime: '10:20 AM',
    arrivalTime: '11:05 AM',
    duration: '45 min',
    transfers: 1,
    status: 'delayed',
    delayMinutes: 3,
    stops: [
      { name: 'Oshawa Centre Terminal', time: '10:20 AM' },
      { name: 'Whitby Station', time: '10:35 AM' },
      { name: 'Ajax Station', time: '10:50 AM' },
      { name: 'Pickering Town Centre', time: '11:05 AM' },
    ],
    polyline: [
      [43.8975, -78.8570],
      [43.8679, -78.9420],
      [43.8484, -79.0260],
      [43.8385, -79.0870],
    ],
  },
  {
    id: 'r3',
    routeName: 'Highway 2 Local',
    routeNumber: '302',
    departureTime: '10:30 AM',
    arrivalTime: '11:10 AM',
    duration: '40 min',
    transfers: 0,
    status: 'on-time',
    stops: [
      { name: 'Dundas St & Brock St', time: '10:30 AM' },
      { name: 'Simcoe St & King St', time: '10:38 AM' },
      { name: 'Whitby Station', time: '10:55 AM' },
      { name: 'Courtice Rd & Durham Hwy 2', time: '11:10 AM' },
    ],
    polyline: [
      [43.8930, -78.8610],
      [43.8997, -78.8658],
      [43.8679, -78.9420],
      [43.8815, -78.7900],
    ],
  },
];
