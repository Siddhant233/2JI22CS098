import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Container } from '@mui/material';
import Shortener from './components/Shortener';
import StatsPage from './components/StatsPage';
import LogsPage from './components/LogsPage';
import RedirectSim from './components/RedirectSim';

export default function App(){
  return (
    <Router>
      <AppBar position="static">
        <Toolbar>
          <Typography sx={{flexGrow:1}}>URL Shortener Frontend</Typography>
          <Button color="inherit" component={Link} to="/">Shorten</Button>
          <Button color="inherit" component={Link} to="/stats">Stats</Button>
          <Button color="inherit" component={Link} to="/logs">Logs</Button>
        </Toolbar>
      </AppBar>
      <Container sx={{mt:3}}>
        <Routes>
          <Route path="/" element={<Shortener/>} />
          <Route path="/stats" element={<StatsPage/>} />
          <Route path="/logs" element={<LogsPage/>} />
          <Route path="/s/:code" element={<RedirectSim/>} />
        </Routes>
      </Container>
    </Router>
  );
}
