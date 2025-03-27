import React, { createContext, useState, useContext, useEffect } from 'react'

const BetCodeContext = createContext()

export function BetCodeProvider({ children }) {
  const [betCodes, setBetCodes] = useState([])
  const [draftCodes, setDraftCodes] = useState([])
  const [selectedCode, setSelectedCode] = useState(null)

  // Load from session storage on mount
  useEffect(() => {
    try {
      const savedBetCodes = sessionStorage.getItem('betCodes')
      const savedDraftCodes = sessionStorage.getItem('draftCodes')

      if (savedBetCodes) {
        setBetCodes(JSON.parse(savedBetCodes))
      }

      if (savedDraftCodes) {
        setDraftCodes(JSON.parse(savedDraftCodes))
      }
    } catch (error) {
      console.error('Error loading from session storage:', error)
    }
  }, [])

  // Save to session storage when state changes
  useEffect(() => {
    try {
      sessionStorage.setItem('betCodes', JSON.stringify(betCodes))
      sessionStorage.setItem('draftCodes', JSON.stringify(draftCodes))
    } catch (error) {
      console.error('Error saving to session storage:', error)
    }
  }, [betCodes, draftCodes])

  // Add a new draft code
  const addDraftCode = (code) => {
    const newDraftCode = {
      id: Date.now().toString(),
      ...code,
      createdAt: new Date().toISOString(),
      isDraft: true,
    }
    setDraftCodes((prev) => [...prev, newDraftCode])
  }

  // Remove a draft code
  const removeDraftCode = (id) => {
    setDraftCodes((prev) => prev.filter((code) => code.id !== id))
  }

  // Edit a draft code
  const editDraftCode = (id, updatedCode) => {
    setDraftCodes((prev) =>
      prev.map((code) => (code.id === id ? { ...code, ...updatedCode } : code))
    )
  }

  // Confirm draft codes and add them to the main list
  const confirmDraftCodes = () => {
    const confirmedCodes = draftCodes.map((code) => ({
      ...code,
      isDraft: false,
      confirmedAt: new Date().toISOString(),
    }))

    setBetCodes((prev) => [...prev, ...confirmedCodes])
    setDraftCodes([])
  }

  // Remove a confirmed code
  const removeBetCode = (id) => {
    setBetCodes((prev) => prev.filter((code) => code.id !== id))
  }

  const value = {
    betCodes,
    draftCodes,
    selectedCode,
    setSelectedCode,
    addDraftCode,
    removeDraftCode,
    editDraftCode,
    confirmDraftCodes,
    removeBetCode,
  }

  return (
    <BetCodeContext.Provider value={value}>{children}</BetCodeContext.Provider>
  )
}

export function useBetCode() {
  const context = useContext(BetCodeContext)
  if (context === undefined) {
    throw new Error('useBetCode must be used within a BetCodeProvider')
  }
  return context
}
