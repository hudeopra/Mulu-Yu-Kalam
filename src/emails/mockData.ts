export interface DemoBookingData {
  name: string;
  email: string;
  number: string;
  tattooLocation: string;
  appointmentDate: string;
  appointmentTime: string;
  notes: string;
  referenceImageUrls: string[];
  submissionTime: string;
}

export const mockBookingData: DemoBookingData = {
  name: 'Rashmi Maharjan',
  email: 'rashmi.maharjan@example.com',
  number: '+977 9861341995',
  tattooLocation: 'Forearm',
  appointmentDate: 'November 12, 2026',
  appointmentTime: '2:00 PM',
  notes:
    'Mandala sleeve concept with fine-line shading. Inspired by traditional Newari wood carving motifs.',
  referenceImageUrls: [
    'https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1597852075234-fd721ac361d3?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D',
    'https://plus.unsplash.com/premium_photo-1707674004083-ca21b6aaca38?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D',
  ],
  submissionTime: 'Oct 16, 2026, 2:00 PM',
};
