/**
 * Database & Backend API Adapter
 * 
 * You can connect this to:
 * 1. Supabase (PostgreSQL)
 * 2. Firebase (Firestore / Realtime Database)
 * 3. Custom Node.js / Express / Django / FastAPI REST API
 * 4. Local / Mock Data fallback (currently active)
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || null;
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || null;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || null;

export const DB_CONFIG = {
  isCloudConnected: Boolean(API_BASE_URL || (SUPABASE_URL && SUPABASE_ANON_KEY)),
  type: API_BASE_URL ? 'REST_API' : (SUPABASE_URL ? 'SUPABASE' : 'LOCAL_STORAGE')
};

/**
 * 1. Fetch Students from Database
 */
export async function fetchStudentsFromDB() {
  if (!DB_CONFIG.isCloudConnected) return null;

  try {
    if (API_BASE_URL) {
      const res = await fetch(`${API_BASE_URL}/students`);
      return await res.json();
    }
  } catch (err) {
    console.error('Failed to fetch students from DB:', err);
  }
  return null;
}

/**
 * 2. Record Attendance to Database
 */
export async function recordAttendanceToDB(attendanceRecord) {
  if (!DB_CONFIG.isCloudConnected) return null;

  try {
    if (API_BASE_URL) {
      const res = await fetch(`${API_BASE_URL}/attendance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(attendanceRecord)
      });
      return await res.json();
    }
  } catch (err) {
    console.error('Failed to save attendance to DB:', err);
  }
  return null;
}

/**
 * 3. Start Live Attendance Session in Database
 */
export async function createSessionInDB(sessionData) {
  if (!DB_CONFIG.isCloudConnected) return null;

  try {
    if (API_BASE_URL) {
      const res = await fetch(`${API_BASE_URL}/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sessionData)
      });
      return await res.json();
    }
  } catch (err) {
    console.error('Failed to create session in DB:', err);
  }
  return null;
}
