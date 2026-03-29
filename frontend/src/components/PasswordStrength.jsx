import { useMemo } from 'react'

export default function PasswordStrength({ password }) {
  const strength = useMemo(() => {
    if (!password) return { score: 0, label: '', color: '' }
    let score = 0
    if (password.length >= 6) score++
    if (password.length >= 8) score++
    if (/[A-Z]/.test(password)) score++
    if (/[0-9]/.test(password)) score++
    if (/[^A-Za-z0-9]/.test(password)) score++

    const levels = [
      { label: '', color: '' },
      { label: 'Very Weak', color: 'bg-red-500' },
      { label: 'Weak', color: 'bg-orange-500' },
      { label: 'Fair', color: 'bg-yellow-500' },
      { label: 'Strong', color: 'bg-emerald-500' },
      { label: 'Very Strong', color: 'bg-green-500' }
    ]
    return { score, ...levels[score] }
  }, [password])

  if (!password) return null

  return (
    <div className="mt-2">
      <div className="flex gap-1.5 mb-1.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-1.5 flex-1 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
            <div
              className={`h-full rounded-full strength-bar ${i <= strength.score ? strength.color : ''}`}
              style={{ width: i <= strength.score ? '100%' : '0%' }}
            />
          </div>
        ))}
      </div>
      <p className={`text-xs font-medium ${
        strength.score <= 1 ? 'text-red-500' :
        strength.score <= 2 ? 'text-orange-500' :
        strength.score <= 3 ? 'text-yellow-600' :
        'text-emerald-600 dark:text-emerald-400'
      }`}>
        {strength.label}
      </p>
    </div>
  )
}
