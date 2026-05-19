import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Store, Eye, EyeOff } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useAuth } from '../../contexts/AuthContext'
import { useSiteSettings } from '../../contexts/SiteSettingsContext'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import toast from 'react-hot-toast'

export default function Login() {
  const { login } = useAuth()
  const { settings } = useSiteSettings()
  const navigate = useNavigate()
  const location = useLocation()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm()

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const user = await login({ login: data.login, password: data.password })
      toast.success(`Welcome back, ${user.name}!`)

      const from = location.state?.from?.pathname
      if (user.user_type === 'customer') {
        navigate(from || '/')
      } else {
        navigate(from || '/admin/dashboard')
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.errors?.login?.[0] || 'Invalid credentials'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          {settings.site_logo_url ? (
            <div className="w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <img 
                src={settings.site_logo_url} 
                alt={settings.site_name || 'Logo'} 
                className="max-w-full max-h-full object-contain"
                onError={(e) => {
                  console.error('Logo failed to load:', settings.site_logo_url)
                  e.target.style.display = 'none'
                  e.target.parentElement.innerHTML = `<div class="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg"><svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg></div>`
                }}
              />
            </div>
          ) : (
            <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Store size={28} className="text-white" />
            </div>
          )}
          <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
          <p className="text-gray-500 text-sm mt-1">Sign in to your {settings.site_name || 'Shop'} account</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Email or Phone"
              type="text"
              placeholder="Enter your email or phone"
              required
              error={errors.login?.message}
              {...register('login', { required: 'Email or phone is required' })}
            />
            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                required
                error={errors.password?.message}
                {...register('password', { required: 'Password is required' })}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <Button type="submit" fullWidth size="lg" loading={loading}>
              Sign In
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="text-blue-600 font-medium hover:text-blue-700">
                Create account
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          <Link to="/" className="hover:text-gray-600">← Back to homepage</Link>
        </p>
      </div>
    </div>
  )
}
