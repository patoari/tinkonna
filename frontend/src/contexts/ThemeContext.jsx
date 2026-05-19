import { createContext, useContext, useState, useEffect } from 'react'
import api from '../lib/axios'

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const [activeTheme, setActiveTheme] = useState(null)
  const [flyingSymbols, setFlyingSymbols] = useState([])

  useEffect(() => {
    api.get('/public/active-theme')
      .then(res => {
        setActiveTheme(res.data)
        if (res.data?.flying_symbols_enabled) {
          generateFlyingSymbols(res.data)
        }
      })
      .catch(() => {})
  }, [])

  const generateFlyingSymbols = (theme) => {
    const icons = theme.icons || []
    const defaultSymbols = getDefaultSymbols(theme.occasion)
    const symbolPool = icons.length > 0
      ? icons.map(i => ({ type: 'image', src: i.url }))
      : defaultSymbols

    const count = Math.min(theme.max_flying_symbols || 15, 15)
    const symbols = Array.from({ length: count }, (_, i) => ({
      id: i,
      symbol: symbolPool[i % symbolPool.length],
      left: Math.random() * 100,
      delay: Math.random() * 10,
      duration: 8 + Math.random() * 12,
      size: 20 + Math.random() * 30,
    }))
    setFlyingSymbols(symbols)
  }

  const getDefaultSymbols = (occasion) => {
    const symbolMap = {
      'eid_ul_fitr': ['🌙', '⭐', '🪔', '✨'],
      'eid_ul_adha': ['🌙', '⭐', '🐑', '✨'],
      'pohela_boishakh': ['🥭', '🌸', '🌺', '🎋'],
      'independence_day': ['🇧🇩', '🌟', '🕊️', '🎉'],
      'victory_day': ['🇧🇩', '🌟', '🏆', '🎊'],
      'mother_language_day': ['📚', '✏️', '🔤', '📖'],
    }
    return (symbolMap[occasion] || ['✨', '⭐', '🌟']).map(s => ({ type: 'emoji', char: s }))
  }

  return (
    <ThemeContext.Provider value={{ activeTheme, flyingSymbols }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
