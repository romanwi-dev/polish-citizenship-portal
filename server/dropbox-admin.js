let status = null;
let folders = [];
let selected = null;

async function init() {
    try {
        const res = await fetch('/integrations/dropbox/oauth/status');
        status = await res.json();
        
        if (!status.connected) {
            console.log('Dropbox not connected, showing connect button');
            document.getElementById('content').innerHTML = `
                <h3>Dropbox Status: DISCONNECTED</h3>
                <p>Root folder: ${status.root}</p>
                <p><strong>Click below to connect:</strong></p>
                <button id="btn-connect" class="button">Connect to Dropbox</button>
                
                <br><br>
                <button id="btn-test" class="button" style="background: #28a745;">TEST DIRECTLY</button>
                
                <div style="margin-top: 20px; padding: 10px; background: #f9f9f9; border: 1px solid #ddd;">
                    <small><strong>Debug:</strong> ${JSON.stringify(status)}</small>
                </div>
            `;
            
            // Add event listeners after DOM is updated
            document.getElementById('btn-connect').addEventListener('click', connectDropbox);
            document.getElementById('btn-test').addEventListener('click', testDirectly);
        } else {
            loadFolders();
        }
    } catch (e) {
        document.getElementById('content').innerHTML = '<p>Error loading status</p>';
    }
}

async function loadFolders() {
    try {
        const res = await fetch('/integrations/dropbox/folders');
        const data = await res.json();
        folders = data.entries || [];
        renderFolders();
    } catch (e) {
        document.getElementById('content').innerHTML = '<p>Error loading folders</p>';
    }
}

function renderFolders() {
    const folderList = folders.map((f, index) => 
        `<div class="folder ${selected?.path_lower === f.path_lower ? 'selected' : ''}" 
             data-path="${f.path_lower}" data-name="${f.name}" data-folder-index="${index}">${f.name}</div>`
    ).join('');

    document.getElementById('content').innerHTML = `
        <h3>Folders in ${status.root}</h3>
        <div id="folder-list">${folderList}</div>
        
        ${selected ? `
            <div class="form">
                <h4>Create Case for: ${selected.name}</h4>
                <input type="text" id="clientName" placeholder="Client Name" required>
                <input type="email" id="email" placeholder="Email (optional)">
                <select id="processing">
                    <option value="standard">Standard</option>
                    <option value="expedited">Expedited</option>
                    <option value="vip">VIP</option>
                </select>
                <button id="btn-create-case" class="button">Create Case</button>
            </div>
        ` : ''}
    `;
    
    // Add event listeners for folders
    document.getElementById('folder-list').addEventListener('click', (e) => {
        if (e.target.classList.contains('folder')) {
            const path = e.target.dataset.path;
            const name = e.target.dataset.name;
            selectFolder(path, name);
        }
    });
    
    // Add event listener for create case button if it exists
    const createBtn = document.getElementById('btn-create-case');
    if (createBtn) {
        createBtn.addEventListener('click', createCase);
    }
}

function selectFolder(path, name) {
    selected = { path_lower: path, name: name };
    renderFolders();
}

async function createCase() {
    const clientName = document.getElementById('clientName').value;
    if (!clientName) return alert('Client name required');

    try {
        const res = await fetch('/import/dropbox/create-accounts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                items: [{
                    path: selected.path_lower,
                    clientName: clientName,
                    email: document.getElementById('email').value,
                    processing: document.getElementById('processing').value,
                    difficulty: 1,
                    clientScore: 50
                }]
            })
        });

        const result = await res.json();
        if (result.ok) {
            alert(`✅ Case created successfully!\nCase ID: ${result.created[0].caseId}\nPath: ${result.created[0].dropboxPath}`);
        } else {
            alert('❌ Error: ' + (result.error || 'Unknown error'));
        }
    } catch (e) {
        alert('❌ Error creating case');
    }
}

function connectDropbox() {
    console.log('Starting Dropbox OAuth connection...');
    console.log('Redirecting to:', '/integrations/dropbox/oauth/authorize');
    
    // Force full page redirect (no fetch, no window.open)
    window.location.href = '/integrations/dropbox/oauth/authorize';
}

function testDirectly() {
    console.log('Testing direct URL access...');
    fetch('/integrations/dropbox/oauth/authorize', {redirect: 'manual'})
        .then(response => {
            console.log('Direct test - Status:', response.status);
            console.log('Direct test - Location header:', response.headers.get('Location'));
            if (response.status === 302) {
                const redirectUrl = response.headers.get('Location');
                console.log('Opening redirect URL:', redirectUrl);
                window.open(redirectUrl, '_blank');
            }
        })
        .catch(e => console.log('Direct test error:', e));
}

init();