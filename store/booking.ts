import { create } from 'zustand';

type Package = { id: string; name: string; description?: string; price: number; levels: string[]; includedItems?: string[] };
type Room = { id: string; name: string; description: string; price: number; capacity: number };
type AddOn = { id: string; name: string; price: number; type: string; img: string; description: string };
type Traveller = { 
  name: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  year?: string;
  month?: string;
  day?: string;
  country?: string;
  mobile?: string;
  phone?: string;
  surfLevel?: string;
  gender?: string;
  studioName?: string;
  notes?: string;
};

type State = {
  destinations: { id: string; name: string }[];
  packages: Package[];
  rooms: Room[];
  addOns: AddOn[];
  selectedPackage: Package | null;
  surfLevel: string;
  setSurfLevel: (level: string) => void;
  setPackage: (id: string) => void;
  arrivalDate: string;
  setArrivalDate: (date: string) => void;
  selectedRoom: Room | null;
  setRoom: (id: string) => void;
  people: number;
  setPeople: (n: number) => void;
  travellers: Traveller[];
  setTraveller: (i: number, t: Traveller) => void;
  selectedAddOns: string[];
  toggleAddOn: (id: string) => void;
  insurance: boolean;
  setInsurance: (v: boolean) => void;
  paymentType: 'deposit' | 'full';
  setPaymentType: (t: 'deposit' | 'full') => void;
  forceFullPayment: boolean;
  summary: { subtotal: number; insurance: number; discount: number; total: number };
  reset: () => void;
  duration: string;
  setDuration: (d: string) => void;
  roomAssignments: Record<string, number>;
  setRoomAssignments: (assignments: Record<string, number>) => void;
  addOnCounts: Record<string, number>;
  setAddOnCount: (id: string, count: number) => void;
  clearRoomData: () => void;
  clearAddOnData: () => void;
  clearTravellerData: () => void;
  clearDateData: () => void;
  discountCode: string;
  setDiscountCode: (code: string) => void;
  appliedDiscount: number;
  setAppliedDiscount: (discount: number) => void;
};

export const useStore = create<State>((set, get) => ({
  destinations: [{ id: '1', name: 'Bali' }],
  packages: [
    {
      id: '3',
      name: 'PACK COACH YOGA',
      price: 495,
      levels: ['beginner', 'intermediate', 'advanced'],
      includedItems: [
        '6 nuits d\'hébergement',
        '7 petits-déjeuners, 6 déjeuners et 6 dîners',
        'Rooftop vue océan dédié au yoga',
        'Sessions de yoga selon votre programme',
        'Cours de surf : 2(jrs) × 2 heures',
        '1 excursion culturelle',
        'Dîner exclusif sur le rooftop + musique live',
        'Transfert aéroport',
      ],
    },
  ],
  rooms: [
    { id: '1', name: 'Tamazirt room - Oubaha', description: 'Tamazirt room - Oubaha', price: 140, capacity: 2, img: '/images/room1.jpg' },
    { id: '2', name: 'Triple room - Oubaha', description: 'Triple room - Oubaha', price: 0, capacity: 2, img: '/images/room2.jpg' },
    { id: '3', name: 'Double room - Oubaha', description: 'Double room - Oubaha', price: 0, capacity: 2, img: '/images/room3.jpg' },
    { id: '4', name: 'Twin room - Oubaha', description: 'Twin room - Oubaha', price: 0, capacity: 2, img: '/images/room4.jpg' },
    { id: '6', name: 'Ayour room - Bigdi', description: 'Ayour room - Bigdi', price: 0, capacity: 2, img: '/images/ayourroom.webp' },
    { id: '7', name: 'Tafokt room - Bigdi', description: 'Tafokt room - Bigdi', price: 70, capacity: 2, img: '/images/room1.jpg' },
    { id: '9', name: 'Akal room - Bigdi', description: 'Akal room - Bigdi', price: 140, capacity: 2, img: '/images/room1.jpg' },
    { id: '10', name: 'Amlal room - Bigdi', description: 'Amlal room - Bigdi', price: 140, capacity: 2, img: '/images/room1.jpg' },
  ],
  addOns: [
    {
      id: '1',
      name: 'Transfer Marrakech Airport → Agadir (Aller)',
      price: 225,
      type: 'per-booking',
      img: '/images/transfer.webp',
      description: 'Minibus privé depuis l\'aéroport de Marrakech jusqu\'à votre hébergement Driftline à Agadir. Transfert confortable et direct pour tout votre groupe.',
    },
    {
      id: '2',
      name: 'Transfer Agadir → Marrakech Airport (Retour)',
      price: 225,
      type: 'per-booking',
      img: '/images/transfer.webp',
      description: 'Minibus privé depuis votre hébergement Driftline à Agadir jusqu\'à l\'aéroport de Marrakech. Transfert retour confortable et direct pour tout votre groupe.',
    },
    {
      id: '3',
      name: 'Transfer Agadir Airport ↔ Driftline (Aller-Retour)',
      price: 0,
      type: 'per-booking',
      img: '/images/transfer.webp',
      description: 'Navette gratuite entre l\'aéroport d\'Agadir et le camp Driftline, disponible à l\'arrivée et au départ. Inclus dans votre séjour.',
    },
  ],
  selectedPackage: null,
  surfLevel: '',
  setSurfLevel: (level) => set({ surfLevel: level }),
  setPackage: (id) => set(state => ({ selectedPackage: state.packages.find(p => p.id === id) || null })),
  arrivalDate: '',
  setArrivalDate: (date) => set({ arrivalDate: date }),
  selectedRoom: null,
  setRoom: (id) => set(state => ({ selectedRoom: state.rooms.find(r => r.id === id) || null })),
  people: 1,
  setPeople: (n) => set({ people: n }),
  travellers: [{ name: '' }],
  setTraveller: (i, t) => set(state => {
    const arr = [...state.travellers];
    arr[i] = t;
    return { travellers: arr };
  }),
  selectedAddOns: [],
  toggleAddOn: (id) => set(state => ({
    selectedAddOns: state.selectedAddOns.includes(id)
      ? state.selectedAddOns.filter(a => a !== id)
      : [...state.selectedAddOns, id],
  })),
  insurance: false,
  setInsurance: (v) => set({ insurance: v }),
  paymentType: 'deposit',
  setPaymentType: (t) => set({ paymentType: t }),
  forceFullPayment: false,
  summary: { subtotal: 0, insurance: 0, discount: 0, total: 0 },
  reset: () => set({
    selectedPackage: null,
    surfLevel: '',
    arrivalDate: '',
    selectedRoom: null,
    people: 1,
    travellers: [{ name: '' }],
    selectedAddOns: [],
    insurance: false,
    paymentType: 'deposit',
    forceFullPayment: false,
    summary: { subtotal: 0, insurance: 0, discount: 0, total: 0 },
    discountCode: '',
    appliedDiscount: 0,
  }),
  duration: '1w',
  setDuration: (d) => set({ duration: d }),
  roomAssignments: {},
  setRoomAssignments: (assignments) => set({ roomAssignments: assignments }),
  addOnCounts: {},
  setAddOnCount: (id, count) => set(state => {
    const next = { ...state.addOnCounts, [id]: count };
    // Remove from selectedAddOns if count is 0
    let selectedAddOns = state.selectedAddOns;
    if (count === 0) {
      selectedAddOns = selectedAddOns.filter(a => a !== id);
    } else if (!selectedAddOns.includes(id)) {
      selectedAddOns = [...selectedAddOns, id];
    }
    return { addOnCounts: next, selectedAddOns };
  }),
  clearRoomData: () => set({ selectedRoom: null, roomAssignments: {} }),
  clearAddOnData: () => set({ selectedAddOns: [], addOnCounts: {} }),
  clearTravellerData: () => set({ travellers: [{ name: '' }] }),
  clearDateData: () => set({ arrivalDate: '' }),
  discountCode: '',
  setDiscountCode: (code) => set({ discountCode: code }),
  appliedDiscount: 0,
  setAppliedDiscount: (discount) => set({ appliedDiscount: discount }),
}));

// Price calculation and forceFullPayment logic
useStore.subscribe((state) => {
  const pkg = state.selectedPackage;
  // Calculate room prices based on roomAssignments (multiple rooms can be selected)
  let roomTotal = 0;
  Object.entries(state.roomAssignments).forEach(([roomId, assignedPeople]) => {
    if (assignedPeople > 0) {
      const room = state.rooms.find(r => r.id === roomId);
      if (room) {
        roomTotal += room.price * assignedPeople;
      }
    }
  });
  // const nights = 7;
  let subtotal = 0;
  if (pkg) subtotal += pkg.price * state.people;
  subtotal += roomTotal;
  subtotal += state.addOns.reduce((sum, addOn) => {
    if (addOn.type === 'per-person') {
      const count = state.addOnCounts[addOn.id] || 0;
      return sum + addOn.price * count;
    } else if (addOn.type === 'per-booking' && state.selectedAddOns.includes(addOn.id)) {
      return sum + addOn.price;
    }
    return sum;
  }, 0);
  let insurance = state.insurance ? Math.round(subtotal * 0.15) : 0;
  let subtotalWithInsurance = subtotal + insurance;
  
  // Apply discount (15% for code "TEST")
  let discount = 0;
  if (state.appliedDiscount > 0) {
    discount = Math.round(subtotalWithInsurance * (state.appliedDiscount / 100));
  }
  
  let total = subtotalWithInsurance - discount;

  // Only mark forceFullPayment as info (used to show a warning note in UI)
  // but NEVER override the user's chosen paymentType
  let forceFull = false;
  if (state.arrivalDate) {
    const arrival = new Date(state.arrivalDate);
    const now = new Date();
    const diff = (arrival.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    if (diff <= 3) forceFull = true; // only truly last-minute (3 days or less)
  }

  // Only update if values have changed
  const { summary, forceFullPayment } = state;
  if (
    summary.subtotal !== subtotal ||
    summary.insurance !== insurance ||
    summary.discount !== discount ||
    summary.total !== total ||
    forceFullPayment !== forceFull
  ) {
    useStore.setState({
      summary: { subtotal, insurance, discount, total },
      forceFullPayment: forceFull,
      // Never override paymentType — user's choice (deposit or full) is always respected
    });
  }
}); 