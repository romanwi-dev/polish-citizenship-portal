import React, { useState } from "react";
import DropboxNavigator from "../components/DropboxNavigator";

export default function ImportsDropbox(){
  const [sel, setSel] = useState(null);
  const [currentPath, setCurrentPath] = useState("/CASES");
  const [form, setForm] = useState({ clientName:"", email:"", processing:"standard", difficulty:1, clientScore:50 });
  const [showDiagModal, setShowDiagModal] = useState(false);
  const [diagData, setDiagData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [dryRunResults, setDryRunResults] = useState(null);
  const [showDryRunModal, setShowDryRunModal] = useState(false);
  
  const handleFolderSelect = (folderPath) => {
    setCurrentPath(folderPath);
    setSel(null); // Clear selection when navigating
  };

  const handleFileSelect = (file) => {
    // Files can't be used for account creation, only folders
    setSel(null);
  };
  
  async function create(){
    if(!sel || sel['.tag'] !== 'folder') return alert("Please select a folder (not a file) to create an account.");
    const r = await fetch("/import/dropbox/create-accounts",{ method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify({ items:[{ path: sel.path_lower, ...form }] }) });
    const j = await r.json(); if(!r.ok||!j.ok) return alert("Failed: "+(j.error||"unknown"));
    alert(`Created ${j.created.length} case:\n${j.created[0].caseId} → ${j.created[0].dropboxPath}`);
  }

  async function runDropboxDiag(){
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/dropbox/diag");
      const data = await response.json();
      setDiagData(data);
      setShowDiagModal(true);
    } catch (error) {
      alert("Failed to run Dropbox diagnostics: " + error.message);
    } finally {
      setIsLoading(false);
    }
  }

  async function runImportSmoke(){
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/import/smoke", { method: "POST" });
      const data = await response.json();
      
      if (data.errors && data.errors.length > 0) {
        alert(`Import completed with errors:\n${data.errors.join('\n')}\n\nCreated: ${data.created.length}\nUpdated: ${data.updated.length}`);
      } else {
        alert(`Import successful!\nScanned: ${data.scanned} folders\nCreated: ${data.created.length} cases\nUpdated: ${data.updated.length} cases`);
      }
      
      // Selection will be refreshed by navigator component
    } catch (error) {
      alert("Failed to run import smoke test: " + error.message);
    } finally {
      setIsLoading(false);
    }
  }

  async function runDryRunImport(){
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/import/dry-run", { method: "POST" });
      const data = await response.json();
      
      setDryRunResults(data);
      setShowDryRunModal(true);
    } catch (error) {
      alert("Failed to run dry-run import: " + error.message);
    } finally {
      setIsLoading(false);
    }
  }

  function DiagModal() {
    if (!showDiagModal || !diagData) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" data-testid="modal-dropbox-diag">
        <div className="bg-white rounded-xl max-w-2xl w-full mx-4 max-h-96 overflow-auto">
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-semibold">Dropbox Diagnostics</h2>
              <button 
                onClick={() => setShowDiagModal(false)}
                className="text-gray-500 hover:text-gray-700"
                data-testid="button-close-diag-modal"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3">
              <div className={`p-3 rounded-lg ${diagData.ok ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <div className="font-medium text-sm">
                  Status: <span className={diagData.ok ? 'text-green-800' : 'text-red-800'}>
                    {diagData.ok ? '✅ HEALTHY' : '❌ ISSUES FOUND'}
                  </span>
                </div>
              </div>
              <pre className="bg-gray-50 p-4 rounded-lg text-sm overflow-auto" data-testid="text-diag-results">
                {JSON.stringify(diagData, null, 2)}
              </pre>
            </div>
            <div className="mt-4 flex justify-end">
              <button 
                onClick={() => setShowDiagModal(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg"
                data-testid="button-close-diag"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function DryRunModal() {
    if (!showDryRunModal || !dryRunResults) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" data-testid="modal-dry-run-results">
        <div className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full mx-4 max-h-[80vh] overflow-hidden">
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Dry-Run Import Results</h2>
              <button 
                onClick={() => setShowDryRunModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                data-testid="button-close-dry-run-modal"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Summary */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg border border-blue-200 dark:border-blue-700">
                  <div className="text-blue-800 dark:text-blue-200 font-medium text-sm">Would Create</div>
                  <div className="text-blue-900 dark:text-blue-100 text-2xl font-bold">
                    {dryRunResults.wouldCreate?.length || 0}
                  </div>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-900/30 p-3 rounded-lg border border-yellow-200 dark:border-yellow-700">
                  <div className="text-yellow-800 dark:text-yellow-200 font-medium text-sm">Would Update</div>
                  <div className="text-yellow-900 dark:text-yellow-100 text-2xl font-bold">
                    {dryRunResults.wouldUpdate?.length || 0}
                  </div>
                </div>
                <div className="bg-red-50 dark:bg-red-900/30 p-3 rounded-lg border border-red-200 dark:border-red-700">
                  <div className="text-red-800 dark:text-red-200 font-medium text-sm">Errors</div>
                  <div className="text-red-900 dark:text-red-100 text-2xl font-bold">
                    {dryRunResults.errors?.length || 0}
                  </div>
                </div>
              </div>

              {/* Results Details */}
              <div className="max-h-96 overflow-auto space-y-3">
                {dryRunResults.wouldCreate && dryRunResults.wouldCreate.length > 0 && (
                  <div>
                    <h3 className="font-medium text-green-800 dark:text-green-200 mb-2">📝 Cases that would be created:</h3>
                    <div className="space-y-2">
                      {dryRunResults.wouldCreate.map((item, index) => (
                        <div key={index} className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-700">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-medium text-green-800 dark:text-green-200">{item.clientName || 'Unnamed Client'}</div>
                              <div className="text-sm text-green-600 dark:text-green-300">Path: {item.dropboxPath}</div>
                              <div className="text-xs text-green-500 dark:text-green-400">
                                Difficulty: {item.difficulty} | Score: {item.clientScore} | Processing: {item.processing}
                              </div>
                            </div>
                            <div className="text-green-600 dark:text-green-400 text-sm font-mono">
                              ID: {item.caseId || 'AUTO-GENERATED'}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {dryRunResults.wouldUpdate && dryRunResults.wouldUpdate.length > 0 && (
                  <div>
                    <h3 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">🔄 Cases that would be updated:</h3>
                    <div className="space-y-2">
                      {dryRunResults.wouldUpdate.map((item, index) => (
                        <div key={index} className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg border border-yellow-200 dark:border-yellow-700">
                          <div className="font-medium text-yellow-800 dark:text-yellow-200">{item.clientName}</div>
                          <div className="text-sm text-yellow-600 dark:text-yellow-300">Existing case: {item.caseId}</div>
                          <div className="text-xs text-yellow-500 dark:text-yellow-400">Changes: {item.changes?.join(', ') || 'Unknown'}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {dryRunResults.errors && dryRunResults.errors.length > 0 && (
                  <div>
                    <h3 className="font-medium text-red-800 dark:text-red-200 mb-2">❌ Errors found:</h3>
                    <div className="space-y-2">
                      {dryRunResults.errors.map((error, index) => (
                        <div key={index} className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-700">
                          <div className="text-red-800 dark:text-red-200 text-sm">{error}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Raw Data */}
              <details className="mt-4">
                <summary className="cursor-pointer text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200">
                  View Raw Data
                </summary>
                <pre className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg text-xs overflow-auto mt-2" data-testid="text-dry-run-raw">
                  {JSON.stringify(dryRunResults, null, 2)}
                </pre>
              </details>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button 
                onClick={() => setShowDryRunModal(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg"
                data-testid="button-close-dry-run"
              >
                Close
              </button>
              {dryRunResults.wouldCreate?.length > 0 && (
                <button 
                  onClick={() => {
                    setShowDryRunModal(false);
                    runImportSmoke();
                  }}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
                  data-testid="button-execute-import"
                >
                  Execute Import ({dryRunResults.wouldCreate.length} cases)
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
  // Navigator component handles all loading and connection states
  return <div className="p-6 space-y-6">
    <div className="flex items-center justify-between">
      <h1 className="text-2xl font-semibold">Dropbox Import</h1>
      <div className="flex items-center space-x-3">
        <div className="text-sm text-zinc-500">Current: {currentPath}</div>
        <div className="flex space-x-2">
          <button 
            onClick={runDropboxDiag}
            disabled={isLoading}
            className="px-3 py-1 text-sm bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-lg disabled:opacity-50"
            data-testid="button-dropbox-diagnose"
          >
            {isLoading ? '⏳' : '🔍'} Dropbox Diagnose
          </button>
          <button 
            onClick={runDryRunImport}
            disabled={isLoading}
            className="px-3 py-1 text-sm bg-purple-100 hover:bg-purple-200 text-purple-800 rounded-lg disabled:opacity-50"
            data-testid="button-dry-run-import"
          >
            {isLoading ? '⏳' : '🔬'} Dry-Run Import
          </button>
          <button 
            onClick={runImportSmoke}
            disabled={isLoading}
            className="px-3 py-1 text-sm bg-green-100 hover:bg-green-200 text-green-800 rounded-lg disabled:opacity-50"
            data-testid="button-import-smoke"
          >
            {isLoading ? '⏳' : '📥'} Import 2 Clients (Smoke)
          </button>
        </div>
      </div>
    </div>
    <div className="grid sm:grid-cols-2 gap-6">
      <div className="rounded-2xl border p-4">
        <div className="font-medium mb-3">Browse Folders</div>
        <DropboxNavigator
          onFolderSelect={handleFolderSelect}
          onFileSelect={handleFileSelect}
          initialPath="/CASES"
        />
        
        {/* Folder selection for account creation */}
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-xl">
          <div className="text-sm font-medium text-blue-800 mb-2">Selected Folder for Account Creation:</div>
          {currentPath ? (
            <div className="flex items-center justify-between">
              <span className="text-blue-700 font-mono text-sm">{currentPath}</span>
              <button
                onClick={() => {
                  // Create mock folder entry for current path
                  const pathParts = currentPath.split('/');
                  const folderName = pathParts[pathParts.length - 1] || 'CASES';
                  setSel({
                    '.tag': 'folder',
                    name: folderName,
                    path_lower: currentPath
                  });
                }}
                className="px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700"
                data-testid="button-select-current-folder"
              >
                Select This Folder
              </button>
            </div>
          ) : (
            <span className="text-blue-600 text-sm">Navigate to a folder and click "Select This Folder"</span>
          )}
        </div>
      </div>
      <div className="rounded-2xl border p-4"><div className="font-medium mb-3">Create Account</div>{!sel? <div className="text-zinc-500 text-sm">Pick a folder…</div> : sel['.tag'] !== 'folder' ? <div className="text-orange-600 text-sm">⚠️ Please select a folder (not a file) to create an account.</div> : <div className="space-y-3">
        <div className="text-xs text-zinc-500">Folder: {sel.path_lower}</div>
        <input className="w-full border rounded-xl px-3 py-2" placeholder="Client name" value={form.clientName} onChange={e=>setForm({...form,clientName:e.target.value})} data-testid="input-client-name"/>
        <input className="w-full border rounded-xl px-3 py-2" placeholder="Email (optional)" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} data-testid="input-client-email"/>
        <div className="grid grid-cols-3 gap-3">
          <select className="border rounded-xl px-3 py-2" value={form.processing} onChange={e=>setForm({...form,processing:e.target.value})}>
            <option value="standard">standard</option><option value="expedited">expedited</option><option value="vip">vip</option><option value="vip+">vip+</option>
          </select>
          <input type="number" min="1" max="5" className="border rounded-xl px-3 py-2" value={form.difficulty} onChange={e=>setForm({...form,difficulty:e.target.value})}/>
          <input type="number" min="0" max="100" className="border rounded-xl px-3 py-2" value={form.clientScore} onChange={e=>setForm({...form,clientScore:e.target.value})}/>
        </div>
        <button onClick={create} className="rounded-xl px-4 py-2 bg-zinc-900 text-white" data-testid="button-create-account">Create Account</button>
      </div>}
      </div>
    </div>
    <DiagModal />
    <DryRunModal />
  </div>;
}