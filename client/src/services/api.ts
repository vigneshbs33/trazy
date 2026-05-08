import axios from 'axios';
import { RouteOption, MergePointResponse, Traveler } from '../types/travel';

const API_URL = import.meta.env.DEV ? 'http://localhost:3001/api' : '/api';

export const travelApi = {
  getRoutes: async (from: string, to: string, priority: string): Promise<{ routes: RouteOption[], insight: string }> => {
    const response = await axios.post(`${API_URL}/route`, { from, to, priority });
    return response.data;
  },
  
  getMergePoint: async (destination: string, travelers: Traveler[]): Promise<MergePointResponse> => {
    const response = await axios.post(`${API_URL}/merge`, { destination, travelers });
    return response.data;
  }
};
