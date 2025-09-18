// auth.js - handles register + auth token retrieval for evaluation server
import axios from 'axios';

const API_BASE = process.env.EVAL_API_BASE || 'http://20.244.56.144/evaluation-service';
const CREDS_KEY = 'eval_creds_v1';
const TOKEN_KEY = 'eval_token_v1';

function storageGet(k){ try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch(e){ return null; } }
function storageSet(k,v){ try { localStorage.setItem(k, JSON.stringify(v)); } catch(e){} }

export async function registerIfNeeded() {
  const existing = storageGet(CREDS_KEY);
  if (existing && existing.clientID && existing.clientSecret) return existing;
  // read from env (Node) or window.__ENV__ (frontend) - we will try both
  const env = typeof process !== 'undefined' ? process.env : (typeof window !== 'undefined' ? window.__ENV__ || {} : {});
  const payload = {
    email: env.REACT_APP_EMAIL || env.VITE_EMAIL || env.EMAIL,
    name: env.REACT_APP_NAME || env.VITE_NAME || env.NAME,
    mobileNo: env.REACT_APP_MOBILE || env.VITE_MOBILENO || env.MOBILE,
    githubUsername: env.REACT_APP_GITHUB || env.VITE_GITHUBUSERNAME || env.GITHUB,
    rollNo: env.REACT_APP_ROLLNO || env.VITE_ROLLNO || env.ROLLNO,
    accessCode: env.REACT_APP_ACCESSCODE || env.VITE_ACCESSCODE || env.ACCESSCODE
  };
  try {
    const res = await axios.post(API_BASE + '/register', payload);
    if (res.data && res.data.clientID) {
      storageSet(CREDS_KEY, res.data);
      return res.data;
    }
  } catch (e) {
    // ignore, return null
  }
  return null;
}

export async function getAuthToken() {
  const cached = storageGet(TOKEN_KEY);
  if (cached && cached.access_token && new Date(cached.expires_at) > new Date()) return cached.access_token;
  const creds = storageGet(CREDS_KEY) || await registerIfNeeded();
  if (!creds) return null;
  const env = typeof process !== 'undefined' ? process.env : (typeof window !== 'undefined' ? window.__ENV__ || {} : {});
  const payload = {
    email: env.REACT_APP_EMAIL || env.VITE_EMAIL || env.EMAIL,
    name: env.REACT_APP_NAME || env.VITE_NAME || env.NAME,
    rollNo: env.REACT_APP_ROLLNO || env.VITE_ROLLNO || env.ROLLNO,
    accessCode: env.REACT_APP_ACCESSCODE || env.VITE_ACCESSCODE || env.ACCESSCODE,
    clientID: creds.clientID,
    clientSecret: creds.clientSecret
  };
  try {
    const res = await axios.post(API_BASE + '/auth', payload);
    const token = res.data['access token'] || res.data.access_token || res.data.token;
    const expires_in = res.data.expires_in || 3600;
    const obj = { access_token: token, expires_at: new Date(Date.now() + expires_in*1000).toISOString() };
    storageSet(TOKEN_KEY, obj);
    return token;
  } catch (e) {
    return null;
  }
}

export default { registerIfNeeded, getAuthToken };
