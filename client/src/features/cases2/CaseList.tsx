import React, { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { RefreshCw, Plus } from 'lucide-react'
import { CaseCardCanonical } from '@/components/cards/CaseCardCanonical'
import { CaseData } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'
import { plDate } from '@/lib/dateFormat'
import { cn } from '@/lib/utils'
import '@/styles/tokens.css'

// Transform API data to CaseData format (reusing logic from existing system)
function transformApiData(apiData: any[]): CaseData[] {
  const currentTime = Date.now()
  return apiData.map(dbCase => {
    const createdAt = dbCase.created_at ? new Date(dbCase.created_at).getTime() : currentTime
    const ageMonths = Math.max(1, Math.floor((currentTime - createdAt) / (1000 * 60 * 60 * 24 * 30)))
    
    // Parse confidence percentage
    const confidenceStr = dbCase.confidence || "0%"
    const confidence = parseInt(confidenceStr.replace('%', ''))
    
    // Use caseManager as the display name
    const displayName = dbCase.caseManager || `Case ${dbCase.caseId || dbCase.id}`
    
    return {
      id: dbCase.caseId || dbCase.id.toString(),
      name: displayName,
      email: dbCase.client?.email || 'No email',
      stage: dbCase.state || 'pending',
      tier: mapTier(dbCase.processing || 'standard'),
      score: dbCase.clientScore || confidence || 0,
      confidence,
      ageMonths,
      difficulty: dbCase.difficulty || 1,
      updatedAt: dbCase.updated_at || dbCase.created_at || new Date().toISOString(),
      createdAt: dbCase.created_at || new Date().toISOString(),
      processing: dbCase.processing || 'standard',
      state: dbCase.state || 'pending',
      created_at: dbCase.created_at,
      updated_at: dbCase.updated_at
    }
  })
}

function mapTier(processing: string): 'VIP' | 'GLOBAL' | 'STANDARD' | 'BASIC' {
  switch (processing.toLowerCase()) {
    case 'tier1':
    case 'rush':
    case 'vip': return 'VIP'
    case 'tier2':
    case 'global': return 'GLOBAL'
    case 'tier3':
    case 'standard': return 'STANDARD'
    default: return 'BASIC'
  }
}

export const CaseList: React.FC = () => {
  const { toast } = useToast()
  const [refreshing, setRefreshing] = useState(false)

  const { data: cases = [], isLoading, error, refetch } = useQuery({
    queryKey: ['/api/admin/cases'],
    queryFn: async () => {
      const response = await fetch('/api/admin/cases')
      if (!response.ok) {
        throw new Error('Failed to fetch cases')
      }
      const data = await response.json()
      return transformApiData(data.cases || [])
    }
  })

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await refetch()
      toast({
        title: "Cases Updated",
        description: "Cases list has been refreshed."
      })
    } catch (error) {
      toast({
        title: "Refresh Failed", 
        description: "Failed to refresh cases list.",
        variant: "destructive"
      })
    } finally {
      setRefreshing(false)
    }
  }

  const handleCaseAction = (action: string, caseId: string) => {
    toast({
      title: `${action.charAt(0).toUpperCase() + action.slice(1)} Action`,
      description: `${action} action for case ${caseId} - Feature coming soon`
    })
  }

  const memoizedCases = useMemo(() => cases, [cases])

  if (error) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg dark:shadow-2xl p-8 text-center max-w-md">
          <div className="text-4xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Failed to Load Cases
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Unable to fetch cases from the server. Please try again.
          </p>
          <button
            onClick={handleRefresh}
            className="pc-btn pc-btn--primary pc-btn--icon"
            disabled={refreshing}
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", refreshing && "animate-spin")} />
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-0 md:px-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">SPRAWY</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {isLoading ? 'Loading...' : `${memoizedCases.length} cases`}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing || isLoading}
            className="pc-btn pc-btn--ghost pc-btn--icon"
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", (refreshing || isLoading) && "animate-spin")} />
            Refresh
          </button>
          
          <button className="pc-btn pc-btn--primary pc-btn--icon">
            <Plus className="h-4 w-4 mr-2" />
            New Case
          </button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 w-full px-0 md:px-0">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg dark:shadow-2xl animate-pulse">
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-2 flex-1">
                    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  </div>
                  <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  {[...Array(3)].map((_, j) => (
                    <div key={j} className="text-center space-y-1">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mx-auto"></div>
                    </div>
                  ))}
                </div>
                
                <div className="flex justify-between">
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                  <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                  <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                  <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cases Grid */}
      {!isLoading && (
        <>
          {memoizedCases.length === 0 ? (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg dark:shadow-2xl p-12 text-center">
              <div className="text-4xl mb-4">📋</div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No Cases Yet
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Get started by creating your first case.
              </p>
              <button className="pc-btn pc-btn--primary pc-btn--icon">
                <Plus className="h-4 w-4 mr-2" />
                Create First Case
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 w-full px-0 md:px-0">
              {memoizedCases.map((caseData) => (
                <CaseCardCanonical
                  key={caseData.id}
                  case={caseData}
                  onAction={handleCaseAction}
                  className="w-full max-w-none mx-0"
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}