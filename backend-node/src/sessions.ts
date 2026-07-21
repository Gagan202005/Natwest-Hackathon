// In-memory session store — maps session UUIDs to their database connections, cached data, and chat history.
import { Session } from './types';

export const sessions = new Map<string, Session>();
