import client from './client';
import { HealthResponse } from '../types/api';

export const getHealth = () => client.get<HealthResponse>('/health');
