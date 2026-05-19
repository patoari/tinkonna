import { useState, useEffect } from 'react'
import { Edit, Upload, Zap } from 'lucide-react'
import api from '../../lib/axios'
import Card, { CardHeader, CardTitle } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import { PageLoader } from '../../components/ui/Spinner'
import toast from 'react-hot-toast'

const OCCASIONS = [
  { value: 'eid_ul_fitr', label: 'Eid-ul-Fitr', emoji: '🌙' },
  { value: 'eid_ul_adha', label: 'Eid-ul-Adha', emoji: '🐑' },
  { value: 'pohela_boishakh', label: 'Pohela Boishakh', emoji: '🥭' },
  { value: 'independence_day', label: 'Independence Day', emoji: '🇧🇩' },
  { value: 'victory_day', label: 'Victory Day', emoji: '🏆' },
  { value: 'mother_language_day', label: 'Mother Language Day', emoji: '📚' },
  { value: 'custom', label: 'Custom', emoji: '✨' },
]

export default function Themes() {
  const [themes, setThemes] = useState([])
  const [loading, setLoading] = useState(true)
  const [configModal, setConfigModal] = useState(false)
  const [selectedTheme, setSelectedTheme] = useState(null)
  const [configData, setConfigData] = useState({ start_date: '', end_date: '' })
  const [saving, setSaving] = useState(false)

  const fetchThemes = async () => {
    setLoading(true)
    try {
      const res = await api.get('/themes')
      setThemes(res.data)
    } catch {}
    finally { setLoading(false) }
  }

  useEffect(() => { fetchThemes() }, [])

  const handleQuickApply = async (themeId) => {
    const today = new Date().toISOString().split('T')[0]
    setSaving(true)
    try {
      await api.post('/theme-configurations', { theme_id: themeId, start_date: today, end_date: today })
      toast.success('Theme applied for today!')
      fetchThemes()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to apply theme')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveConfig = async () => {
    if (!configData.start_date || !configData.end_date) { toast.error('Please select dates'); return }
    setSaving(true)
    try {
      await api.post('/theme-configurations', { theme_id: selectedTheme.id, ...configData })
      toast.success('Theme scheduled!')
      setConfigModal(false)
      fetchThemes()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to schedule theme')
    } finally {
      setSaving(false)
    }
  }

  const handleIconUpload = async (themeId, file) => {
    if (!file) return
    if (file.size > 500 * 1024) { toast.error('Icon must be less than 500KB'); return }
    const formData = new FormData()
    formData.append('icon', file)
    formData.append('theme_id', themeId)
    try {
      await api.post('/theme-icons', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      toast.success('Icon uploaded!')
      fetchThemes()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload icon')
    }
  }

  const handleDeleteIcon = async (iconId) => {
    try {
      await api.delete(`/theme-icons/${iconId}`)
      toast.success('Icon deleted')
      fetchThemes()
    } catch {
      toast.error('Failed to delete icon')
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Theme Management</h1>
        <p className="text-sm text-gray-500 mt-0.5">Manage festive themes for special occasions</p>
      </div>

      {loading ? <PageLoader /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {themes.map(theme => {
            const occasion = OCCASIONS.find(o => o.value === theme.occasion)
            const activeConfig = theme.configurations?.find(c => {
              const today = new Date().toISOString().split('T')[0]
              return c.is_active && c.start_date <= today && c.end_date >= today
            })

            return (
              <Card key={theme.id}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{occasion?.emoji || '🎨'}</span>
                    <div>
                      <p className="font-semibold text-gray-900">{theme.name}</p>
                      <p className="text-xs text-gray-500">{occasion?.label || theme.occasion}</p>
                    </div>
                  </div>
                  {activeConfig && <Badge variant="success" dot>Active</Badge>}
                </div>

                <div className="flex items-center gap-2 mb-3 text-xs text-gray-500">
                  <span>{theme.icons?.length || 0} custom icons</span>
                  <span>•</span>
                  <span>{theme.flying_symbols_enabled ? 'Flying symbols on' : 'Flying symbols off'}</span>
                </div>

                {/* Icons preview */}
                {theme.icons?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {theme.icons.slice(0, 6).map(icon => (
                      <div key={icon.id} className="relative group">
                        <img src={icon.url} alt="" className="w-8 h-8 rounded-lg object-contain bg-gray-50 border border-gray-200" />
                        <button
                          onClick={() => handleDeleteIcon(icon.id)}
                          className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-xs hidden group-hover:flex items-center justify-center"
                        >×</button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <Button size="sm" variant="secondary" fullWidth icon={<Zap size={13} />} onClick={() => handleQuickApply(theme.id)}>
                      Quick Apply
                    </Button>
                    <Button size="sm" variant="secondary" fullWidth icon={<Edit size={13} />} onClick={() => { setSelectedTheme(theme); setConfigModal(true) }}>
                      Schedule
                    </Button>
                  </div>
                  <label className="flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                    <Upload size={13} />
                    Upload Icon
                    <input type="file" accept="image/png,image/svg+xml,image/gif,image/webp" className="hidden"
                      onChange={e => handleIconUpload(theme.id, e.target.files[0])} />
                  </label>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      <Modal isOpen={configModal} onClose={() => setConfigModal(false)} title={`Schedule: ${selectedTheme?.name}`} size="sm"
        footer={<><Button variant="secondary" onClick={() => setConfigModal(false)}>Cancel</Button><Button loading={saving} onClick={handleSaveConfig}>Schedule Theme</Button></>}>
        <div className="space-y-4">
          <Input label="Start Date" type="date" value={configData.start_date} onChange={e => setConfigData(p => ({ ...p, start_date: e.target.value }))} />
          <Input label="End Date" type="date" value={configData.end_date} onChange={e => setConfigData(p => ({ ...p, end_date: e.target.value }))} />
        </div>
      </Modal>
    </div>
  )
}
