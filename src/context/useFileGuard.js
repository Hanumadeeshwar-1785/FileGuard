import { useContext } from 'react';
import { FileGuardContext } from './FileGuardContextInstance';

export function useFileGuard() {
  const context = useContext(FileGuardContext);
  if (!context) {
    throw new Error('useFileGuard must be used within a FileGuardProvider');
  }
  return context;
}
