import { createContext, useContext, useState, useEffect } from 'react'
import api from '../lib/axios'

const SiteSettingsContext = createContext({})

export function SiteSettingsProvider({ children }) {
  const [settings, setSettings] = useState({
    site_name: '',
    site_tagline: '',
    site_currency: '',
    site_logo_url: null,
    hero_title: '',
    hero_subtitle: '',
    hero_button_text: '',
    hero_bg_color: '#2563eb',
    hero_show_title: '1',
    hero_show_search: '1',
    hero_show_buttons: '1',
    contact_address: '',
    contact_phone: '',
    contact_email: '',
    social_facebook: '',
    social_instagram: '',
    footer_about: '',
    footer_copyright: '',
    meta_title: '',
    featured_products_title: '',
    products_per_page: '8',
  })
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    api.get('/public/settings')
      .then(res => {
        const data = { ...res.data }
        setSettings(prev => ({ ...prev, ...data }))
        applyToDocument(data)
      })
      .catch(() => {})
      .finally(() => setLoaded(true))
  }, [])

  return (
    <SiteSettingsContext.Provider value={{ settings, loaded }}>
      {children}
    </SiteSettingsContext.Provider>
  )
}

function applyToDocument(settings) {
  // Page title
  if (settings.meta_title) {
    document.title = settings.meta_title
  } else if (settings.site_name && settings.site_tagline) {
    document.title = `${settings.site_name} - ${settings.site_tagline}`
  } else if (settings.site_name) {
    document.title = settings.site_name
  }

  // Favicon — prefer uploaded favicon, fallback to site logo
  const iconUrl = settings.favicon_url || settings.site_logo_url
  if (iconUrl) {
    setFavicon(iconUrl)
  }

  // Meta description
  if (settings.meta_description) {
    setMeta('description', settings.meta_description)
  }
}

function setFavicon(url) {
  // Remove all existing favicon links
  document.querySelectorAll("link[rel*='icon']").forEach(el => el.remove())

  const link = document.createElement('link')
  link.rel = 'icon'
  link.type = 'image/png'
  link.href = url
  document.head.appendChild(link)

  // Also set apple-touch-icon
  const apple = document.createElement('link')
  apple.rel = 'apple-touch-icon'
  apple.href = url
  document.head.appendChild(apple)
}

function setMeta(name, content) {
  let el = document.querySelector(`meta[name="${name}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.name = name
    document.head.appendChild(el)
  }
  el.content = content
}

export function useSiteSettings() {
  return useContext(SiteSettingsContext)
}
