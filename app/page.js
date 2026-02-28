'use client'

import dynamic from 'next/dynamic'
import Header from '../components/Header.js'
import Hero from '../components/Hero.js'
import Footer from '../components/Footer.js'
import FinancialSection from '../components/FinancialSection.js'
import AquaticsSection from '../components/AquaticsSection.js'
import GapSection from '../components/GapSection.js'
import EsgSection from '../components/EsgSection.js'
import DiligenceSection from '../components/DiligenceSection.js'
import TimelineSection from '../components/TimelineSection.js'

const NavBar = dynamic(() => import('../components/NavBar.js'), { ssr: false })
const VerdictStrip = dynamic(() => import('../components/VerdictStrip.js'), { ssr: false })
const AlignmentSection = dynamic(() => import('../components/AlignmentSection.js'), { ssr: false })
const RiskSection = dynamic(() => import('../components/RiskSection.js'), { ssr: false })
const CompetitorSection = dynamic(() => import('../components/CompetitorSection.js'), { ssr: false })
const PathwaysSection = dynamic(() => import('../components/PathwaysSection.js'), { ssr: false })

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
