import React from 'react';
import { fireEvent, getByLabelText, render, screen } from '@testing-library/react';
import LoginPage from './Login';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import { LoadingProvider } from '../../context/LoadingContext';
import { DataProvider } from '../../context/DataProvider';
import AuthProvider from '../../context/userAutthContext';
import FilterProvider from '../../context/TableFilterContext';

describe('make sure users are able to login and are taken to the dashboard', () => {
    render(
        <LoadingProvider>

            <DataProvider>
                <FilterProvider>
                    <MemoryRouter>
                        <LoginPage />
                    </MemoryRouter>
                </FilterProvider>

            </DataProvider>

        </LoadingProvider>);
    // jest.mock('../../assets/luncho.png', () => 'test-stub-file')
    fireEvent.change(screen.getByLabelText('EMAIL'), { target: { value: 'user' } });
    fireEvent.change(screen.getByLabelText('PASSWORD'), { target: { value: 'password' } });
    fireEvent.click(screen.getByText('LOGIN'));
    expect(screen.getByText(/welcome/i)).toBeInTheDocument();
})