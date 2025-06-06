import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AssignmentForm from './components/AssignmentForm';
import AssignmentList from './components/AssignmentList';
import NoteForm from './components/NoteForm';
import NoteList from './components/NoteList';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />}>
          <Route index element={
            <>
              <AssignmentForm />
              <AssignmentList />
              <NoteForm />
              <NoteList />
            </>
          } />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;