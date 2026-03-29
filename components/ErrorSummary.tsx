import React from 'react';
import { content } from '../content';

export default function ErrorSummary({ message }: { message: string }) {
  if (!message) return null;
  return (
    <div
      className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4"
      role="alert"
      aria-live="assertive"
      tabIndex={-1}
    >
      <span className="font-semibold">{content.errorSummary.label}</span> {message}
    </div>
  );
} 