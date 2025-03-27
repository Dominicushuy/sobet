// src/contexts/BetCodeContext.jsx
import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
  useReducer,
} from 'react'
import betCodeService from '../services/betCodeService'

// Định nghĩa action types
const ACTION_TYPES = {
  INIT_CODES: 'INIT_CODES',
  ADD_DRAFT: 'ADD_DRAFT',
  REMOVE_DRAFT: 'REMOVE_DRAFT',
  EDIT_DRAFT: 'EDIT_DRAFT',
  CONFIRM_ALL_DRAFTS: 'CONFIRM_ALL_DRAFTS',
  CONFIRM_DRAFT: 'CONFIRM_DRAFT',
  REMOVE_CODE: 'REMOVE_CODE',
  EDIT_CODE: 'EDIT_CODE',
  SELECT_CODE: 'SELECT_CODE',
  CLEAR_SELECTION: 'CLEAR_SELECTION',
  BATCH_DELETE: 'BATCH_DELETE',
  SORT_CODES: 'SORT_CODES',
  FILTER_CODES: 'FILTER_CODES',
}

// Reducer để quản lý state
const betCodeReducer = (state, action) => {
  switch (action.type) {
    case ACTION_TYPES.INIT_CODES:
      return {
        ...state,
        betCodes: action.payload.betCodes || [],
        draftCodes: action.payload.draftCodes || [],
        isInitialized: true,
      }

    case ACTION_TYPES.ADD_DRAFT: {
      // Kiểm tra mã cược trùng lặp
      const isDuplicate = state.draftCodes.some(
        (code) => code.originalText === action.payload.originalText
      )
      if (isDuplicate) {
        return state
      }
      return {
        ...state,
        draftCodes: [
          ...state.draftCodes,
          {
            ...action.payload,
            id: action.payload.id || Date.now().toString(),
            createdAt: action.payload.createdAt || new Date().toISOString(),
            isDraft: true,
            status: 'pending',
          },
        ],
        lastOperation: {
          type: 'add_draft',
          timestamp: new Date().toISOString(),
        },
      }
    }

    case ACTION_TYPES.REMOVE_DRAFT:
      return {
        ...state,
        draftCodes: state.draftCodes.filter(
          (code) => code.id !== action.payload.id
        ),
        lastOperation: {
          type: 'remove_draft',
          timestamp: new Date().toISOString(),
          codeId: action.payload.id,
        },
      }

    case ACTION_TYPES.EDIT_DRAFT:
      return {
        ...state,
        draftCodes: state.draftCodes.map((code) =>
          code.id === action.payload.id
            ? {
                ...code,
                ...action.payload.updates,
                updatedAt: new Date().toISOString(),
              }
            : code
        ),
        lastOperation: {
          type: 'edit_draft',
          timestamp: new Date().toISOString(),
          codeId: action.payload.id,
        },
      }

    case ACTION_TYPES.CONFIRM_ALL_DRAFTS: {
      if (state.draftCodes.length === 0) return state

      const confirmedCodes = state.draftCodes.map((code) => ({
        ...code,
        isDraft: false,
        status: 'confirmed',
        confirmedAt: new Date().toISOString(),
      }))

      return {
        ...state,
        betCodes: [...state.betCodes, ...confirmedCodes],
        draftCodes: [],
        lastOperation: {
          type: 'confirm_all',
          timestamp: new Date().toISOString(),
          count: confirmedCodes.length,
        },
      }
    }

    case ACTION_TYPES.CONFIRM_DRAFT: {
      const draftToConfirm = state.draftCodes.find(
        (code) => code.id === action.payload.id
      )
      if (!draftToConfirm) return state

      const confirmedCode = {
        ...draftToConfirm,
        isDraft: false,
        status: 'confirmed',
        confirmedAt: new Date().toISOString(),
      }

      return {
        ...state,
        betCodes: [...state.betCodes, confirmedCode],
        draftCodes: state.draftCodes.filter(
          (code) => code.id !== action.payload.id
        ),
        lastOperation: {
          type: 'confirm_single',
          timestamp: new Date().toISOString(),
          codeId: action.payload.id,
        },
      }
    }

    case ACTION_TYPES.REMOVE_CODE:
      return {
        ...state,
        betCodes: state.betCodes.filter(
          (code) => code.id !== action.payload.id
        ),
        lastOperation: {
          type: 'remove_code',
          timestamp: new Date().toISOString(),
          codeId: action.payload.id,
        },
      }

    case ACTION_TYPES.EDIT_CODE:
      return {
        ...state,
        betCodes: state.betCodes.map((code) =>
          code.id === action.payload.id
            ? {
                ...code,
                ...action.payload.updates,
                updatedAt: new Date().toISOString(),
              }
            : code
        ),
        lastOperation: {
          type: 'edit_code',
          timestamp: new Date().toISOString(),
          codeId: action.payload.id,
        },
      }

    case ACTION_TYPES.SELECT_CODE:
      return {
        ...state,
        selectedCodeId: action.payload.id,
      }

    case ACTION_TYPES.CLEAR_SELECTION:
      return {
        ...state,
        selectedCodeId: null,
      }

    case ACTION_TYPES.BATCH_DELETE:
      return {
        ...state,
        betCodes: state.betCodes.filter(
          (code) => !action.payload.ids.includes(code.id)
        ),
        draftCodes: state.draftCodes.filter(
          (code) => !action.payload.ids.includes(code.id)
        ),
        lastOperation: {
          type: 'batch_delete',
          timestamp: new Date().toISOString(),
          count: action.payload.ids.length,
        },
      }

    case ACTION_TYPES.SORT_CODES: {
      const { field, direction } = action.payload
      const sortedBetCodes = [...state.betCodes].sort((a, b) => {
        let valA = a[field]
        let valB = b[field]

        // Handle special cases for date fields
        if (
          field.toLowerCase().includes('date') ||
          field.toLowerCase().includes('at')
        ) {
          valA = new Date(valA || 0).getTime()
          valB = new Date(valB || 0).getTime()
        }

        // Handle numeric values
        if (typeof valA === 'number' && typeof valB === 'number') {
          return direction === 'asc' ? valA - valB : valB - valA
        }

        // Handle string values
        if (String(valA).localeCompare) {
          return direction === 'asc'
            ? String(valA).localeCompare(String(valB))
            : String(valB).localeCompare(String(valA))
        }

        return 0
      })

      return {
        ...state,
        betCodes: sortedBetCodes,
        sortConfig: { field, direction },
      }
    }

    case ACTION_TYPES.FILTER_CODES:
      return {
        ...state,
        filterCriteria: action.payload.criteria,
      }

    default:
      return state
  }
}

// Trạng thái khởi tạo
const initialState = {
  betCodes: [], // Các mã cược đã xác nhận
  draftCodes: [], // Các mã cược nháp
  selectedCodeId: null, // ID của mã cược đang được chọn
  isInitialized: false, // Đã khởi tạo từ storage chưa
  lastOperation: null, // Thông tin về thao tác cuối cùng
  sortConfig: {
    // Cấu hình sắp xếp
    field: 'createdAt',
    direction: 'desc',
  },
  filterCriteria: null, // Tiêu chí lọc
}

const BetCodeContext = createContext()

export function BetCodeProvider({ children }) {
  const [state, dispatch] = useReducer(betCodeReducer, initialState)
  const { betCodes, draftCodes, selectedCodeId, isInitialized } = state

  // Load from session storage on mount
  useEffect(() => {
    try {
      const savedBetCodes = sessionStorage.getItem('betCodes')
      const savedDraftCodes = sessionStorage.getItem('draftCodes')

      dispatch({
        type: ACTION_TYPES.INIT_CODES,
        payload: {
          betCodes: savedBetCodes ? JSON.parse(savedBetCodes) : [],
          draftCodes: savedDraftCodes ? JSON.parse(savedDraftCodes) : [],
        },
      })
    } catch (error) {
      console.error('Error loading from session storage:', error)
      // Initialize with empty arrays if error
      dispatch({
        type: ACTION_TYPES.INIT_CODES,
        payload: { betCodes: [], draftCodes: [] },
      })
    }
  }, [])

  // Save to session storage when state changes
  useEffect(() => {
    if (!isInitialized) return

    try {
      sessionStorage.setItem('betCodes', JSON.stringify(betCodes))
      sessionStorage.setItem('draftCodes', JSON.stringify(draftCodes))
    } catch (error) {
      console.error('Error saving to session storage:', error)
    }
  }, [betCodes, draftCodes, isInitialized])

  // Add a new draft code
  const addDraftCode = useCallback((code) => {
    dispatch({
      type: ACTION_TYPES.ADD_DRAFT,
      payload: code,
    })
  }, [])

  // Remove a draft code
  const removeDraftCode = useCallback((id) => {
    dispatch({
      type: ACTION_TYPES.REMOVE_DRAFT,
      payload: { id },
    })
  }, [])

  // Edit a draft code
  const editDraftCode = useCallback((id, updates) => {
    dispatch({
      type: ACTION_TYPES.EDIT_DRAFT,
      payload: { id, updates },
    })
  }, [])

  // Confirm all draft codes
  const confirmDraftCodes = useCallback(() => {
    dispatch({
      type: ACTION_TYPES.CONFIRM_ALL_DRAFTS,
    })
  }, [])

  // Confirm a single draft code
  const confirmDraftCode = useCallback((id) => {
    dispatch({
      type: ACTION_TYPES.CONFIRM_DRAFT,
      payload: { id },
    })
  }, [])

  // Remove a confirmed code
  const removeBetCode = useCallback((id) => {
    dispatch({
      type: ACTION_TYPES.REMOVE_CODE,
      payload: { id },
    })
  }, [])

  // Update a confirmed code
  const updateBetCode = useCallback((id, updates) => {
    dispatch({
      type: ACTION_TYPES.EDIT_CODE,
      payload: { id, updates },
    })
  }, [])

  // Select a code
  const selectBetCode = useCallback((id) => {
    dispatch({
      type: ACTION_TYPES.SELECT_CODE,
      payload: { id },
    })
  }, [])

  // Clear selection
  const clearSelection = useCallback(() => {
    dispatch({
      type: ACTION_TYPES.CLEAR_SELECTION,
    })
  }, [])

  // Batch delete codes
  const batchDeleteCodes = useCallback((ids) => {
    dispatch({
      type: ACTION_TYPES.BATCH_DELETE,
      payload: { ids },
    })
  }, [])

  // Sort codes
  const sortCodes = useCallback((field, direction = 'desc') => {
    dispatch({
      type: ACTION_TYPES.SORT_CODES,
      payload: { field, direction },
    })
  }, [])

  // Filter codes
  const filterCodes = useCallback((criteria) => {
    dispatch({
      type: ACTION_TYPES.FILTER_CODES,
      payload: { criteria },
    })
  }, [])

  // Get a specific bet code by id
  const getBetCode = useCallback(
    (id) => {
      const fromDrafts = draftCodes.find((code) => code.id === id)
      if (fromDrafts) return fromDrafts

      const fromConfirmed = betCodes.find((code) => code.id === id)
      return fromConfirmed
    },
    [betCodes, draftCodes]
  )

  // Get currently selected bet code
  const getSelectedBetCode = useCallback(() => {
    if (!selectedCodeId) return null
    return getBetCode(selectedCodeId)
  }, [selectedCodeId, getBetCode])

  // Get total statistics
  const getStatistics = useCallback(() => {
    const totalBetCodes = betCodes.length
    const totalDraftCodes = draftCodes.length

    // Calculate total stake and potential amounts
    const totalStake = betCodes.reduce(
      (sum, code) => sum + (code.stakeAmount || 0),
      0
    )
    const totalPotential = betCodes.reduce(
      (sum, code) => sum + (code.potentialWinning || 0),
      0
    )

    // Count by station
    const stationCounts = {}
    betCodes.forEach((code) => {
      const stationName = code.station?.name || 'Unknown'
      stationCounts[stationName] = (stationCounts[stationName] || 0) + 1
    })

    return {
      totalBetCodes,
      totalDraftCodes,
      totalStake,
      totalPotential,
      stationCounts,
    }
  }, [betCodes, draftCodes])

  // Filter codes with the current filter criteria
  const getFilteredCodes = useCallback(() => {
    const { filterCriteria } = state
    if (!filterCriteria) return betCodes

    return betCodes.filter((code) => {
      // Filter by station
      if (
        filterCriteria.station &&
        code.station?.name !== filterCriteria.station
      ) {
        return false
      }

      // Filter by date range
      if (filterCriteria.dateFrom || filterCriteria.dateTo) {
        const codeDate = new Date(code.createdAt).getTime()

        if (filterCriteria.dateFrom) {
          const fromDate = new Date(filterCriteria.dateFrom).getTime()
          if (codeDate < fromDate) return false
        }

        if (filterCriteria.dateTo) {
          const toDate = new Date(filterCriteria.dateTo).getTime()
          if (codeDate > toDate) return false
        }
      }

      // Filter by amount range
      if (
        filterCriteria.minAmount &&
        code.stakeAmount < filterCriteria.minAmount
      ) {
        return false
      }

      if (
        filterCriteria.maxAmount &&
        code.stakeAmount > filterCriteria.maxAmount
      ) {
        return false
      }

      // Filter by text
      if (filterCriteria.searchText) {
        const searchText = filterCriteria.searchText.toLowerCase()
        const codeText = (code.originalText || '').toLowerCase()
        const stationName = (code.station?.name || '').toLowerCase()

        if (
          !codeText.includes(searchText) &&
          !stationName.includes(searchText)
        ) {
          return false
        }
      }

      return true
    })
  }, [state, betCodes])

  // Analyze a new bet code without adding it
  const analyzeBetCode = useCallback((text) => {
    return betCodeService.analyzeBetCode(text)
  }, [])

  const value = {
    betCodes,
    draftCodes,
    isInitialized,
    selectedCodeId,
    addDraftCode,
    removeDraftCode,
    editDraftCode,
    confirmDraftCodes,
    confirmDraftCode,
    removeBetCode,
    updateBetCode,
    getBetCode,
    selectBetCode,
    clearSelection,
    getSelectedBetCode,
    batchDeleteCodes,
    sortCodes,
    filterCodes,
    getStatistics,
    getFilteredCodes,
    analyzeBetCode,
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
