import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { SignIn } from './SignIn';
import * as apiModule from '../api';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const mod = await importOriginal<typeof import('react-router-dom')>();
  return { ...mod, useNavigate: () => mockNavigate };
});

beforeEach(() => {
  localStorage.clear();
  mockNavigate.mockReset();
});

describe('SignIn', () => {
  it('navigates organizer to /trip after sign-in with org code', async () => {
    vi.spyOn(apiModule.api, 'signIn').mockResolvedValue({
      memberId: 1, tripId: 1, isOrganizer: true,
    });
    render(<MemoryRouter><SignIn /></MemoryRouter>);
    fireEvent.change(screen.getByPlaceholderText('Your name'), { target: { value: 'Nga' } });
    fireEvent.change(screen.getByPlaceholderText('Phone or email'), { target: { value: '0901' } });
    fireEvent.change(screen.getByPlaceholderText('Organizer code (optional)'), { target: { value: 'secret' } });
    fireEvent.click(screen.getByText('Continue →'));
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/trip'));
  });

  it('navigates member to /me after sign-in without org code', async () => {
    vi.spyOn(apiModule.api, 'signIn').mockResolvedValue({
      memberId: 2, tripId: 1, isOrganizer: false,
    });
    render(<MemoryRouter><SignIn /></MemoryRouter>);
    fireEvent.change(screen.getByPlaceholderText('Your name'), { target: { value: 'An' } });
    fireEvent.change(screen.getByPlaceholderText('Phone or email'), { target: { value: '0902' } });
    fireEvent.click(screen.getByText('Continue →'));
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/me'));
  });
});
