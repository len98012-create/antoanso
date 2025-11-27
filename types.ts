import React from 'react';

export enum Role {
  USER = 'user',
  MODEL = 'model'
}

export interface Message {
  id: string;
  role: Role;
  text: string;
  timestamp: Date;
  isError?: boolean;
}

export interface QuickPrompt {
  id: string;
  label: string;
  prompt: string;
  icon: React.ReactNode;
}