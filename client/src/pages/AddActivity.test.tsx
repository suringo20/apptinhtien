import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AddActivity } from './AddActivity';
import * as apiModule from '../api';
import type { Trip } from '../types';

const mockTrip: Trip = {
  id: 1, code: 'ABC123', name: 'T', start_date: null, end_date: null, currency: '₫',
  members: [
    { id: 1, name: 'Nga', contact: 'nga', is_organizer: 1 },
    { id: 2, name: 'An', contact: 'an', is_organizer: 0 },
  ],
};

beforeEach(() => {
  vi.spyOn(apiModule.api, 'getTrip').mockResolvedValue(mockTrip);
  vi.spyOn(apiModule.api, 'createActivity').mockResolvedValue({ id: 99 });
});

describe('AddActivity', () => {
  it('shows live split calculation when chips are toggled', async () => {
    render(
      <MemoryRouter initialEntries={['/trip/activity/new']}>
        <Routes><Route path="/trip/activity/new" element={<AddActivity />} /></Routes>
      </MemoryRouter>
    );

    // Wait for members to load (name appears once in "Who joined" and once in "Who paid")
    await screen.findAllByText('Nga');

    // Enter amount
    fireEvent.change(screen.getByPlaceholderText('0'), { target: { value: '1200000' } });

    // Both selected by default → split 2 ways = 600,000 each
    expect(await screen.findByText(/600,000/)).toBeInTheDocument();

    // Deselect An in the "Who joined" chips (first occurrence) → split 1 way = 1,200,000
    fireEvent.click(screen.getAllByText('An')[0]);
    expect(screen.getByText(/1,200,000 ₫ each/)).toBeInTheDocument();
  });
});
