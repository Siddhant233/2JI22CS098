import React, { useState, useEffect } from 'react';
import { Typography, Card, CardContent } from '@mui/material';
import { getLocalLogs } from '../lib/logging';

export default function LogsPage(){
  const [logs, setLogs] = useState([]);
  useEffect(()=>{ setLogs(getLocalLogs(200)); }, []);
  return (
    <div>
      <Typography variant="h5">Logs</Typography>
      {logs.map((l,i)=>(<Card key={i} sx={{mt:1}}><CardContent><div>{l.time} [{l.level}] {l.stack}/{l.package} — {l.message}</div></CardContent></Card>))}
    </div>
  );
}
