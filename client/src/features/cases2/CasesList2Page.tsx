import React from 'react'
import { CaseList } from './CaseList'
import { Layout } from '@/components/layout'

const CasesList2Page: React.FC = () => {
  return (
    <Layout>
      <div className="min-h-screen bg-[var(--bg)] p-4">
        <div className="max-w-7xl mx-auto">
          <CaseList />
        </div>
      </div>
    </Layout>
  )
}

export default CasesList2Page