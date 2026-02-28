import Header from '../components/Header.js'
import NavBar from '../components/NavBar.js'
import Hero from '../components/Hero.js'
import VerdictStrip from '../components/VerdictStrip.js'
import FinancialSection from '../components/FinancialSection.js'
import AquaticsSection from '../components/AquaticsSection.js'
import GapSection from '../components/GapSection.js'
import EsgSection from '../components/EsgSection.js'
import AlignmentSection from '../components/AlignmentSection.js'
import RiskSection from '../components/RiskSection.js'
import CompetitorSection from '../components/CompetitorSection.js'
import DiligenceSection from '../components/DiligenceSection.js'
import PathwaysSection from '../components/PathwaysSection.js'
import TimelineSection from '../components/TimelineSection.js'
import Footer from '../components/Footer.js'

export default function Home() {
  return (
    <>
      <Header />
      <NavBar />
      <main className="main">
        <Hero />
        <VerdictStrip />
        <FinancialSection />
        <AquaticsSection />
        <GapSection />
        <EsgSection />
        <AlignmentSection />
        <RiskSection />
        <CompetitorSection />
        <DiligenceSection />
        <PathwaysSection />
        <TimelineSection />
      </main>
      <Footer />
    </>
  )
}
