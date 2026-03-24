const token = localStorage.getItem('token')
if (!token) window.location.href = '/login.html'

async function loadDashboard() {
    try {
    const res = await fetch('/api/v1/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
    })

    const data = await res.json()
    
    if (res.status === 401) {
        console.error('401 response:', data)
        document.body.innerHTML = `<h1 style="color:red">401 Error: ${JSON.stringify(data)}</h1>`
        return
    }

    document.getElementById('avatar-initials').textContent = getInitials(data.email)
    document.getElementById('dropdown-email').textContent = data.email
    document.getElementById('tenant-id-display').textContent = data.tenant_id

    } catch (err) {
    console.error('Failed to load user', err)
    document.body.innerHTML = `<h1 style="color:red">Fetch Error: ${err.message}</h1>`
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