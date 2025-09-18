import React, { useState } from 'react';
import { Grid, TextField, Button, Card, CardContent, Typography, Stack } from '@mui/material';
import axios from 'axios';
import { log } from '../lib/logging';

const API_BASE = process.env.REACT_APP_BACKEND || 'http://localhost:4000';

function createEmpty(){ return { url:'', validity:'', shortcode:'' }; }

export default function Shortener(){
  const [rows, setRows] = useState([createEmpty()]);
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);

  const addRow = ()=> { if(rows.length>=5) return; setRows([...rows, createEmpty()]); }
  const removeRow = (i)=> { setRows(rows.filter((_,idx)=>idx!==i)); }

  const handleChange = (i,key,val)=> { const nx = rows.slice(); nx[i][key]=val; setRows(nx); }

  const validate = (r)=>{
    try { new URL(r.url); } catch(e){ return 'Invalid URL'; }
    if (r.validity && (!/^-?\d+$/.test(String(r.validity)) || Number(r.validity)<=0)) return 'Validity must be positive integer'; 
    if (r.shortcode && !/^[a-zA-Z0-9]{3,30}$/.test(r.shortcode)) return 'Shortcode must be alphanumeric 3-30 chars';
    return null;
  }

  const handleSubmit = async ()=>{
    setError(null);
    const payloads = [];
    for(const r of rows){ const v=validate(r); if(v){ setError(v); await log('frontend','error','component',`Validation failed: ${v}`); return; } payloads.push({ url:r.url, validity: r.validity?Number(r.validity):30, shortcode: r.shortcode||undefined }); }
    try {
      const created=[];
      for(const p of payloads){
        const res = await axios.post(API_BASE + '/shorturls', p);
        created.push(res.data);
        await log('frontend','info','component',`Created shortlink ${res.data.shortLink}`);
      }
      setResults(created.concat(results));
      setRows([createEmpty()]);
    } catch(e){
      setError(e.response?.data?.error || e.message);
      await log('frontend','error','component',`Create failed: ${e.message}`);
    }
  }

  return (
    <div>
      <Typography variant="h5" gutterBottom>Shorten URLs (up to 5 at once)</Typography>
      <Stack spacing={2}>
        {rows.map((r,idx)=>(
          <Card key={idx}><CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}><TextField label="Long URL" fullWidth value={r.url} onChange={e=>handleChange(idx,'url',e.target.value)} /></Grid>
              <Grid item xs={6} md={3}><TextField label="Validity (minutes)" fullWidth value={r.validity} onChange={e=>handleChange(idx,'validity',e.target.value)} placeholder="30" /></Grid>
              <Grid item xs={6} md={3}><TextField label="Preferred shortcode" fullWidth value={r.shortcode} onChange={e=>handleChange(idx,'shortcode',e.target.value)} /></Grid>
            </Grid>
            <Stack direction="row" spacing={1} sx={{mt:2}}>
              <Button size="small" color="error" onClick={()=>removeRow(idx)} disabled={rows.length===1}>Remove</Button>
            </Stack>
          </CardContent></Card>
        ))}
        <Stack direction="row" spacing={2}>
          <Button onClick={addRow} disabled={rows.length>=5}>Add another</Button>
          <Button variant="contained" onClick={handleSubmit}>Shorten</Button>
        </Stack>
        {error && <Typography color="error">{error}</Typography>}
        <div>
          <Typography variant="h6">Recent created</Typography>
          {results.map((r,i)=>(<div key={i}><a href={r.shortLink}>{r.shortLink}</a> — Expires: {new Date(r.expiry).toLocaleString()}</div>))}
        </div>
      </Stack>
    </div>
  );
}
