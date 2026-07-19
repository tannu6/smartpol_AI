import AppLayout from '../../components/layout/AppLayout'
import { KpiCard } from '../../components/ui/Card'
import { useTranslation } from 'react-i18next'

export default function MissionControlPage() {
  const { t } = useTranslation()
  return (
    <AppLayout title={t('missionControl.appTitle')} subtitle={t('missionControl.appSubtitle')}>
      <div className="p-lg space-y-lg">
        <h2 className="font-display-lg-mobile text-primary">{t('missionControl.title')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter">
          <KpiCard label={t('missionControl.kpis.activeMissions')} value="12" icon="flag" accent="secondary" />
          <KpiCard label={t('missionControl.kpis.unitsDeployed')} value="82%" icon="groups" accent="primary" />
          <KpiCard label={t('missionControl.kpis.responseTime')} value="4.2m" icon="timer" accent="secondary" />
          <KpiCard label={t('missionControl.kpis.criticalAlerts')} value="3" icon="emergency" accent="error" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
          <div className="lg:col-span-2 glass-panel p-md rounded-xl">
            <h3 className="font-title-sm text-on-surface mb-md flex items-center gap-sm"><span className="w-1 h-4 bg-secondary" /> {t('missionControl.liveUnitMap.title')}</h3>
            <div className="h-64 bg-surface-container-lowest/50 rounded-lg flex items-center justify-center border border-primary/10">
              <span className="font-mono-data text-on-surface-variant">{t('missionControl.liveUnitMap.overlay')}</span>
            </div>
          </div>
          <div className="glass-panel p-md rounded-xl">
            <h3 className="font-title-sm text-on-surface mb-md">{t('missionControl.unitStatus.title')}</h3>
            <div className="space-y-md">
              {[
                { unit: 'Blue-4', status: t('missionControl.unitStatus.patrolling') },
                { unit: 'Red-1', status: t('missionControl.unitStatus.responding') },
                { unit: 'Gold-7', status: t('missionControl.unitStatus.inBriefing') }
              ].map((u, i) => (
                <div key={i} className="flex justify-between p-sm bg-surface-container/30 rounded-sm text-sm">
                  <span>{u.unit}</span>
                  <span className="text-secondary text-xs font-bold">{u.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
