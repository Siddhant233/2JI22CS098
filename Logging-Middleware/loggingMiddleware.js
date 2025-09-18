// loggingMiddleware.js - reusable logging package for frontend/backend
// Exports: log(stack, level, pkg, message)
// Validates inputs and attempts to POST to evaluation server /logs using auth helper.
// Falls back to local persistence if remote call fails.

import axios from 'axios';
import { getAuthToken, registerIfNeeded } from './auth.js';

const API_BASE = process.env.EVAL_API_BASE || 'http://20.244.56.144/evaluation-service';
const LS_KEY = 'eval_logs_v1';

const allowed = {
  stack: ['backend','frontend'],
  level: ['debug','info','warn','error','fatal'],
  package: ['cache','controller','cron job','db','domain','handler','repository','route','service','api','component','hook','page','state','style','auth','config','middleware','utils']
};

function persistLocal(entry) {
  try {
    const cur = JSON.parse(localStorageSafeGet(LS_KEY) || '[]');
    cur.unshift(entry);
    localStorageSafeSet(LS_KEY, JSON.stringify(cur.slice(0,500)));
  } catch (e) { /* ignore */ }
}

function localStorageSafeGet(k) {
  try { return localStorage.getItem(k); } catch (e) { return null; }
}
function localStorageSafeSet(k,v) {
  try { localStorage.setItem(k,v); } catch (e) { /* ignore */ }
}

function validate(stack, level, pkg) {
  if (!allowed.stack.includes(stack)) throw new Error('invalid stack');
  if (!allowed.level.includes(level)) throw new Error('invalid level');
  if (!allowed.package.includes(pkg)) throw new Error('invalid package');
}

export async function log(stack, level, pkg, message) {
  stack = String(stack).toLowerCase();
  level = String(level).toLowerCase();
  pkg = String(pkg).toLowerCase();
  message = String(message || '');
  const entry = { time: new Date().toISOString(), stack, level, package: pkg, message };

  try {
    validate(stack, level, pkg);
  } catch (e) {
    // persist locally when validation fails
    entry.note = 'validation_failed';
    persistLocal(entry);
    return entry;
  }

  // try remote
  try {
    await registerIfNeeded();
    const token = await getAuthToken();
    const res = await axios.post(API_BASE + '/logs', { stack, level, package: pkg, message }, { headers: { Authorization: token ? ('Bearer ' + token) : undefined } });
    entry.remote = res.data;
    persistLocal(entry);
    return entry;
  } catch (err) {
    entry.error = err?.message || String(err);
    persistLocal(entry);
    return entry;
  }
}

export function getLocalLogs(limit=200) {
  try {
    const arr = JSON.parse(localStorageSafeGet(LS_KEY) || '[]');
    return arr.slice(0, limit);
  } catch (e) { return []; }
}

export default { log, getLocalLogs };
