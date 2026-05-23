import { create } from 'zustand'

export const useEmergencyStore = create((set, get) => ({
  isEmergency: false,
  sosCountdown: null,
  alertPhase: 'idle', // idle | countdown | transmitting | transmitted
  sosContacts: [
    { name: 'आई (Mom)', phone: '+91 98XXX XXXXX', status: 'ready' },
    { name: 'Police Control', phone: '112', status: 'ready' },
    { name: 'Women Helpline', phone: '181', status: 'ready' },
  ],

  activateSOS: () => {
    set({ isEmergency: true, alertPhase: 'countdown', sosCountdown: 3 })
    const interval = setInterval(() => {
      const { sosCountdown } = get()
      if (sosCountdown <= 1) {
        clearInterval(interval)
        set({ sosCountdown: 0, alertPhase: 'transmitting' })
        setTimeout(() => {
          set({ alertPhase: 'transmitted' })
        }, 2000)
      } else {
        set({ sosCountdown: sosCountdown - 1 })
      }
    }, 1000)
  },

  resetSOS: () => {
    set({ isEmergency: false, sosCountdown: null, alertPhase: 'idle' })
  },
}))
