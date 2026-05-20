import { useState, useCallback } from 'react';

export function useDialer() {
  const [isOpen, setIsOpen] = useState(false);
  const [dialInput, setDialInput] = useState('');
  const [contactName, setContactName] = useState('Unknown Destination');

  const openDialer = useCallback(() => setIsOpen(true), []);
  const closeDialer = useCallback(() => setIsOpen(false), []);
  const toggleDialer = useCallback(() => setIsOpen((prev) => !prev), []);

  const dialPadKeyPress = useCallback((digit: string) => {
    setDialInput((prev) => prev + digit);
  }, []);

  const backspaceInput = useCallback(() => {
    setDialInput((prev) => prev.slice(0, -1));
  }, []);

  const clearDialInput = useCallback(() => {
    setDialInput('');
    setContactName('Unknown Destination');
  }, []);

  const setDialTarget = useCallback((phoneNumber: string, name: string) => {
    setDialInput(phoneNumber);
    setContactName(name);
    setIsOpen(true);
  }, []);

  return {
    isOpen,
    dialInput,
    contactName,
    setDialInput,
    setContactName,
    openDialer,
    closeDialer,
    toggleDialer,
    dialPadKeyPress,
    backspaceInput,
    clearDialInput,
    setDialTarget
  };
}
