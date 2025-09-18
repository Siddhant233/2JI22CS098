import React, { useState, useEffect } from 'react';
import { Typography, Card, CardContent } from '@mui/material';
import axios from 'axios';
import { log } from '../lib/logging';

const API_BASE = process.env.REACT_APP_BACKEND || 'http://localhost:4000';

export default function StatsPage(){
  const [links, setLinks] = useState([]);

  useEffect(()=>{
    // load persisted IDs from localStorage (created list)
    const created = JSON.parse(localStorage.getItem('created_shortlinks_v1')||'[]');
    async function fetchAll(){
      const arr=[];
      for(const s of created){
        try{ const res = await axios.get(API_BASE + '/shorturls/' + s); arr.push(res.data); } catch(e){ await log('frontend','warn','component',`Failed to fetch stats for ${s}`); }
      }
      setLinks(arr);
    }
    fetchAll();
  },[]);

  return (
    <div>
      <Typography variant="h5">Statistics</Typography>
      {links.map((l,i)=>(
        <Card key={i} sx={{mt:2}}><CardContent>
          <Typography><b>Short:</b> http://localhost:4000/{l.code}</Typography>
          <Typography><b>Original:</b> {l.url}</Typography>
          <Typography><b>Created:</b> {l.createdAt}</Typography>
          <Typography><b>Expiry:</b> {l.expiry}</Typography>
          <Typography><b>Clicks:</b> {l.clicks}</Typography>
          <div><b>Click details:</b><ul>{l.clickDetails.map((c,idx)=>(<li key={idx}>{c.time} — {c.referrer||'direct'} — {c.ip||'ip:N/A'}</li>))}</ul></div>
        </CardContent></Card>
      ))}
    </div>
  );
}
