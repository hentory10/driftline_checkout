"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import BookingSummary from "../../../components/BookingSummary";    
import { useStore } from "../../../store/booking";
import { useRouter } from "next/navigation";

const oubahaRooms = [
  {
    id: "1",
    name: "Tamazirt room - Oubaha",
    price: 140,
    img: "/images/room1.jpg",
    available: true,
    booked: false,
  },
  {
    id: "2",
    name: "Triple room - Oubaha",
    price: 0,
    img: "/images/room2.jpg",
    available: true,
    booked: false,
  },
  {
    id: "3",
    name: "Double room - Oubaha",
    price: 0,
    img: "/images/room3.jpg",
    available: true,
    booked: false,
  },
  {
    id: "4",
    name: "Twin room - Oubaha",
    price: 0,
    img: "/images/room4.jpg",
    available: true,
    booked: false,
  },
];

const bigdiRooms = [
  {
    id: "6",
    name: "Ayour room - Bigdi",
    price: 0,
    img: "/images/ayourroom.webp",
    available: true,
    booked: false,
  },
  {
    id: "7",
    name: "Tafokt room - Bigdi",
    price: 70,
    img: "/images/room1.jpg",
    available: true,
    booked: false,
  },
  {
    id: "9",
    name: "Akal room - Bigdi",
    price: 140,
    img: "/images/room1.jpg",
    available: true,
    booked: false,
  },
  {
    id: "10",
    name: "Amlal room - Bigdi",
    price: 140,
    img: "/images/room1.jpg",
    available: true,
    booked: false,
  },
];

// Image arrays for each room (carousel images)
const roomImages: Record<string, string[]> = {
  // Tamazirt room - Oubaha (ID: 1)
  "1": ["/images/room1.jpg", "/images/room2.jpg", "/images/room3.jpg", "/images/room4.jpg", "/images/room5.jpg"],
  // Triple room - Oubaha (ID: 2)
  "2": ["/images/room2.jpg", "/images/room3.jpg", "/images/room4.jpg", "/images/room5.jpg", "/images/room6.jpg"],
  // Double room - Oubaha (ID: 3)
  "3": ["/images/room3.jpg", "/images/room4.jpg", "/images/room5.jpg", "/images/room6.jpg", "/images/room1.jpg"],
  // Twin room - Oubaha (ID: 4)
  "4": ["/images/room4.jpg", "/images/room5.jpg", "/images/room6.jpg", "/images/room1.jpg", "/images/room2.jpg"],
  // Ayour room - Bigdi (ID: 6)
  "6": ["/images/ayourroom.webp", "/images/room1.jpg", "/images/room2.jpg", "/images/room3.jpg", "/images/room4.jpg"],
  // Tafokt room - Bigdi (ID: 7)
  "7": ["/images/room1.jpg", "/images/room2.jpg", "/images/room3.jpg", "/images/room4.jpg", "/images/room5.jpg"],
  // Akal room - Bigdi (ID: 9)
  "9": ["/images/akalroom.webp", "/images/room1.jpg", "/images/room2.jpg", "/images/room3.jpg", "/images/room4.jpg"],
  // Amlal room - Bigdi (ID: 10)
  "10": ["/images/room2.jpg", "/images/room3.jpg", "/images/room4.jpg", "/images/room5.jpg", "/images/room6.jpg"],
};

export default function RoomStep() {
  const { selectedPackage, people: maxPeople, arrivalDate, roomAssignments, setRoomAssignments } = useStore();
  const router = useRouter();
  
  // State for expanded room and carousel
  const [expandedRoomId, setExpandedRoomId] = useState<string | null>(null);
  const [carouselIndices, setCarouselIndices] = useState<Record<string, number>>({});
  const [roomDescriptions, setRoomDescriptions] = useState<Record<string, string>>({});
  const [loadingDescriptions, setLoadingDescriptions] = useState<Record<string, boolean>>({});
  
  // Suppress AbortError from being caught by React error boundary
  // This is necessary because React Strict Mode in development can catch promise rejections
  // before our catch handlers can process them
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      // Suppress AbortError - it's expected behavior when requests are cancelled
      const error = event.reason;
      if (error && (
        error.name === 'AbortError' ||
        (typeof error === 'object' && 'name' in error && error.name === 'AbortError') ||
        (error instanceof Error && error.message && error.message.includes('aborted')) ||
        (typeof error === 'string' && error.includes('aborted'))
      )) {
        // Prevent the error from being logged as an unhandled rejection
        event.preventDefault();
        event.stopPropagation();
      }
    };
    
    // Use capture phase to catch errors before they propagate
    window.addEventListener('unhandledrejection', handleUnhandledRejection, true);
    
    // Also handle errors at the window level
    const handleError = (event: ErrorEvent) => {
      if (event.error && (
        event.error.name === 'AbortError' ||
        (event.error.message && event.error.message.includes('aborted'))
      )) {
        event.preventDefault();
        event.stopPropagation();
      }
    };
    
    window.addEventListener('error', handleError, true);
    
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection, true);
      window.removeEventListener('error', handleError, true);
    };
  }, []);
  const [tripleRoomAvailability, setTripleRoomAvailability] = useState<{
    bookedBeds: number;
    availableBeds: number;
    isFullyBooked: boolean;
  } | null>(null);
  const [twinRoomAvailability, setTwinRoomAvailability] = useState<{
    bookedBeds: number;
    availableBeds: number;
    isFullyBooked: boolean;
  } | null>(null);
  const [tamazirtRoomAvailability, setTamazirtRoomAvailability] = useState<{
    bookedBeds: number;
    availableBeds: number;
    isFullyBooked: boolean;
  } | null>(null);
  const [doubleRoomAvailability, setDoubleRoomAvailability] = useState<{
    bookedBeds: number;
    availableBeds: number;
    isFullyBooked: boolean;
  } | null>(null);
  const [tafoktRoomAvailability, setTafoktRoomAvailability] = useState<{
    bookedBeds: number;
    availableBeds: number;
    isFullyBooked: boolean;
  } | null>(null);
  const [ayourRoomAvailability, setAyourRoomAvailability] = useState<{
    bookedBeds: number;
    availableBeds: number;
    isFullyBooked: boolean;
  } | null>(null);
  const [akalRoomAvailability, setAkalRoomAvailability] = useState<{
    bookedBeds: number;
    availableBeds: number;
    isFullyBooked: boolean;
  } | null>(null);
  const [amlalRoomAvailability, setAmlalRoomAvailability] = useState<{
    bookedBeds: number;
    availableBeds: number;
    isFullyBooked: boolean;
  } | null>(null);
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [loadingTwinAvailability, setLoadingTwinAvailability] = useState(false);
  const [loadingTamazirtAvailability, setLoadingTamazirtAvailability] = useState(false);
  const [loadingDoubleAvailability, setLoadingDoubleAvailability] = useState(false);
  const [loadingTafoktAvailability, setLoadingTafoktAvailability] = useState(false);
  const [loadingAyourAvailability, setLoadingAyourAvailability] = useState(false);
  const [loadingAkalAvailability, setLoadingAkalAvailability] = useState(false);
  const [loadingAmlalAvailability, setLoadingAmlalAvailability] = useState(false);
  const fetchRequestRef = useRef<string | null>(null);
  const fetchTwinRequestRef = useRef<string | null>(null);
  const fetchTamazirtRequestRef = useRef<string | null>(null);
  const fetchDoubleRequestRef = useRef<string | null>(null);
  const fetchTafoktRequestRef = useRef<string | null>(null);
  const fetchAyourRequestRef = useRef<string | null>(null);
  const fetchAkalRequestRef = useRef<string | null>(null);
  const fetchAmlalRequestRef = useRef<string | null>(null);

  // Function to fetch room description from database
  const fetchRoomDescription = async (roomId: string) => {
    if (roomDescriptions[roomId] || loadingDescriptions[roomId]) {
      return; // Already fetched or currently loading
    }

    setLoadingDescriptions(prev => ({ ...prev, [roomId]: true }));
    
    try {
      const response = await fetch(`/api/room-details?roomId=${roomId}`);
      if (response.ok) {
        const data = await response.json();
        setRoomDescriptions(prev => ({ ...prev, [roomId]: data.description || '' }));
      }
    } catch (error) {
      console.error(`Error fetching room description for ${roomId}:`, error);
    } finally {
      setLoadingDescriptions(prev => ({ ...prev, [roomId]: false }));
    }
  };

  // Function to toggle room expansion
  const toggleRoomExpansion = (roomId: string) => {
    console.log('Toggle room expansion clicked for room:', roomId, 'Current expanded:', expandedRoomId);
    if (expandedRoomId === roomId) {
      // Collapse current room
      setExpandedRoomId(null);
      console.log('Collapsing room:', roomId);
    } else {
      // Expand new room (collapses previous)
      setExpandedRoomId(roomId);
      console.log('Expanding room:', roomId);
      // Initialize carousel index if not set
      if (carouselIndices[roomId] === undefined) {
        setCarouselIndices(prev => ({ ...prev, [roomId]: 0 }));
      }
      // Fetch room description if not already loaded
      fetchRoomDescription(roomId);
    }
  };

  // Function to navigate carousel
  const navigateCarousel = (roomId: string, direction: 'prev' | 'next') => {
    const images = roomImages[roomId] || [];
    if (images.length === 0) return;

    setCarouselIndices(prev => {
      const currentIndex = prev[roomId] || 0;
      let newIndex: number;
      
      if (direction === 'next') {
        newIndex = (currentIndex + 1) % images.length;
      } else {
        newIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1;
      }
      
      return { ...prev, [roomId]: newIndex };
    });
  };

  // Handle Escape key to close modal and prevent body scroll when modal is open
  useEffect(() => {
    if (expandedRoomId) {
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
      
      // Handle Escape key
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setExpandedRoomId(null);
        }
      };
      
      window.addEventListener('keydown', handleEscape);
      
      return () => {
        document.body.style.overflow = 'unset';
        window.removeEventListener('keydown', handleEscape);
      };
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [expandedRoomId]);

  // Debug: Log component render and arrivalDate
  console.log('🚀 RoomStep component rendered. arrivalDate:', arrivalDate);
  console.log('🚀 Store state:', { arrivalDate, maxPeople, selectedPackage: selectedPackage?.name });

  // Fetch bed availability for Triple room (id: "2")
  useEffect(() => {
    if (!arrivalDate) {
      console.log('No arrivalDate, clearing availability');
      setTripleRoomAvailability(null);
      setLoadingAvailability(false);
      fetchRequestRef.current = null;
      return;
    }

    // Ensure arrivalDate is in YYYY-MM-DD format
    const dateParam = arrivalDate.includes('T') 
      ? arrivalDate.split('T')[0] 
      : arrivalDate;
    
    // Create a unique request ID for this fetch
    const requestId = `${dateParam}-triple-${Date.now()}`;
    fetchRequestRef.current = requestId;
    
    console.log('🔄 Fetching Triple room availability for date:', dateParam, 'Request ID:', requestId);
    
    // Abort controller to cancel previous requests
    const abortController = new AbortController();
    
    // Set loading state immediately
    setLoadingAvailability(true);
    
    const fetchTripleRoomAvailability = async () => {
      try {
        const timeoutId = setTimeout(() => abortController.abort(), 10000); // 10 second timeout
        
        const response = await fetch(
          `/api/room-availability?roomId=2&arrivalDate=${dateParam}`,
          { signal: abortController.signal }
        );
        
        clearTimeout(timeoutId);
        
        // Check if this is still the current request (prevent stale responses)
        if (fetchRequestRef.current !== requestId) {
          console.log('⚠️ Ignoring stale response for request:', requestId);
          return;
        }
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ Failed to fetch Triple room availability:', response.status, errorText);
          // On error, assume unavailable for safety
          if (fetchRequestRef.current === requestId) {
            setTripleRoomAvailability({
              bookedBeds: 3,
              availableBeds: 0,
              isFullyBooked: true,
            });
            setLoadingAvailability(false);
          }
          return;
        }
        
        const data = await response.json();
        console.log('📦 Triple room availability data received for request:', requestId, data);
        
        // Double-check this is still the current request before updating state
        if (fetchRequestRef.current !== requestId) {
          console.log('⚠️ Ignoring stale response data for request:', requestId);
          return;
        }
        
        const availability = {
          bookedBeds: data.bookedBeds || 0,
          availableBeds: data.availableBeds ?? 3,
          isFullyBooked: data.isFullyBooked === true,
        };
        
        console.log('✅ Setting Triple room availability for request:', requestId, availability);
        
        // Update both states together to prevent flickering
        setTripleRoomAvailability(availability);
        setLoadingAvailability(false);
        
      } catch (error) {
        // Check if this is still the current request
        if (fetchRequestRef.current !== requestId) {
          console.log('⚠️ Ignoring error for stale request:', requestId);
          return;
        }
        
        if (error instanceof Error && error.name === 'AbortError') {
          console.log('⚠️ Request aborted for:', requestId);
          // Don't update state if request was aborted (new request is in progress)
          return;
        } else {
          console.error('❌ Error fetching Triple room availability:', error);
        }
        
        // On error, assume unavailable for safety
        if (fetchRequestRef.current === requestId) {
          setTripleRoomAvailability({
            bookedBeds: 3,
            availableBeds: 0,
            isFullyBooked: true,
          });
          setLoadingAvailability(false);
        }
      }
    };

    // Track request completion with a ref so cleanup can access it
    const requestCompletedRef = { current: false };
    
    // Call immediately and ensure promise rejection is always handled
    const promise = fetchTripleRoomAvailability()
      .then(() => {
        requestCompletedRef.current = true;
      })
      .catch((error) => {
        requestCompletedRef.current = true;
        // Silently swallow all errors - they're handled in the function
        // This prevents React error boundary from catching unhandled rejections
      });
    
    // Store promise in a way that cleanup can access it if needed
    // (though we don't actually need to access it, just ensure it has handlers)
    
    // Cleanup: cancel the request if component unmounts or arrivalDate changes
    return () => {
      // Only cleanup if this is still the current request
      if (fetchRequestRef.current !== requestId) {
        return;
      }
      
      // Only abort if request hasn't completed and signal isn't already aborted
      // This prevents aborting completed requests which would cause unnecessary rejections
      if (!requestCompletedRef.current && !abortController.signal.aborted) {
        // Abort the request
        // The promise rejection will be caught by the .catch() handler above
        // We use a try-catch just to be extra safe, though abort() itself doesn't throw
        try {
          abortController.abort();
        } catch (e) {
          // abort() shouldn't throw, but just in case
        }
        
        // Ensure the promise rejection is handled immediately to prevent React error boundary from catching it
        // The promise already has a catch handler, but we can't access it here
        // Instead, we rely on the fact that the catch handler is already attached above
      }
      // Don't clear fetchRequestRef here - let the new request set it
    };
  }, [arrivalDate]);

  // Fetch bed availability for Twin room (id: "4")
  useEffect(() => {
    if (!arrivalDate) {
      console.log('No arrivalDate, clearing Twin room availability');
      setTwinRoomAvailability(null);
      setLoadingTwinAvailability(false);
      fetchTwinRequestRef.current = null;
      return;
    }

    // Ensure arrivalDate is in YYYY-MM-DD format
    const dateParam = arrivalDate.includes('T') 
      ? arrivalDate.split('T')[0] 
      : arrivalDate;
    
    // Create a unique request ID for this fetch
    const requestId = `${dateParam}-twin-${Date.now()}`;
    fetchTwinRequestRef.current = requestId;
    
    console.log('🔄 Fetching Twin room availability for date:', dateParam, 'Request ID:', requestId);
    
    // Abort controller to cancel previous requests
    const abortController = new AbortController();
    
    // Set loading state immediately
    setLoadingTwinAvailability(true);
    
    const fetchTwinRoomAvailability = async () => {
      try {
        const timeoutId = setTimeout(() => abortController.abort(), 10000); // 10 second timeout
        
        const response = await fetch(
          `/api/room-availability?roomId=4&arrivalDate=${dateParam}`,
          { signal: abortController.signal }
        );
        
        clearTimeout(timeoutId);
        
        // Check if this is still the current request (prevent stale responses)
        if (fetchTwinRequestRef.current !== requestId) {
          console.log('⚠️ Ignoring stale response for Twin room request:', requestId);
          return;
        }
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ Failed to fetch Twin room availability:', response.status, errorText);
          // On error, assume unavailable for safety
          if (fetchTwinRequestRef.current === requestId) {
            setTwinRoomAvailability({
              bookedBeds: 2,
              availableBeds: 0,
              isFullyBooked: true,
            });
            setLoadingTwinAvailability(false);
          }
          return;
        }
        
        const data = await response.json();
        console.log('📦 Twin room availability data received for request:', requestId, data);
        
        // Double-check this is still the current request before updating state
        if (fetchTwinRequestRef.current !== requestId) {
          console.log('⚠️ Ignoring stale response data for Twin room request:', requestId);
          return;
        }
        
        const availability = {
          bookedBeds: data.bookedBeds || 0,
          availableBeds: data.availableBeds ?? 2,
          isFullyBooked: data.isFullyBooked === true,
        };
        
        console.log('✅ Setting Twin room availability for request:', requestId, availability);
        
        // Update both states together to prevent flickering
        setTwinRoomAvailability(availability);
        setLoadingTwinAvailability(false);
        
      } catch (error) {
        // Check if this is still the current request
        if (fetchTwinRequestRef.current !== requestId) {
          console.log('⚠️ Ignoring error for stale Twin room request:', requestId);
          return;
        }
        
        if (error instanceof Error && error.name === 'AbortError') {
          console.log('⚠️ Twin room request aborted for:', requestId);
          // Don't update state if request was aborted (new request is in progress)
          return;
        } else {
          console.error('❌ Error fetching Twin room availability:', error);
        }
        
        // On error, assume unavailable for safety
        if (fetchTwinRequestRef.current === requestId) {
          setTwinRoomAvailability({
            bookedBeds: 2,
            availableBeds: 0,
            isFullyBooked: true,
          });
          setLoadingTwinAvailability(false);
        }
      }
    };

    // Track request completion with a ref so cleanup can access it
    const requestCompletedRef = { current: false };
    
    // Call immediately and ensure promise rejection is always handled
    const promise = fetchTwinRoomAvailability()
      .then(() => {
        requestCompletedRef.current = true;
      })
      .catch((error) => {
        requestCompletedRef.current = true;
        // Silently swallow all errors - they're handled in the function
        // This prevents React error boundary from catching unhandled rejections
      });
    
    // Cleanup: cancel the request if component unmounts or arrivalDate changes
    return () => {
      // Only cleanup if this is still the current request
      if (fetchTwinRequestRef.current !== requestId) {
        return;
      }
      
      // Only abort if request hasn't completed and signal isn't already aborted
      // This prevents aborting completed requests which would cause unnecessary rejections
      if (!requestCompletedRef.current && !abortController.signal.aborted) {
        // Abort the request
        // The promise rejection will be caught by the .catch() handler above
        try {
          abortController.abort();
        } catch (e) {
          // abort() shouldn't throw, but just in case
        }
      }
      // Don't clear fetchTwinRequestRef here - let the new request set it
    };
  }, [arrivalDate]);

  // Fetch bed availability for Ayour room - Bigdi (id: "6") - 2 beds (same as Twin room)
  useEffect(() => {
    if (!arrivalDate) {
      console.log('No arrivalDate, clearing Ayour room availability');
      setAyourRoomAvailability(null);
      setLoadingAyourAvailability(false);
      fetchAyourRequestRef.current = null;
      return;
    }

    const dateParam = arrivalDate.includes('T') 
      ? arrivalDate.split('T')[0] 
      : arrivalDate;
    
    const requestId = `${dateParam}-ayour-${Date.now()}`;
    fetchAyourRequestRef.current = requestId;
    
    console.log('🔄 Fetching Ayour room availability for date:', dateParam, 'Request ID:', requestId);
    
    const abortController = new AbortController();
    setLoadingAyourAvailability(true);
    
    const fetchAyourRoomAvailability = async () => {
      try {
        const timeoutId = setTimeout(() => abortController.abort(), 10000);
        
        const response = await fetch(
          `/api/room-availability?roomId=6&arrivalDate=${dateParam}`,
          { signal: abortController.signal }
        );
        
        clearTimeout(timeoutId);
        
        if (fetchAyourRequestRef.current !== requestId) {
          console.log('⚠️ Ignoring stale response for Ayour room request:', requestId);
          return;
        }
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ Failed to fetch Ayour room availability:', response.status, errorText);
          if (fetchAyourRequestRef.current === requestId) {
            setAyourRoomAvailability({
              bookedBeds: 2,
              availableBeds: 0,
              isFullyBooked: true,
            });
            setLoadingAyourAvailability(false);
          }
          return;
        }
        
        const data = await response.json();
        console.log('📦 Ayour room availability data received for request:', requestId, data);
        
        if (fetchAyourRequestRef.current !== requestId) {
          console.log('⚠️ Ignoring stale response data for Ayour room request:', requestId);
          return;
        }
        
        const availability = {
          bookedBeds: data.bookedBeds || 0,
          availableBeds: data.availableBeds ?? 2,
          isFullyBooked: data.isFullyBooked === true,
        };
        
        console.log('✅ Setting Ayour room availability for request:', requestId, availability);
        setAyourRoomAvailability(availability);
        setLoadingAyourAvailability(false);
        
      } catch (error) {
        if (fetchAyourRequestRef.current !== requestId) {
          console.log('⚠️ Ignoring error for stale Ayour room request:', requestId);
          return;
        }
        
        if (error instanceof Error && error.name === 'AbortError') {
          console.log('⚠️ Ayour room request aborted for:', requestId);
          return;
        } else {
          console.error('❌ Error fetching Ayour room availability:', error);
        }
        
        if (fetchAyourRequestRef.current === requestId) {
          setAyourRoomAvailability({
            bookedBeds: 2,
            availableBeds: 0,
            isFullyBooked: true,
          });
          setLoadingAyourAvailability(false);
        }
      }
    };

    // Track request completion with a ref so cleanup can access it
    const requestCompletedRef = { current: false };
    
    // Call immediately and ensure promise rejection is always handled
    const promise = fetchAyourRoomAvailability()
      .then(() => {
        requestCompletedRef.current = true;
      })
      .catch((error) => {
        requestCompletedRef.current = true;
        // Silently swallow all errors - they're handled in the function
        // This prevents React error boundary from catching unhandled rejections
      });
    
    return () => {
      // Only cleanup if this is still the current request
      if (fetchAyourRequestRef.current !== requestId) {
        return;
      }
      
      // Only abort if request hasn't completed and signal isn't already aborted
      // This prevents aborting completed requests which would cause unnecessary rejections
      if (!requestCompletedRef.current && !abortController.signal.aborted) {
        // Abort the request
        // The promise rejection will be caught by the .catch() handler above
        try {
          abortController.abort();
        } catch (e) {
          // abort() shouldn't throw, but just in case
        }
      }
    };
  }, [arrivalDate]);

  // Fetch bed availability for Tamazirt room - Oubaha (id: "1") - 1 bed
  useEffect(() => {
    if (!arrivalDate) {
      console.log('No arrivalDate, clearing Tamazirt room availability');
      setTamazirtRoomAvailability(null);
      setLoadingTamazirtAvailability(false);
      fetchTamazirtRequestRef.current = null;
      return;
    }

    const dateParam = arrivalDate.includes('T') 
      ? arrivalDate.split('T')[0] 
      : arrivalDate;
    
    const requestId = `${dateParam}-tamazirt-${Date.now()}`;
    fetchTamazirtRequestRef.current = requestId;
    
    console.log('🔄 Fetching Tamazirt room availability for date:', dateParam, 'Request ID:', requestId);
    
    const abortController = new AbortController();
    setLoadingTamazirtAvailability(true);
    
    const fetchTamazirtRoomAvailability = async () => {
      try {
        const timeoutId = setTimeout(() => abortController.abort(), 10000);
        
        const response = await fetch(
          `/api/room-availability?roomId=1&arrivalDate=${dateParam}`,
          { signal: abortController.signal }
        );
        
        clearTimeout(timeoutId);
        
        if (fetchTamazirtRequestRef.current !== requestId) {
          console.log('⚠️ Ignoring stale response for Tamazirt room request:', requestId);
          return;
        }
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ Failed to fetch Tamazirt room availability:', response.status, errorText);
          if (fetchTamazirtRequestRef.current === requestId) {
            setTamazirtRoomAvailability({
              bookedBeds: 1,
              availableBeds: 0,
              isFullyBooked: true,
            });
            setLoadingTamazirtAvailability(false);
          }
          return;
        }
        
        const data = await response.json();
        console.log('📦 Tamazirt room availability data received for request:', requestId, data);
        
        if (fetchTamazirtRequestRef.current !== requestId) {
          console.log('⚠️ Ignoring stale response data for Tamazirt room request:', requestId);
          return;
        }
        
        const availability = {
          bookedBeds: data.bookedBeds || 0,
          availableBeds: data.availableBeds ?? 1,
          isFullyBooked: data.isFullyBooked === true,
        };
        
        console.log('✅ Setting Tamazirt room availability for request:', requestId, availability);
        setTamazirtRoomAvailability(availability);
        setLoadingTamazirtAvailability(false);
        
      } catch (error) {
        if (fetchTamazirtRequestRef.current !== requestId) {
          console.log('⚠️ Ignoring error for stale Tamazirt room request:', requestId);
          return;
        }
        
        if (error instanceof Error && error.name === 'AbortError') {
          console.log('⚠️ Tamazirt room request aborted for:', requestId);
          return;
        } else {
          console.error('❌ Error fetching Tamazirt room availability:', error);
        }
        
        if (fetchTamazirtRequestRef.current === requestId) {
          setTamazirtRoomAvailability({
            bookedBeds: 1,
            availableBeds: 0,
            isFullyBooked: true,
          });
          setLoadingTamazirtAvailability(false);
        }
      }
    };

    // Track request completion with a ref so cleanup can access it
    const requestCompletedRef = { current: false };
    
    // Call immediately and ensure promise rejection is always handled
    const promise = fetchTamazirtRoomAvailability()
      .then(() => {
        requestCompletedRef.current = true;
      })
      .catch((error) => {
        requestCompletedRef.current = true;
        // Silently swallow all errors - they're handled in the function
        // This prevents React error boundary from catching unhandled rejections
      });
    
    return () => {
      // Only cleanup if this is still the current request
      if (fetchTamazirtRequestRef.current !== requestId) {
        return;
      }
      
      // Only abort if request hasn't completed and signal isn't already aborted
      // This prevents aborting completed requests which would cause unnecessary rejections
      if (!requestCompletedRef.current && !abortController.signal.aborted) {
        // Abort the request
        // The promise rejection will be caught by the .catch() handler above
        try {
          abortController.abort();
        } catch (e) {
          // abort() shouldn't throw, but just in case
        }
      }
    };
  }, [arrivalDate]);

  // Fetch bed availability for Akal room (id: "9") - 1 bed
  useEffect(() => {
    if (!arrivalDate) {
      console.log('No arrivalDate, clearing Akal room availability');
      setAkalRoomAvailability(null);
      setLoadingAkalAvailability(false);
      fetchAkalRequestRef.current = null;
      return;
    }

    const dateParam = arrivalDate.includes('T') 
      ? arrivalDate.split('T')[0] 
      : arrivalDate;
    
    const requestId = `${dateParam}-akal-${Date.now()}`;
    fetchAkalRequestRef.current = requestId;
    
    console.log('🔄 Fetching Akal room availability for date:', dateParam, 'Request ID:', requestId);
    
    const abortController = new AbortController();
    setLoadingAkalAvailability(true);
    
    const fetchAkalRoomAvailability = async () => {
      try {
        const timeoutId = setTimeout(() => abortController.abort(), 10000);
        
        const response = await fetch(
          `/api/room-availability?roomId=9&arrivalDate=${dateParam}`,
          { signal: abortController.signal }
        );
        
        clearTimeout(timeoutId);
        
        if (fetchAkalRequestRef.current !== requestId) {
          console.log('⚠️ Ignoring stale response for Akal room request:', requestId);
          return;
        }
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ Failed to fetch Akal room availability:', response.status, errorText);
          if (fetchAkalRequestRef.current === requestId) {
            setAkalRoomAvailability({
              bookedBeds: 1,
              availableBeds: 0,
              isFullyBooked: true,
            });
            setLoadingAkalAvailability(false);
          }
          return;
        }
        
        const data = await response.json();
        console.log('📦 Akal room availability data received for request:', requestId, data);
        
        if (fetchAkalRequestRef.current !== requestId) {
          console.log('⚠️ Ignoring stale response data for Akal room request:', requestId);
          return;
        }
        
        const availability = {
          bookedBeds: data.bookedBeds || 0,
          availableBeds: data.availableBeds ?? 1,
          isFullyBooked: data.isFullyBooked === true,
        };
        
        console.log('✅ Setting Akal room availability for request:', requestId, availability);
        setAkalRoomAvailability(availability);
        setLoadingAkalAvailability(false);
        
      } catch (error) {
        if (fetchAkalRequestRef.current !== requestId) {
          console.log('⚠️ Ignoring error for stale Akal room request:', requestId);
          return;
        }
        
        if (error instanceof Error && error.name === 'AbortError') {
          console.log('⚠️ Akal room request aborted for:', requestId);
          return;
        } else {
          console.error('❌ Error fetching Akal room availability:', error);
        }
        
        if (fetchAkalRequestRef.current === requestId) {
          setAkalRoomAvailability({
            bookedBeds: 1,
            availableBeds: 0,
            isFullyBooked: true,
          });
          setLoadingAkalAvailability(false);
        }
      }
    };

    // Track request completion with a ref so cleanup can access it
    const requestCompletedRef = { current: false };
    
    // Call immediately and ensure promise rejection is always handled
    const promise = fetchAkalRoomAvailability()
      .then(() => {
        requestCompletedRef.current = true;
      })
      .catch((error) => {
        requestCompletedRef.current = true;
        // Silently swallow all errors - they're handled in the function
        // This prevents React error boundary from catching unhandled rejections
      });
    
    return () => {
      // Only cleanup if this is still the current request
      if (fetchAkalRequestRef.current !== requestId) {
        return;
      }
      
      // Only abort if request hasn't completed and signal isn't already aborted
      // This prevents aborting completed requests which would cause unnecessary rejections
      if (!requestCompletedRef.current && !abortController.signal.aborted) {
        // Abort the request
        // The promise rejection will be caught by the .catch() handler above
        try {
          abortController.abort();
        } catch (e) {
          // abort() shouldn't throw, but just in case
        }
      }
    };
  }, [arrivalDate]);

  // Fetch bed availability for Amlal room (id: "10") - 1 bed
  useEffect(() => {
    if (!arrivalDate) {
      console.log('No arrivalDate, clearing Amlal room availability');
      setAmlalRoomAvailability(null);
      setLoadingAmlalAvailability(false);
      fetchAmlalRequestRef.current = null;
      return;
    }

    const dateParam = arrivalDate.includes('T') 
      ? arrivalDate.split('T')[0] 
      : arrivalDate;
    
    const requestId = `${dateParam}-amlal-${Date.now()}`;
    fetchAmlalRequestRef.current = requestId;
    
    console.log('🔄 Fetching Amlal room availability for date:', dateParam, 'Request ID:', requestId);
    
    const abortController = new AbortController();
    setLoadingAmlalAvailability(true);
    
    const fetchAmlalRoomAvailability = async () => {
      try {
        const timeoutId = setTimeout(() => abortController.abort(), 10000);
        
        const response = await fetch(
          `/api/room-availability?roomId=10&arrivalDate=${dateParam}`,
          { signal: abortController.signal }
        );
        
        clearTimeout(timeoutId);
        
        if (fetchAmlalRequestRef.current !== requestId) {
          console.log('⚠️ Ignoring stale response for Amlal room request:', requestId);
          return;
        }
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ Failed to fetch Amlal room availability:', response.status, errorText);
          if (fetchAmlalRequestRef.current === requestId) {
            setAmlalRoomAvailability({
              bookedBeds: 1,
              availableBeds: 0,
              isFullyBooked: true,
            });
            setLoadingAmlalAvailability(false);
          }
          return;
        }
        
        const data = await response.json();
        console.log('📦 Amlal room availability data received for request:', requestId, data);
        
        if (fetchAmlalRequestRef.current !== requestId) {
          console.log('⚠️ Ignoring stale response data for Amlal room request:', requestId);
          return;
        }
        
        const availability = {
          bookedBeds: data.bookedBeds || 0,
          availableBeds: data.availableBeds ?? 1,
          isFullyBooked: data.isFullyBooked === true,
        };
        
        console.log('✅ Setting Amlal room availability for request:', requestId, availability);
        setAmlalRoomAvailability(availability);
        setLoadingAmlalAvailability(false);
        
      } catch (error) {
        if (fetchAmlalRequestRef.current !== requestId) {
          console.log('⚠️ Ignoring error for stale Amlal room request:', requestId);
          return;
        }
        
        if (error instanceof Error && error.name === 'AbortError') {
          console.log('⚠️ Amlal room request aborted for:', requestId);
          return;
        } else {
          console.error('❌ Error fetching Amlal room availability:', error);
        }
        
        if (fetchAmlalRequestRef.current === requestId) {
          setAmlalRoomAvailability({
            bookedBeds: 1,
            availableBeds: 0,
            isFullyBooked: true,
          });
          setLoadingAmlalAvailability(false);
        }
      }
    };

    // Track request completion with a ref so cleanup can access it
    const requestCompletedRef = { current: false };
    
    // Call immediately and ensure promise rejection is always handled
    const promise = fetchAmlalRoomAvailability()
      .then(() => {
        requestCompletedRef.current = true;
      })
      .catch((error) => {
        requestCompletedRef.current = true;
        // Silently swallow all errors - they're handled in the function
        // This prevents React error boundary from catching unhandled rejections
      });
    
    return () => {
      // Only cleanup if this is still the current request
      if (fetchAmlalRequestRef.current !== requestId) {
        return;
      }
      
      // Only abort if request hasn't completed and signal isn't already aborted
      // This prevents aborting completed requests which would cause unnecessary rejections
      if (!requestCompletedRef.current && !abortController.signal.aborted) {
        // Abort the request
        // The promise rejection will be caught by the .catch() handler above
        try {
          abortController.abort();
        } catch (e) {
          // abort() shouldn't throw, but just in case
        }
      }
    };
  }, [arrivalDate]);

  // Fetch bed availability for Double room - Oubaha (id: "3") - 1 bed
  useEffect(() => {
    if (!arrivalDate) {
      console.log('No arrivalDate, clearing Double room availability');
      setDoubleRoomAvailability(null);
      setLoadingDoubleAvailability(false);
      fetchDoubleRequestRef.current = null;
      return;
    }

    const dateParam = arrivalDate.includes('T') 
      ? arrivalDate.split('T')[0] 
      : arrivalDate;
    
    const requestId = `${dateParam}-double-${Date.now()}`;
    fetchDoubleRequestRef.current = requestId;
    
    console.log('🔄 Fetching Double room availability for date:', dateParam, 'Request ID:', requestId);
    
    const abortController = new AbortController();
    setLoadingDoubleAvailability(true);
    
    const fetchDoubleRoomAvailability = async () => {
      try {
        const timeoutId = setTimeout(() => abortController.abort(), 10000);
        
        const response = await fetch(
          `/api/room-availability?roomId=3&arrivalDate=${dateParam}`,
          { signal: abortController.signal }
        );
        
        clearTimeout(timeoutId);
        
        if (fetchDoubleRequestRef.current !== requestId) {
          console.log('⚠️ Ignoring stale response for Double room request:', requestId);
          return;
        }
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ Failed to fetch Double room availability:', response.status, errorText);
          if (fetchDoubleRequestRef.current === requestId) {
            setDoubleRoomAvailability({
              bookedBeds: 1,
              availableBeds: 0,
              isFullyBooked: true,
            });
            setLoadingDoubleAvailability(false);
          }
          return;
        }
        
        const data = await response.json();
        console.log('📦 Double room availability data received for request:', requestId, data);
        
        if (fetchDoubleRequestRef.current !== requestId) {
          console.log('⚠️ Ignoring stale response data for Double room request:', requestId);
          return;
        }
        
        const availability = {
          bookedBeds: data.bookedBeds || 0,
          availableBeds: data.availableBeds ?? 1,
          isFullyBooked: data.isFullyBooked === true,
        };
        
        console.log('✅ Setting Double room availability for request:', requestId, availability);
        setDoubleRoomAvailability(availability);
        setLoadingDoubleAvailability(false);
        
      } catch (error) {
        if (fetchDoubleRequestRef.current !== requestId) {
          console.log('⚠️ Ignoring error for stale Double room request:', requestId);
          return;
        }
        
        if (error instanceof Error && error.name === 'AbortError') {
          console.log('⚠️ Double room request aborted for:', requestId);
          return;
        } else {
          console.error('❌ Error fetching Double room availability:', error);
        }
        
        if (fetchDoubleRequestRef.current === requestId) {
          setDoubleRoomAvailability({
            bookedBeds: 1,
            availableBeds: 0,
            isFullyBooked: true,
          });
          setLoadingDoubleAvailability(false);
        }
      }
    };

    // Track request completion with a ref so cleanup can access it
    const requestCompletedRef = { current: false };
    
    // Call immediately and ensure promise rejection is always handled
    const promise = fetchDoubleRoomAvailability()
      .then(() => {
        requestCompletedRef.current = true;
      })
      .catch((error) => {
        requestCompletedRef.current = true;
        // Silently swallow all errors - they're handled in the function
        // This prevents React error boundary from catching unhandled rejections
      });
    
    return () => {
      // Only cleanup if this is still the current request
      if (fetchDoubleRequestRef.current !== requestId) {
        return;
      }
      
      // Only abort if request hasn't completed and signal isn't already aborted
      // This prevents aborting completed requests which would cause unnecessary rejections
      if (!requestCompletedRef.current && !abortController.signal.aborted) {
        // Abort silently - the promise rejection is already handled above
        abortController.abort();
      }
    };
  }, [arrivalDate]);

  // Fetch bed availability for Tafokt room - Bigdi (id: "7") - 1 bed
  useEffect(() => {
    if (!arrivalDate) {
      console.log('No arrivalDate, clearing Tafokt room availability');
      setTafoktRoomAvailability(null);
      setLoadingTafoktAvailability(false);
      fetchTafoktRequestRef.current = null;
      return;
    }

    const dateParam = arrivalDate.includes('T') 
      ? arrivalDate.split('T')[0] 
      : arrivalDate;
    
    const requestId = `${dateParam}-tafokt-${Date.now()}`;
    fetchTafoktRequestRef.current = requestId;
    
    console.log('🔄 Fetching Tafokt room availability for date:', dateParam, 'Request ID:', requestId);
    
    const abortController = new AbortController();
    setLoadingTafoktAvailability(true);
    
    const fetchTafoktRoomAvailability = async () => {
      try {
        const response = await fetch(
          `/api/room-availability?roomId=7&arrivalDate=${dateParam}`,
          { signal: abortController.signal }
        );
        
        if (fetchTafoktRequestRef.current !== requestId) {
          console.log('⚠️ Ignoring stale response for Tafokt room request:', requestId);
          return;
        }
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ Failed to fetch Tafokt room availability:', response.status, errorText);
          if (fetchTafoktRequestRef.current === requestId) {
            setTafoktRoomAvailability({
              bookedBeds: 1,
              availableBeds: 0,
              isFullyBooked: true,
            });
            setLoadingTafoktAvailability(false);
          }
          return;
        }
        
        const data = await response.json();
        console.log('📦 Tafokt room availability data received for request:', requestId, data);
        
        if (fetchTafoktRequestRef.current !== requestId) {
          console.log('⚠️ Ignoring stale response data for Tafokt room request:', requestId);
          return;
        }
        
        const availability = {
          bookedBeds: data.bookedBeds || 0,
          availableBeds: data.availableBeds ?? 1,
          isFullyBooked: data.isFullyBooked === true,
        };
        
        console.log('✅ Setting Tafokt room availability for request:', requestId, availability);
        setTafoktRoomAvailability(availability);
        setLoadingTafoktAvailability(false);
        
      } catch (error) {
        // Always clear loading state, even for stale requests
        const isStale = fetchTafoktRequestRef.current !== requestId;
        const isCurrentRequest = fetchTafoktRequestRef.current === requestId;
        
        if (isStale) {
          console.log('⚠️ Ignoring error for stale Tafokt room request:', requestId);
          // Still clear loading for stale requests to prevent stuck state
          setLoadingTafoktAvailability(false);
          return;
        }
        
        if (error instanceof Error && error.name === 'AbortError') {
          // AbortError is expected - don't log as error, just clear loading
          if (isCurrentRequest) {
            setLoadingTafoktAvailability(false);
          }
          return;
        }
        
        console.error('❌ Error fetching Tafokt room availability:', error);
        
        // On error, set default unavailable state
        if (isCurrentRequest) {
          setTafoktRoomAvailability({
            bookedBeds: 1,
            availableBeds: 0,
            isFullyBooked: true,
          });
          setLoadingTafoktAvailability(false);
        }
      }
    };

    // Track request completion with a ref so cleanup can access it
    const requestCompletedRef = { current: false };
    
    // Call the async function and handle any unhandled promise rejections
    const promise = fetchTafoktRoomAvailability()
      .then(() => {
        requestCompletedRef.current = true;
      })
      .catch((error) => {
        requestCompletedRef.current = true;
        // Silently swallow all errors - they're handled in the function
        // This prevents React error boundary from catching unhandled rejections
      });
    
    return () => {
      // Only cleanup if this is still the current request
      if (fetchTafoktRequestRef.current !== requestId) {
        return;
      }
      
      // Only abort if request hasn't completed and signal isn't already aborted
      // This prevents aborting completed requests which would cause unnecessary rejections
      if (!requestCompletedRef.current && !abortController.signal.aborted) {
        // Abort the request
        // The promise rejection will be caught by the .catch() handler above
        try {
          abortController.abort();
        } catch (e) {
          // abort() shouldn't throw, but just in case
        }
      }
      
      // Clear loading state
      fetchTafoktRequestRef.current = null;
      setLoadingTafoktAvailability(false);
    };
  }, [arrivalDate]);

  // Calculate total assigned people
  const totalAssigned = Object.values(roomAssignments).reduce((sum, n) => sum + n, 0);

  // Helper to update assignments
  const handleChange = (roomId: string, delta: number) => {
    const current = roomAssignments[roomId] || 0;
    let next = { ...roomAssignments };
    
    // Special handling for Triple room (id: "2")
    if (roomId === "2") {
      const isFullyBooked = tripleRoomAvailability?.isFullyBooked || false;
      const availableBeds = tripleRoomAvailability?.availableBeds || 3;
      const maxForTripleRoom = Math.min(availableBeds, 3); // Max 3 beds, but limited by availability
      
      // Prevent changes if room is fully booked
      if (isFullyBooked) {
        return;
      }
      
      if (delta === 1 && totalAssigned < maxPeople && current < maxForTripleRoom) {
        next[roomId] = current + 1;
      } else if (delta === -1 && current > 0) {
        next[roomId] = current - 1;
      }
    } else if (roomId === "4") {
      // Twin room: max based on available beds
      const isFullyBooked = twinRoomAvailability?.isFullyBooked || false;
      const availableBeds = twinRoomAvailability?.availableBeds ?? 2;
      const maxForTwinRoom = Math.min(availableBeds, 2); // Max 2 beds, but limited by availability
      
      // Prevent changes if room is fully booked
      if (isFullyBooked) {
        return;
      }
      
      if (delta === 1 && totalAssigned < maxPeople && current < maxForTwinRoom) {
        next[roomId] = current + 1;
      } else if (delta === -1 && current > 0) {
        next[roomId] = current - 1;
      }
    } else if (roomId === "1") {
      // Tamazirt room - Oubaha: max based on available beds (1 bed, can fit 1-2 people)
      const isFullyBooked = tamazirtRoomAvailability?.isFullyBooked || false;
      const availableBeds = tamazirtRoomAvailability?.availableBeds ?? 1;
      const maxForTamazirtRoom = availableBeds > 0 ? 2 : 0; // Max 2 people if bed is available
      
      // Prevent changes if room is fully booked
      if (isFullyBooked) {
        return;
      }
      
      if (delta === 1 && totalAssigned < maxPeople && current < maxForTamazirtRoom) {
        next[roomId] = current + 1;
      } else if (delta === -1 && current > 0) {
        next[roomId] = current - 1;
      }
    } else if (roomId === "3") {
      // Double room - Oubaha: max based on available beds (1 bed, can fit 1-2 people)
      const isFullyBooked = doubleRoomAvailability?.isFullyBooked || false;
      const availableBeds = doubleRoomAvailability?.availableBeds ?? 1;
      const maxForDoubleRoom = availableBeds > 0 ? 2 : 0; // Max 2 people if bed is available
      
      // Prevent changes if room is fully booked
      if (isFullyBooked) {
        return;
      }
      
      if (delta === 1 && totalAssigned < maxPeople && current < maxForDoubleRoom) {
        next[roomId] = current + 1;
      } else if (delta === -1 && current > 0) {
        next[roomId] = current - 1;
      }
    } else if (roomId === "7") {
      // Tafokt room - Bigdi: max based on available beds (1 bed, can fit 1-2 people)
      const isFullyBooked = tafoktRoomAvailability?.isFullyBooked || false;
      const availableBeds = tafoktRoomAvailability?.availableBeds ?? 1;
      const maxForTafoktRoom = availableBeds > 0 ? 2 : 0; // Max 2 people if bed is available
      
      // Prevent changes if room is fully booked
      if (isFullyBooked) {
        return;
      }
      
      if (delta === 1 && totalAssigned < maxPeople && current < maxForTafoktRoom) {
        next[roomId] = current + 1;
      } else if (delta === -1 && current > 0) {
        next[roomId] = current - 1;
      }
    } else if (roomId === "9") {
      // Akal room: max based on available beds (1 bed, can fit 1-2 people)
      const isFullyBooked = akalRoomAvailability?.isFullyBooked || false;
      const availableBeds = akalRoomAvailability?.availableBeds ?? 1;
      const maxForAkalRoom = availableBeds > 0 ? 2 : 0; // Max 2 people if bed is available
      
      // Prevent changes if room is fully booked
      if (isFullyBooked) {
        return;
      }
      
      if (delta === 1 && totalAssigned < maxPeople && current < maxForAkalRoom) {
        next[roomId] = current + 1;
      } else if (delta === -1 && current > 0) {
        next[roomId] = current - 1;
      }
    } else if (roomId === "10") {
      // Amlal room: max based on available beds (1 bed, can fit 1-2 people)
      const isFullyBooked = amlalRoomAvailability?.isFullyBooked || false;
      const availableBeds = amlalRoomAvailability?.availableBeds ?? 1;
      const maxForAmlalRoom = availableBeds > 0 ? 2 : 0; // Max 2 people if bed is available
      
      // Prevent changes if room is fully booked
      if (isFullyBooked) {
        return;
      }
      
      if (delta === 1 && totalAssigned < maxPeople && current < maxForAmlalRoom) {
        next[roomId] = current + 1;
      } else if (delta === -1 && current > 0) {
        next[roomId] = current - 1;
      }
    } else {
      // Other rooms: max 2 people
    if (delta === 1 && totalAssigned < maxPeople && current < 2) {
      next[roomId] = current + 1;
    } else if (delta === -1 && current > 0) {
      next[roomId] = current - 1;
    }
    }
    
    setRoomAssignments(next);
  };

  const handleNext = () => {
    router.push("/checkout/4-add-ons");
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 sm:gap-8 lg:gap-12 min-h-screen max-w-7xl mx-auto px-2 sm:px-4">
      <div className="w-full lg:w-[70%] py-4 sm:py-6 lg:py-8">
        <h2 className="text-xl sm:text-2xl font-bold mb-2">Select your room type</h2>
        <div className="text-gray-500 mb-4 sm:mb-6 lg:mb-8 text-sm sm:text-base">Price add-on per room for the duration</div>
        {/* Debug info - remove after testing */}
        <div className="mb-4 p-2 bg-yellow-100 border border-yellow-400 rounded text-sm">
          <strong>Debug Info:</strong><br/>
          Arrival Date: {arrivalDate || 'NOT SET'} | <br/>
          Tamazirt Room (ID 1): {tamazirtRoomAvailability ? 
            `Booked: ${tamazirtRoomAvailability.bookedBeds}, Available: ${tamazirtRoomAvailability.availableBeds}, Fully Booked: ${tamazirtRoomAvailability.isFullyBooked}` 
            : 'NULL'} | Loading: {loadingTamazirtAvailability ? 'YES' : 'NO'} | <br/>
          Triple Room (ID 2): {tripleRoomAvailability ? 
            `Booked: ${tripleRoomAvailability.bookedBeds}, Available: ${tripleRoomAvailability.availableBeds}, Fully Booked: ${tripleRoomAvailability.isFullyBooked}` 
            : 'NULL'} | Loading: {loadingAvailability ? 'YES' : 'NO'} | <br/>
          Double Room (ID 3): {doubleRoomAvailability ? 
            `Booked: ${doubleRoomAvailability.bookedBeds}, Available: ${doubleRoomAvailability.availableBeds}, Fully Booked: ${doubleRoomAvailability.isFullyBooked}` 
            : 'NULL'} | Loading: {loadingDoubleAvailability ? 'YES' : 'NO'} | <br/>
          Twin Room (ID 4): {twinRoomAvailability ? 
            `Booked: ${twinRoomAvailability.bookedBeds}, Available: ${twinRoomAvailability.availableBeds}, Fully Booked: ${twinRoomAvailability.isFullyBooked}` 
            : 'NULL'} | Loading: {loadingTwinAvailability ? 'YES' : 'NO'} | <br/>
          Ayour Room (ID 6): {ayourRoomAvailability ? 
            `Booked: ${ayourRoomAvailability.bookedBeds}, Available: ${ayourRoomAvailability.availableBeds}, Fully Booked: ${ayourRoomAvailability.isFullyBooked}` 
            : 'NULL'} | Loading: {loadingAyourAvailability ? 'YES' : 'NO'} | <br/>
          Tafokt Room (ID 7): {tafoktRoomAvailability ? 
            `Booked: ${tafoktRoomAvailability.bookedBeds}, Available: ${tafoktRoomAvailability.availableBeds}, Fully Booked: ${tafoktRoomAvailability.isFullyBooked}` 
            : 'NULL'} | Loading: {loadingTafoktAvailability ? 'YES' : 'NO'} | <br/>
          Akal Room (ID 9): {akalRoomAvailability ? 
            `Booked: ${akalRoomAvailability.bookedBeds}, Available: ${akalRoomAvailability.availableBeds}, Fully Booked: ${akalRoomAvailability.isFullyBooked}` 
            : 'NULL'} | Loading: {loadingAkalAvailability ? 'YES' : 'NO'} | <br/>
          Amlal Room (ID 10): {amlalRoomAvailability ? 
            `Booked: ${amlalRoomAvailability.bookedBeds}, Available: ${amlalRoomAvailability.availableBeds}, Fully Booked: ${amlalRoomAvailability.isFullyBooked}` 
            : 'NULL'} | Loading: {loadingAmlalAvailability ? 'YES' : 'NO'}
        </div>
        <div className="w-full mb-4 sm:mb-6 lg:mb-8">
          <div className="rounded-full bg-yellow-300 px-3 sm:px-6 py-2 text-lapoint-dark text-[10px] sm:text-xs font-normal" style={{ width: '100%', fontWeight: 400 }}>
            <span className="font-bold">10% discount</span> &bull; For bookings with arrival dates until 11 Aug Including 4 day packages or multiple weeks. &bull; Use code: <span className="font-bold">TAGHAZOUT10</span>
          </div>
        </div>
        {/* Oubaha Rooms */}
        <div className="mb-6 sm:mb-10">
          <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">DRIFTLINE OUBAHA</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {oubahaRooms.map((room) => {
              const assigned = roomAssignments[room.id] || 0;
              const isTripleRoom = room.id === "2";
              const isTwinRoom = room.id === "4";
              const isTamazirtRoom = room.id === "1";
              const isDoubleRoom = room.id === "3";
              
              // For rooms with bed-based availability, use availability data; for others, default values
              let isFullyBooked = false;
              let availableBeds = 2;
              let maxForRoom = 2;
              let isLoading = false;
              
              if (isTripleRoom) {
                // Only use availability data if it's loaded AND not currently loading
                // This prevents flickering between states
                if (tripleRoomAvailability !== null && !loadingAvailability) {
                  // Data loaded - use actual availability
                  isFullyBooked = tripleRoomAvailability.isFullyBooked === true;
                  availableBeds = tripleRoomAvailability.availableBeds ?? 3;
                  maxForRoom = Math.min(availableBeds, 3);
                } else if (loadingAvailability) {
                  // While loading, show as unavailable with "Checking..." message
                  isFullyBooked = true;
                  availableBeds = 0;
                  maxForRoom = 0;
                  isLoading = true;
                } else {
                  // No data and not loading - initial state (shouldn't happen with arrivalDate)
                  // Default to available but this will update once data loads
                  isFullyBooked = false;
                  availableBeds = 3;
                  maxForRoom = 3;
                }
              } else if (isTwinRoom) {
                // Only use availability data if it's loaded AND not currently loading
                // This prevents flickering between states
                if (twinRoomAvailability !== null && !loadingTwinAvailability) {
                  // Data loaded - use actual availability
                  isFullyBooked = twinRoomAvailability.isFullyBooked === true;
                  availableBeds = twinRoomAvailability.availableBeds ?? 2;
                  maxForRoom = Math.min(availableBeds, 2);
                } else if (loadingTwinAvailability) {
                  // While loading, show as unavailable with "Checking..." message
                  isFullyBooked = true;
                  availableBeds = 0;
                  maxForRoom = 0;
                  isLoading = true;
                } else {
                  // No data and not loading - initial state (shouldn't happen with arrivalDate)
                  // Default to available but this will update once data loads
                  isFullyBooked = false;
                  availableBeds = 2;
                  maxForRoom = 2;
                }
              } else if (isTamazirtRoom) {
                // Tamazirt room: 1 bed (can fit 1-2 people)
                if (tamazirtRoomAvailability !== null && !loadingTamazirtAvailability) {
                  isFullyBooked = tamazirtRoomAvailability.isFullyBooked === true;
                  availableBeds = tamazirtRoomAvailability.availableBeds ?? 1;
                  maxForRoom = availableBeds > 0 ? 2 : 0; // Max 2 people if bed is available
                } else if (loadingTamazirtAvailability) {
                  isFullyBooked = true;
                  availableBeds = 0;
                  maxForRoom = 0;
                  isLoading = true;
                } else {
                  isFullyBooked = false;
                  availableBeds = 1;
                  maxForRoom = 2;
                }
              } else if (isDoubleRoom) {
                // Double room: 1 bed (can fit 1-2 people)
                if (doubleRoomAvailability !== null && !loadingDoubleAvailability) {
                  isFullyBooked = doubleRoomAvailability.isFullyBooked === true;
                  availableBeds = doubleRoomAvailability.availableBeds ?? 1;
                  maxForRoom = availableBeds > 0 ? 2 : 0; // Max 2 people if bed is available
                } else if (loadingDoubleAvailability) {
                  isFullyBooked = true;
                  availableBeds = 0;
                  maxForRoom = 0;
                  isLoading = true;
                } else {
                  isFullyBooked = false;
                  availableBeds = 1;
                  maxForRoom = 2;
                }
              }
              
              // Debug log for rooms with availability
              if (isTripleRoom) {
                console.log('Triple room rendering:', {
                  availability: tripleRoomAvailability,
                  loading: loadingAvailability,
                  isFullyBooked,
                  availableBeds,
                  maxForRoom,
                });
              } else if (isTwinRoom) {
                console.log('Twin room rendering:', {
                  availability: twinRoomAvailability,
                  loading: loadingTwinAvailability,
                  isFullyBooked,
                  availableBeds,
                  maxForRoom,
                });
              } else if (isTamazirtRoom) {
                console.log('Tamazirt room rendering:', {
                  availability: tamazirtRoomAvailability,
                  loading: loadingTamazirtAvailability,
                  isFullyBooked,
                  availableBeds,
                  maxForRoom,
                });
              } else if (isDoubleRoom) {
                console.log('Double room rendering:', {
                  availability: doubleRoomAvailability,
                  loading: loadingDoubleAvailability,
                  isFullyBooked,
                  availableBeds,
                  maxForRoom,
                });
              }
              
              const isRoomWithAvailability = isTripleRoom || isTwinRoom || isTamazirtRoom || isDoubleRoom;
              const isRoomLoading = (isTripleRoom && loadingAvailability) || 
                                   (isTwinRoom && loadingTwinAvailability) || 
                                   (isTamazirtRoom && loadingTamazirtAvailability) || 
                                   (isDoubleRoom && loadingDoubleAvailability);
              
              return (
                <div key={room.id} className={`bg-white border border-lapoint-border rounded-xl overflow-hidden flex flex-col relative ${isRoomLoading ? 'opacity-90' : ''}`}>
                  {/* Banner - grey when unavailable, red when available */}
                  <div className={`absolute top-0 left-0 w-full ${isFullyBooked ? 'bg-gray-500' : 'bg-lapoint-red'} text-white text-center py-1 text-[9px] sm:text-[10px] font-semibold z-10 rounded-t-xl`}>
                    {isRoomLoading
                      ? 'Checking availability...' 
                      : isFullyBooked 
                        ? 'Room not available' 
                        : 'Room is not bookable for 1 person'}
                  </div>
                  {/* Image with low opacity when unavailable or loading */}
                  <Image 
                    src={room.img} 
                    alt={room.name} 
                    width={600} 
                    height={400} 
                    quality={100} 
                    className={`w-full h-48 sm:h-56 object-cover ${isFullyBooked || isLoading ? 'opacity-50' : ''}`} 
                  />
                  <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="font-semibold text-sm sm:text-base mb-2">{room.name}</div>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-2">
                        <div className={`font-bold text-sm sm:text-base ${
                          room.price === 0 && isFullyBooked 
                            ? 'text-gray-500' 
                            : 'text-lapoint-red'
                        }`}>+ EUR {room.price}</div>
                        <div className="text-xs sm:text-sm text-gray-600">Number of people</div>
                    </div>
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-0">
                      <button
                        type="button"
                          className="bg-white border border-gray-300 text-black px-3 sm:px-4 py-2 rounded text-xs sm:text-sm flex items-center justify-center gap-2 hover:bg-gray-50 w-full sm:w-auto"
                          onClick={() => toggleRoomExpansion(room.id)}
                        >
                          View room
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path 
                              d="M3 4.5L6 7.5L9 4.5" 
                              stroke="currentColor" 
                              strokeWidth="1.5" 
                              strokeLinecap="round" 
                              strokeLinejoin="round"
                            />
                          </svg>
                        </button>
                        <div className="flex items-center gap-2 justify-end sm:justify-start">
                          <button
                            type="button"
                            className="w-8 h-8 rounded-full border border-gray-300 text-gray-600 flex items-center justify-center text-xl disabled:opacity-50 bg-white disabled:cursor-not-allowed"
                        aria-label="Decrease number of people"
                        onClick={() => handleChange(room.id, -1)}
                            disabled={assigned === 0 || isFullyBooked || isLoading || isRoomLoading}
                      >
                        –
                      </button>
                      <span className="w-8 text-center font-bold text-sm sm:text-base">{assigned}</span>
                      <button
                        type="button"
                            className="w-8 h-8 rounded-full border border-lapoint-red text-lapoint-red flex items-center justify-center text-xl disabled:opacity-50 bg-white disabled:cursor-not-allowed"
                        aria-label="Increase number of people"
                        onClick={() => handleChange(room.id, 1)}
                            disabled={assigned >= maxForRoom || totalAssigned >= maxPeople || isFullyBooked || isLoading || isRoomLoading}
                      >
                        +
                      </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Bigdi Rooms */}
        <div className="mb-6 sm:mb-10">
          <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">DRIFTLINE BIGDI</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {bigdiRooms.map((room) => {
              const assigned = roomAssignments[room.id] || 0;
              const isAyourRoom = room.id === "6";
              const isTafoktRoom = room.id === "7";
              const isAkalRoom = room.id === "9";
              const isAmlalRoom = room.id === "10";
              
              // For rooms with bed-based availability, use availability data; for others, default values
              let isFullyBooked = false;
              let availableBeds = 2;
              let maxForRoom = 2;
              let isLoading = false;
              
              if (isAyourRoom) {
                // Ayour room: 2 beds (same logic as Twin room)
                if (ayourRoomAvailability !== null && !loadingAyourAvailability) {
                  isFullyBooked = ayourRoomAvailability.isFullyBooked === true;
                  availableBeds = ayourRoomAvailability.availableBeds ?? 2;
                  maxForRoom = Math.min(availableBeds, 2);
                } else if (loadingAyourAvailability) {
                  isFullyBooked = true;
                  availableBeds = 0;
                  maxForRoom = 0;
                  isLoading = true;
                } else {
                  isFullyBooked = false;
                  availableBeds = 2;
                  maxForRoom = 2;
                }
              } else if (isTafoktRoom) {
                // Tafokt room: 1 bed (can fit 1-2 people)
                if (tafoktRoomAvailability !== null && !loadingTafoktAvailability) {
                  isFullyBooked = tafoktRoomAvailability.isFullyBooked === true;
                  availableBeds = tafoktRoomAvailability.availableBeds ?? 1;
                  maxForRoom = availableBeds > 0 ? 2 : 0; // Max 2 people if bed is available
                } else if (loadingTafoktAvailability) {
                  isFullyBooked = true;
                  availableBeds = 0;
                  maxForRoom = 0;
                  isLoading = true;
                } else {
                  isFullyBooked = false;
                  availableBeds = 1;
                  maxForRoom = 2;
                }
              } else if (isAkalRoom) {
                // Akal room: 1 bed (can fit 1-2 people)
                if (akalRoomAvailability !== null && !loadingAkalAvailability) {
                  isFullyBooked = akalRoomAvailability.isFullyBooked === true;
                  availableBeds = akalRoomAvailability.availableBeds ?? 1;
                  maxForRoom = availableBeds > 0 ? 2 : 0; // Max 2 people if bed is available
                } else if (loadingAkalAvailability) {
                  isFullyBooked = true;
                  availableBeds = 0;
                  maxForRoom = 0;
                  isLoading = true;
                } else {
                  isFullyBooked = false;
                  availableBeds = 1;
                  maxForRoom = 2;
                }
              } else if (isAmlalRoom) {
                // Amlal room: 1 bed (can fit 1-2 people) - same logic as Tamazirt room
                if (amlalRoomAvailability !== null && !loadingAmlalAvailability) {
                  isFullyBooked = amlalRoomAvailability.isFullyBooked === true;
                  availableBeds = amlalRoomAvailability.availableBeds ?? 1;
                  maxForRoom = availableBeds > 0 ? 2 : 0; // Max 2 people if bed is available
                } else if (loadingAmlalAvailability) {
                  isFullyBooked = true;
                  availableBeds = 0;
                  maxForRoom = 0;
                  isLoading = true;
                } else {
                  isFullyBooked = false;
                  availableBeds = 1;
                  maxForRoom = 2;
                }
              }
              
              // Debug log for rooms with availability
              if (isAyourRoom) {
                console.log('Ayour room rendering:', {
                  availability: ayourRoomAvailability,
                  loading: loadingAyourAvailability,
                  isFullyBooked,
                  availableBeds,
                  maxForRoom,
                });
              } else if (isTafoktRoom) {
                console.log('Tafokt room rendering:', {
                  availability: tafoktRoomAvailability,
                  loading: loadingTafoktAvailability,
                  isFullyBooked,
                  availableBeds,
                  maxForRoom,
                });
              } else if (isAkalRoom) {
                console.log('Akal room rendering:', {
                  availability: akalRoomAvailability,
                  loading: loadingAkalAvailability,
                  isFullyBooked,
                  availableBeds,
                  maxForRoom,
                });
              } else if (isAmlalRoom) {
                console.log('Amlal room rendering:', {
                  availability: amlalRoomAvailability,
                  loading: loadingAmlalAvailability,
                  isFullyBooked,
                  availableBeds,
                  maxForRoom,
                });
              }
              
              // All Bigdi rooms with bed-based availability check
              const isRoomWithAvailability = isAyourRoom || isTafoktRoom || isAkalRoom || isAmlalRoom;
              const isRoomLoading = (isAyourRoom && loadingAyourAvailability) || 
                                   (isTafoktRoom && loadingTafoktAvailability) || 
                                   (isAkalRoom && loadingAkalAvailability) ||
                                   (isAmlalRoom && loadingAmlalAvailability);
              
              const shouldShowAsAvailable = !isFullyBooked && !isRoomLoading;
              
              return (
                <div key={room.id} className={`bg-white border border-lapoint-border rounded-xl overflow-hidden flex flex-col relative ${isRoomLoading ? 'opacity-90' : ''}`}>
                  {/* Banner - grey when unavailable, red when available */}
                  <div className={`absolute top-0 left-0 w-full ${shouldShowAsAvailable ? 'bg-lapoint-red' : 'bg-gray-500'} text-white text-center py-1 text-[10px] font-semibold z-10 rounded-t-xl`}>
                    {isRoomLoading
                      ? 'Checking availability...' 
                      : shouldShowAsAvailable
                        ? 'Room is not bookable for 1 person'
                        : 'Room not available'}
                  </div>
                  {/* Image with low opacity when unavailable or loading */}
                  <Image 
                    src={room.img} 
                    alt={room.name} 
                    width={600} 
                    height={400} 
                    quality={100} 
                    className={`w-full h-56 object-cover ${!shouldShowAsAvailable || isLoading ? 'opacity-50' : ''}`} 
                  />
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="font-semibold text-base mb-2">{room.name}</div>
                      <div className="flex items-center justify-between mb-2">
                        <div className={`font-bold ${
                          room.price === 0 && !shouldShowAsAvailable 
                            ? 'text-gray-500' 
                            : 'text-lapoint-red'
                        }`}>+ EUR {room.price}</div>
                        <div className="text-sm text-gray-600">Number of people</div>
                      </div>
                      <div className="flex items-center justify-between">
                        <button
                          type="button"
                          className="bg-white border border-gray-300 text-black px-4 py-2 rounded text-sm flex items-center gap-2 hover:bg-gray-50"
                          onClick={() => toggleRoomExpansion(room.id)}
                        >
                          View room
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path 
                              d="M3 4.5L6 7.5L9 4.5" 
                              stroke="currentColor" 
                              strokeWidth="1.5" 
                              strokeLinecap="round" 
                              strokeLinejoin="round"
                            />
                          </svg>
                        </button>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            className="w-8 h-8 rounded-full border border-gray-300 text-gray-600 flex items-center justify-center text-xl disabled:opacity-50 bg-white disabled:cursor-not-allowed"
                            aria-label="Decrease number of people"
                            onClick={() => handleChange(room.id, -1)}
                            disabled={assigned === 0 || !shouldShowAsAvailable || isLoading || isRoomLoading}
                          >
                            –
                          </button>
                          <span className="w-8 text-center font-bold">{assigned}</span>
                          <button
                            type="button"
                            className="w-8 h-8 rounded-full border border-lapoint-red text-lapoint-red flex items-center justify-center text-xl disabled:opacity-50 bg-white disabled:cursor-not-allowed"
                            aria-label="Increase number of people"
                            onClick={() => handleChange(room.id, 1)}
                            disabled={assigned >= maxForRoom || totalAssigned >= maxPeople || !shouldShowAsAvailable || isLoading || isRoomLoading}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className="w-full lg:w-[25%] flex-shrink-0 mt-4 sm:mt-6 lg:mt-8">
        <BookingSummary buttonLabel="ADD-ON SELECTION →" onButtonClick={handleNext} />
      </div>

      {/* Room Details Modal Popup */}
      {expandedRoomId && (() => {
        const room = [...oubahaRooms, ...bigdiRooms].find(r => r.id === expandedRoomId);
        if (!room) return null;
        
        const images = roomImages[expandedRoomId] || [];
        const currentIndex = carouselIndices[expandedRoomId] || 0;
        
        return (
            <div 
              className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/50 backdrop-blur-sm"
              onClick={() => setExpandedRoomId(null)}
            >
            <div 
              className="bg-[#FAF9F6] rounded-2xl sm:rounded-3xl shadow-2xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col m-2 sm:m-4"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header with Room Name and Price */}
              <div className="pt-4 sm:pt-6 pb-3 sm:pb-4 bg-[#FAF9F6]">
                <div className="flex items-center w-full">
                  {/* Left Spacer to match arrow space */}
                  <div className="w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0 ml-2 sm:ml-4 mr-2 sm:mr-3"></div>
                  
                  {/* Header Content - Matches image container width */}
                  <div className="flex-1 flex items-start justify-between">
                    <div className="flex-1">
                      <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1">{room.name}</h2>
                      <div className="text-sm sm:text-base font-semibold text-gray-900">+ EUR {room.price}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setExpandedRoomId(null)}
                      className="p-1.5 sm:p-2 hover:bg-white/50 rounded-full transition-colors ml-2 sm:ml-4"
                      aria-label="Close modal"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="sm:w-5 sm:h-5">
                        <path 
                          d="M18 6L6 18M6 6L18 18" 
                          stroke="currentColor" 
                          strokeWidth="3" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                          className="text-lapoint-red"
                        />
                      </svg>
                    </button>
                  </div>
                  
                  {/* Right Spacer to match arrow space */}
                  <div className="w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0 mr-2 sm:mr-4 ml-2 sm:ml-3"></div>
                </div>
              </div>

              {/* Modal Content - Scrollable */}
              <div className="flex-1 overflow-y-auto">
                {/* Image Carousel */}
                {images.length > 0 && (
                  <div className="flex items-center w-full bg-[#FAF9F6]">
                    {/* Left Navigation Arrow */}
                    {images.length > 1 && currentIndex > 0 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigateCarousel(expandedRoomId, 'prev');
                        }}
                        className="bg-lapoint-red hover:bg-red-700 rounded-full w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center shadow-lg transition-all z-10 flex-shrink-0 ml-2 sm:ml-4 mr-2 sm:mr-3"
                        aria-label="Previous image"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="sm:w-5 sm:h-5">
                          <path d="M15 18L9 12L15 6" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    )}
                    {images.length > 1 && currentIndex === 0 && (
                      <div className="w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0 ml-2 sm:ml-4 mr-2 sm:mr-3"></div>
                    )}
                    
                    {/* Carousel Images Container */}
                    <div className="relative flex-1 h-64 sm:h-80 md:h-96 overflow-hidden bg-[#FAF9F6] rounded-xl">
                      <div className="flex transition-transform duration-300 ease-in-out h-full" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
                        {images.map((img, idx) => (
                          <div key={idx} className="min-w-full h-64 sm:h-80 md:h-96 relative flex-shrink-0 rounded-xl overflow-hidden">
                            <Image
                              src={img}
                              alt={`${room.name} - Image ${idx + 1}`}
                              fill
                              sizes="100vw"
                              className="object-cover rounded-xl"
                              quality={100}
                              priority={idx === 0}
                            />
                          </div>
                        ))}
                      </div>
                      
                      {/* Image Indicators */}
                      {images.length > 1 && (
                        <div className="absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10 items-center">
                          {images.map((_, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setCarouselIndices(prev => ({ ...prev, [expandedRoomId]: idx }));
                              }}
                              className={`rounded-full transition-all ${
                                idx === currentIndex 
                                  ? 'bg-lapoint-red h-2 w-5 sm:w-6' 
                                  : 'bg-[#E8E6E0] hover:bg-[#D4D2CC] h-2 w-2'
                              }`}
                              aria-label={`Go to image ${idx + 1}`}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                    
                    {/* Right Navigation Arrow */}
                    {images.length > 1 && currentIndex < images.length - 1 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigateCarousel(expandedRoomId, 'next');
                        }}
                        className="bg-lapoint-red hover:bg-red-700 rounded-full w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center shadow-lg transition-all z-10 flex-shrink-0 mr-2 sm:mr-4 ml-2 sm:ml-3"
                        aria-label="Next image"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="sm:w-5 sm:h-5">
                          <path d="M9 18L15 12L9 6" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    )}
                    {images.length > 1 && currentIndex === images.length - 1 && (
                      <div className="w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0 mr-2 sm:mr-4 ml-2 sm:ml-3"></div>
                    )}
                  </div>
                )}
                
                {/* Room Description - Matches image width */}
                <div className="flex items-center w-full bg-[#FAF9F6]">
                  {/* Left Spacer to match arrow space */}
                  <div className="w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0 ml-2 sm:ml-4 mr-2 sm:mr-3"></div>
                  
                  {/* Description Container - Matches image container width */}
                  <div className="flex-1 pt-3 sm:pt-4 pb-4 sm:pb-6">
                    {loadingDescriptions[expandedRoomId] ? (
                      <div className="text-gray-500 text-xs sm:text-sm">Loading description...</div>
                    ) : roomDescriptions[expandedRoomId] ? (
                      <p className="text-gray-800 text-xs sm:text-sm leading-relaxed">
                        {roomDescriptions[expandedRoomId]}
                      </p>
                    ) : (
                      <p className="text-gray-500 text-xs sm:text-sm">No description available.</p>
                    )}
                  </div>
                  
                  {/* Right Spacer to match arrow space */}
                  <div className="w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0 mr-2 sm:mr-4 ml-2 sm:ml-3"></div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
} 