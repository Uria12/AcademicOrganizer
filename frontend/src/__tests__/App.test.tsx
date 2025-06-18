import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from '../App';
import '@testing-library/jest-dom';

test('renders App component with no crash', () => {
  render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
 expect(screen.getByText(/add new assignment/i)).toBeInTheDocument();
});
