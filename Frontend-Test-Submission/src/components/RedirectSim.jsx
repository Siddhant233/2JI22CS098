import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { log } from '../lib/logging';

const API_BASE = process.env.REACT_APP_BACKEND || 'http://localhost:4000';

export default function RedirectSim(){
  const { code } = useParams();
  const navigate = useNavigate();
  useEffect(()=>{
    (async ()=>{
      try{
        // Redirect by opening backend redirect route in new tab
        window.open(API_BASE + '/' + code, '_blank');
        await log('frontend','info','page',`Redirect triggered for ${code}`);
        navigate('/stats');
      }catch(e){ await log('frontend','error','page',`Redirect failed ${code}`); navigate('/'); }
    })();
  },[code,navigate]);
  return null;
}
