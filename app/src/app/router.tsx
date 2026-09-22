import { Navigate, Route, Routes } from 'react-router'
import { DemoPlayground } from '@/features/demo/DemoPlayground'
import { KidEditor } from '@/features/kids/KidEditor'
import { KidsList } from '@/features/kids/KidsList'
import { Welcome } from '@/features/onboarding/Welcome'
import { PrivacyCenter } from '@/features/privacy/PrivacyCenter'
import { About } from '@/features/settings/About'
import { SettingsHome } from '@/features/settings/SettingsHome'
import { AddTagWizard } from '@/features/tags/AddTagWizard'
import { Home } from '@/features/tags/Home'
import { TagDetail } from '@/features/tags/TagDetail'
import { RootRedirect } from './RootRedirect'
import { TabLayout } from './TabBar'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/welcome" element={<Welcome />} />
      <Route element={<TabLayout />}>
        <Route path="/tags" element={<Home />} />
        <Route path="/kids" element={<KidsList />} />
        <Route path="/settings" element={<SettingsHome />} />
      </Route>
      <Route path="/tags/new" element={<AddTagWizard />} />
      <Route path="/tags/:id" element={<TagDetail />} />
      <Route path="/kids/new" element={<KidEditor />} />
      <Route path="/kids/:id" element={<KidEditor />} />
      <Route path="/settings/privacy" element={<PrivacyCenter />} />
      <Route path="/settings/about" element={<About />} />
      <Route path="/demo" element={<DemoPlayground />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
