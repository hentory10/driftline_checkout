'use client';

import React, { useEffect, useState } from 'react';
import { content } from '../content';

export default function DatePicker({
  packageId,
  people,
  value,
  onChange,
}: {
  packageId: string;
  people: number;
  value: string;
  onChange: (date: string) => void;
}) {
  const [dates, setDates] = useState<{ available: string[]; soldOut: string[] }>({ available: [], soldOut: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/availability?packageId=${packageId}&people=${people}`)
      .then(res => res.json())
      .then(setDates)
      .finally(() => setLoading(false));
  }, [packageId, people]);

  return (
    <div>
      <label htmlFor="arrivalDate" className="block font-semibold mb-1">{content.datePicker.label}</label>
      {loading ? (
        <div className="text-gray-500">{content.datePicker.loading}</div>
      ) : (
        <select
          id="arrivalDate"
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          className="w-full border rounded px-3 py-2"
          aria-required="true"
        >
          <option value="">{content.datePicker.placeholder}</option>
          {dates.available.map(date => (
            <option key={date} value={date}>{new Date(date).toLocaleDateString()}</option>
          ))}
          {dates.soldOut.map(date => (
            <option key={date} value={date} disabled>
              {new Date(date).toLocaleDateString()} ({content.datePicker.soldOut})
            </option>
          ))}
        </select>
      )}
    </div>
  );
} 