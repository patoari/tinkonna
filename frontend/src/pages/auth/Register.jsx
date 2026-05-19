import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Store, Eye, EyeOff } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useAuth } from '../../contexts/AuthContext'
import { useSiteSettings } from '../../contexts/SiteSettingsContext'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import toast from 'react-hot-toast'

export default function Register() {
  const { register: registerUser } = useAuth()
  const { settings } = useSiteSettings()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, watch, formState: { errors } } = useForm()
  const password = watch('password')
  const email = watch('email')
  const phone = watch('phone')

  const onSubmit = async (data) => {
    // CRITICAL FIX: Validate email OR phone is provided
    if (!data.email && !data.phone) {
      toast.error('Please provide either email or phone number')
      return
    }
    
    setLoading(true)
    try {
      await registerUser({
        name: data.name,
        email: data.email || undefined,
        phone: data.phone || undefined,
        password: data.password,
        password_confirmation: data.password_confirmation,
      })
      toast.success('Account created successfully!')
      navigate('/')
    } catch (err) {
      const errors = err.response?.data?.errors
      if (errors) {
        const firstError = Object.values(errors)[0]?.[0]
        toast.error(firstError || 'Registration failed')
      } else {
        toast.error(err.response?.data?.message || 'Registration failed')
      }
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
          <h1 className="text-2xl font-bold text-gray-900">Create account</h1>
          <p className="text-gray-500 text-sm mt-1">Join {settings.site_name || 'Shop'} today</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              placeholder="Your full name"
              required
              error={errors.name?.message}
              {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'Name too short' } })}
            />
            <Input
              label="Email Address"
              type="email"
              placeholder="your@email.com"
              hint="Required if phone is not provided"
              error={errors.email?.message}
              {...register('email', {
                validate: (value) => {
                  if (!value && !phone) return 'Email or phone is required'
                  if (value && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value)) {
                    return 'Invalid email address'
                  }
                  return true
                }
              })}
            />
            <Input
              label="Phone Number"
              type="tel"
              placeholder="+880 1XXX-XXXXXX"
              hint="Required if email is not provided"
              error={errors.phone?.message}
              {...register('phone', {
                validate: (value) => {
                  if (!value && !email) return 'Email or phone is required'
                  return true
                }
              })}
            />
            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Min. 8 characters"
                required
                error={errors.password?.message}
                {...register('password', {
                  required: 'Password is required',
                  minLength: { value: 8, message: 'Password must be at least 8 characters' }
                })}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <Input
              label="Confirm Password"
              type="password"
              placeholder="Repeat your password"
              required
              error={errors.password_confirmation?.message}
              {...register('password_confirmation', {
                required: 'Please confirm your password',
                validate: val => val === password || 'Passwords do not match'
              })}
            />

            <Button type="submit" fullWidth size="lg" loading={loading}>
              Create Account
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-600 font-medium hover:text-blue-700">
                Sign in
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
