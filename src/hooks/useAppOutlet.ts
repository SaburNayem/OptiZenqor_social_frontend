import { useOutletContext } from 'react-router-dom';
import { AppOutletContext } from '../types';

export function useAppOutlet() {
  return useOutletContext<AppOutletContext>();
}
