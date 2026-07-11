import { useTranslation } from 'react-i18next'

export default function LanguageSwitcher() {
  const { i18n } = useTranslation()
  const langs = [
    { code: 'en', label: 'EN' },
    { code: 'hi', label: 'HI' },
    { code: 'gu', label: 'GU' },
  ]

  return (
    <div className="flex gap-xs">
      {langs.map((lang) => (
        <button
          key={lang.code}
          onClick={() => i18n.changeLanguage(lang.code)}
          className={`text-[10px] font-bold px-2 py-1 rounded transition-all ${
            i18n.language === lang.code
              ? 'bg-primary/20 text-primary'
              : 'text-on-surface-variant hover:text-primary'
          }`}
        >
          {lang.label}
        </button>
      ))}
    </div>
  )
}
