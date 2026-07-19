import { useTranslation } from 'react-i18next'

const LANGS = [
  { code: 'en', label: 'EN' },
  { code: 'hi', label: 'हि' },
  { code: 'gu', label: 'ગુ' },
]

export default function LanguageSwitcher() {
  const { i18n } = useTranslation()
  return (
    <div className="flex items-center gap-1 bg-surface-container-highest/40 rounded-lg p-0.5">
      {LANGS.map(l => (
        <button
          key={l.code}
          onClick={() => i18n.changeLanguage(l.code)}
          className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${
            i18n.language === l.code ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          {l.label}
        </button>
      ))}
    </div>
  )
}