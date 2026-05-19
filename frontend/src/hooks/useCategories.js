import { useState, useEffect } from 'react'
import api from '../lib/axios'

// Cache categories in module scope so we only fetch once per session
const cache = { public: null, admin: null }
const promise = { public: null, admin: null }

export function useCategories({ adminAll = false } = {}) {
  const key = adminAll ? 'admin' : 'public'
  const [categories, setCategories] = useState(cache[key] || [])
  const [loading, setLoading] = useState(!cache[key])

  useEffect(() => {
    if (cache[key]) { setCategories(cache[key]); setLoading(false); return }

    if (!promise[key]) {
      promise[key] = api.get(adminAll ? '/categories' : '/public/categories')
        .then(res => { cache[key] = res.data; return res.data })
        .catch(() => [])
    }

    promise[key].then(data => {
      setCategories(data)
      setLoading(false)
    })
  }, [adminAll, key])

  const refresh = () => {
    cache[key] = null
    promise[key] = null
    setLoading(true)
    api.get(adminAll ? '/categories' : '/public/categories')
      .then(res => { cache[key] = res.data; setCategories(res.data) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  return { categories, loading, refresh }
}
