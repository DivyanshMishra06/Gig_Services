// Replace these mock records with chat API responses when messaging is connected.
export const mockConversations = [
  {
    providerId: 'ramesh-kumar',
    providerName: 'Ramesh Kumar',
    providerSkill: 'Plumbing',
    phone: '9876543210',
    lastMessage: 'I can be there by 10 AM.',
    updatedAt: '10:42 AM',
    messages: [
      { id: 'r-1', sender: 'provider', text: 'Hello! How can I help with your plumbing issue?', timestamp: '10:35 AM' },
      { id: 'r-2', sender: 'customer', text: 'There is a leak under my kitchen sink.', timestamp: '10:38 AM' },
      { id: 'r-3', sender: 'provider', text: 'I can be there by 10 AM.', timestamp: '10:42 AM' }
    ]
  },
  {
    providerId: 'priya-sharma',
    providerName: 'Priya Sharma',
    providerSkill: 'Home Cleaning',
    phone: '9876543212',
    lastMessage: 'Thank you. See you tomorrow!',
    updatedAt: 'Yesterday',
    messages: [
      { id: 'p-1', sender: 'customer', text: 'Could you help with a deep clean tomorrow?', timestamp: '4:05 PM' },
      { id: 'p-2', sender: 'provider', text: 'Thank you. See you tomorrow!', timestamp: '4:12 PM' }
    ]
  }
];

export const createConversationFromProvider = (provider) => ({
  providerId: provider._id,
  providerName: provider.userName || provider.userId?.name || 'Service provider',
  providerSkill: provider.primarySkill || 'Gig services',
  phone: provider.userPhone || provider.userId?.phone || '9876543210',
  lastMessage: 'Start a conversation with this provider.',
  updatedAt: 'New',
  messages: []
});
