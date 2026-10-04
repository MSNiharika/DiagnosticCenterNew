import { BrowserRouter, Route, Routes } from "react-router-dom"
import { AccountPanel } from "./components/AccountPanel"
import { Shell } from "./components/Shell"
import { FamilyProvider } from "./context/Family"
import { StoreProvider } from "./context/Store"
import { Login, Profile, Register, Reports } from "./pages/Account"
import { Book } from "./pages/Book"
import { PackageDetail, Packages, TestDetail, Tests } from "./pages/Browse"
import { Home } from "./pages/Home"
import { BillingScreen, CallbacksScreen, DeskScreen, InsightsScreen, InventoryScreen, LogisticsScreen, PeopleScreen, QualityScreen, ReferralsScreen, SamplesScreen, TodayScreen, ValidateScreen, WorklistScreen } from "./pages/Lab"
import { Compare, Family, Guide, Plans, Prep } from "./pages/Modules"
import { NewsArticle } from "./pages/News"
import { About, CentreDetail, Centres, Collection, Contact, Corporate, Doctors, Missing, Prescription } from "./pages/Places"

export default function App() {
  return (
    <StoreProvider>
      <FamilyProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<Shell />}>
              <Route index element={<Home />} />
              <Route path="tests" element={<Tests />} />
              <Route path="tests/:id" element={<TestDetail />} />
              <Route path="imaging" element={<Tests preset="scan" />} />
              <Route path="packages" element={<Packages />} />
              <Route path="packages/:id" element={<PackageDetail />} />
              <Route path="news/:slug" element={<NewsArticle />} />
              <Route path="book" element={<Book />} />
              <Route path="collection" element={<Collection />} />
              <Route path="centres" element={<Centres />} />
              <Route path="centres/:id" element={<CentreDetail />} />
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
              <Route path="account" element={<AccountPanel />} />
              <Route path="profile" element={<Profile />} />
              <Route path="reports" element={<Reports />} />
              <Route path="guide" element={<Guide />} />
              <Route path="compare" element={<Compare />} />
              <Route path="family" element={<Family />} />
              <Route path="plans" element={<Plans />} />
              <Route path="prep" element={<Prep />} />
              <Route path="about" element={<About />} />
              <Route path="doctors" element={<Doctors />} />
              <Route path="contact" element={<Contact />} />
              <Route path="corporate" element={<Corporate />} />
              <Route path="prescription" element={<Prescription />} />
              <Route path="console" element={<TodayScreen />} />
              <Route path="console/desk" element={<DeskScreen />} />
              <Route path="console/samples" element={<SamplesScreen />} />
              <Route path="console/worklist" element={<WorklistScreen />} />
              <Route path="console/validate" element={<ValidateScreen />} />
              <Route path="console/billing" element={<BillingScreen />} />
              <Route path="console/inventory" element={<InventoryScreen />} />
              <Route path="console/logistics" element={<LogisticsScreen />} />
              <Route path="console/referrals" element={<ReferralsScreen />} />
              <Route path="console/quality" element={<QualityScreen />} />
              <Route path="console/people" element={<PeopleScreen />} />
              <Route path="console/insights" element={<InsightsScreen />} />
              <Route path="console/callbacks" element={<CallbacksScreen />} />
              <Route path="*" element={<Missing />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </FamilyProvider>
    </StoreProvider>
  )
}
