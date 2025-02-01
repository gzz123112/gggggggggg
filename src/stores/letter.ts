import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface Letter {
  id: string
  content: string
  createdAt: string
  scheduledAt: string
  status: 'draft' | 'scheduled' | 'sent'
}

export const useLetterStore = defineStore('letter', () => {
  const letters = ref<Letter[]>([])
  const currentLetter = ref<Letter | null>(null)

  const saveLetter = (letter: Omit<Letter, 'id'>) => {
    const newLetter = {
      ...letter,
      id: Date.now().toString()
    }
    letters.value.push(newLetter)
  }

  const updateLetter = (id: string, updates: Partial<Letter>) => {
    const index = letters.value.findIndex(letter => letter.id === id)
    if (index > -1) {
      letters.value[index] = { ...letters.value[index], ...updates }
    }
  }

  const deleteLetter = (id: string) => {
    const index = letters.value.findIndex(letter => letter.id === id)
    if (index > -1) {
      letters.value.splice(index, 1)
    }
  }

  // 检查是否有需要发送的信件
  const checkScheduledLetters = () => {
    const now = new Date()
    letters.value.forEach(letter => {
      if (
        letter.status === 'scheduled' && 
        new Date(letter.scheduledAt) <= now
      ) {
        updateLetter(letter.id, { status: 'sent' })
      }
    })
  }

  // 定期检查需要发送的信件
  setInterval(checkScheduledLetters, 60000) // 每分钟检查一次

  return {
    letters,
    currentLetter,
    saveLetter,
    updateLetter,
    deleteLetter
  }
}) 