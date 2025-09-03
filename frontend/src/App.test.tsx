import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

// ВОТ ЭТА СТРОКА РЕШАЕТ ПРОБЛЕМУ
jest.mock('react-konva');

test('renders learn react link', () => {
  render(<App />);
  // Ты можешь поменять этот тест, чтобы он искал что-то из твоего приложения,
  // например, заголовок "Слайды"
  const slidesHeader = screen.getByText(/Слайды/i);
  expect(slidesHeader).toBeInTheDocument();
});