import { Outlet } from 'react-router-dom'
import PublicNavbar from './PublicNavbar'
import PublicFooter from './PublicFooter'
import FlyingSymbols from '../FlyingSymbols'
import { useTheme } from '../../contexts/ThemeContext'

export default function PublicLayout() {
  const { activeTheme, flyingSymbols } = useTheme()

  return (
    <div className="min-h-screen flex flex-col" style={activeTheme?.css_variables ? buildCssVars(activeTheme.css_variables) : {}}>
      {/* Flying symbols layer - behind everything */}
      {activeTheme?.flying_symbols_enabled && flyingSymbols.length > 0 && (
        <FlyingSymbols symbols={flyingSymbols} />
      )}
      <PublicNavbar />
      <main className="flex-1 relative">
        <Outlet />
      </main>
      <PublicFooter />
    </div>
  )
}

function buildCssVars(vars) {
  const style = {}
  Object.entries(vars).forEach(([key, value]) => {
    style[`--theme-${key}`] = value
  })
  return style
}
