const token = localStorage.getItem('token')
if (!token) window.location.href = '/login.html'

async function loadDashboard() {
    try {
        const res = await fetch('/api/v1/auth/me', {
            headers: { 'Authorization': `Bearer ${token}` }
        })

        // if (res.status === 401) {
        //     localStorage.removeItem('token')
        //     window.location.href = '/login.html'
        //     return
        // }
        if (res.status === 401) {
            const errorData = await res.json()
            alert('401 Error: ' + JSON.stringify(errorData))
            return
        }

        const data = await res.json()
        document.getElementById('user-email').textContent = data.email
        document.getElementById('tenant-id').textContent = data.tenant_id

    } catch (err) {
        console.error('Failed to load user info', err)
    }

    try {
        const res = await fetch('/api/v1/documents/', {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        const docs = await res.json()

        document.getElementById('total-docs').textContent = docs.length

        if (docs.length > 0) {
            const rows = docs.slice(0, 5).map(doc => `
                <tr>
                    <td>${doc.filename}</td>
                    <td>${new Date(doc.created_at).toLocaleDateString()}</td>
                    <td><span class="badge ${doc.status === 'processing' ? 'badge-processing' : 'badge-ready'}">${doc.status}</span></td>
                </tr>
            `).join('')

            document.getElementById('recent-docs').innerHTML = `
                <table class="table">
                    <thead>
                        <tr>
                            <th>Filename</th>
                            <th>Date</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>
            `
        }

    } catch (err) {
        console.error('Failed to load documents', err)
    }
}

function copyTenantId() {
    const id = document.getElementById('tenant-id').textContent
    navigator.clipboard.writeText(id)
    alert('Tenant ID copied!')
}

function handleLogout() {
    localStorage.removeItem('token')
    window.location.href = '/login.html'
}

loadDashboard()