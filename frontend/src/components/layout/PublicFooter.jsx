import { Link } from 'react-router-dom'
import { Phone, Mail, MapPin, Facebook, Instagram, Youtube } from 'lucide-react'
import { useSiteSettings } from '../../contexts/SiteSettingsContext'
import { useCategories } from '../../hooks/useCategories'

export default function PublicFooter() {
  const { settings } = useSiteSettings()
  const { categories } = useCategories()

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              {settings.site_logo_url && (
                <div className="w-12 sm:w-14 h-12 sm:h-14 rounded-full flex items-center justify-center overflow-hidden shrink-0 shadow-sm bg-white border border-gray-700">
                  <img src={settings.site_logo_url} alt="logo" className="w-9 sm:w-11 h-9 sm:h-11 object-contain" />
                </div>
              )}
              <div>
                {settings.site_name && <p className="font-bold text-white text-sm">{settings.site_name}</p>}
                {settings.site_tagline && <p className="text-xs text-gray-400">{settings.site_tagline}</p>}
              </div>
            </div>
            <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
              {settings.footer_about}
            </p>
            <div className="flex gap-2 sm:gap-3 mt-4">
              {settings.social_facebook && (
                <a href={settings.social_facebook} target="_blank" rel="noopener noreferrer"
                  className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors">
                  <Facebook size={15} />
                </a>
              )}
              {settings.social_instagram && (
                <a href={settings.social_instagram} target="_blank" rel="noopener noreferrer"
                  className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-pink-600 transition-colors">
                  <Instagram size={15} />
                </a>
              )}
              {settings.social_youtube && (
                <a href={settings.social_youtube} target="_blank" rel="noopener noreferrer"
                  className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-red-600 transition-colors">
                  <Youtube size={15} />
                </a>
              )}
              {/* show placeholder icons if none set */}
              {!settings.social_facebook && !settings.social_instagram && (
                <>
                  <a href="#" className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors"><Facebook size={15} /></a>
                  <a href="#" className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-pink-600 transition-colors"><Instagram size={15} /></a>
                </>
              )}
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-semibold text-white mb-3 sm:mb-4 text-xs sm:text-sm">Categories</h4>
            <ul className="space-y-1.5 sm:space-y-2">
              {categories.slice(0, 5).map(cat => (
                <li key={cat.id}>
                  <Link to={`/products?category=${cat.slug}`}
                    className="text-xs sm:text-sm text-gray-400 hover:text-white transition-colors">
                    {cat.icon ? cat.icon + ' ' : ''}{cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-white mb-3 sm:mb-4 text-xs sm:text-sm">Quick Links</h4>
            <ul className="space-y-1.5 sm:space-y-2">
              <li><Link to="/" className="text-xs sm:text-sm text-gray-400 hover:text-white transition-colors">Home</Link></li>
              <li><Link to="/products" className="text-xs sm:text-sm text-gray-400 hover:text-white transition-colors">Products</Link></li>
              <li><Link to="/login" className="text-xs sm:text-sm text-gray-400 hover:text-white transition-colors">Login</Link></li>
              <li><Link to="/register" className="text-xs sm:text-sm text-gray-400 hover:text-white transition-colors">Register</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="col-span-2 sm:col-span-2 md:col-span-1">
            <h4 className="font-semibold text-white mb-3 sm:mb-4 text-xs sm:text-sm">Contact</h4>
            <ul className="space-y-2 sm:space-y-3">
              {settings.contact_address && (
                <li className="flex items-start gap-2 sm:gap-2.5 text-xs sm:text-sm text-gray-400">
                  <MapPin size={14} className="mt-0.5 shrink-0 text-blue-400" />
                  <span className="break-words">{settings.contact_address}</span>
                </li>
              )}
              {settings.contact_phone && (
                <li className="flex items-center gap-2 sm:gap-2.5 text-xs sm:text-sm text-gray-400">
                  <Phone size={14} className="shrink-0 text-blue-400" />
                  {settings.contact_phone}
                </li>
              )}
              {settings.contact_email && (
                <li className="flex items-center gap-2 sm:gap-2.5 text-xs sm:text-sm text-gray-400">
                  <Mail size={14} className="shrink-0 text-blue-400" />
                  <span className="break-all">{settings.contact_email}</span>
                </li>
              )}
              {settings.business_hours && (
                <li className="text-xs text-gray-500 mt-1">{settings.business_hours}</li>
              )}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-6 sm:mt-10 pt-4 sm:pt-6 flex items-center justify-center">
          <p className="text-xs text-gray-500 text-center">{settings.footer_copyright}</p>
        </div>
      </div>
    </footer>
  )
}
