const token = localStorage.getItem('token')
if (!token) window.location.href = '/login.html'

const uploadZone = document.getElementById('upload-zone')

uploadZone.addEventListener('dragover', (e) => {
    e.preventDefault()
    uploadZone.classList.add('dragover')
})

uploadZone.addEventListener('dragleave', () => {
    uploadZone.classList.remove('dragover')
})

uploadZone.addEventListener('drop', (e) => {
    e.preventDefault()
    uploadZone.classList.remove('dragover')
    handleFileUpload(e.dataTransfer.files)
})

async function handleFileUpload(files) {
    const alertBox = document.getElementById('upload-alert')
    const progress = document.getElementById('upload-progress')
    const progressFill = document.getElementById('progress-fill')

    for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const formData = new FormData()
        formData.append('file', file)

        progress.style.display = 'block'
        progressFill.style.width = '0%'

        await new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest()

            xhr.upload.addEventListener('progress', (e) => {
                if (e.lengthComputable) {
                    const percent = Math.round((e.loaded / e.total) * 100)
                    progressFill.style.width = percent + '%'
                }
            })

            xhr.addEventListener('load', () => {
                if (xhr.status === 200) {
                    alertBox.innerHTML = `<div class="alert alert-success">${file.name} uploaded. Processing in background.</div>`
                } else {
                    alertBox.innerHTML = `<div class="alert alert-error">Upload failed. Try again.</div>`
                }
                resolve()
            })

            xhr.addEventListener('error', () => {
                alertBox.innerHTML = `<div class="alert alert-error">Upload failed. Try again.</div>`
                reject()
            })

            xhr.open('POST', '/api/v1/documents/upload')
            xhr.setRequestHeader('Authorization', `Bearer ${token}`)
            xhr.send(formData)
        })

        setTimeout(() => {
            progress.style.display = 'none'
            progressFill.style.width = '0%'
        }, 1000)
    }

    loadDocuments()
}

async function loadDocuments() {
    try {
        const res = await fetch('/api/v1/documents/', {
            headers: { 'Authorization': `Bearer ${token}` }
        })

        if (res.status === 401) {
            localStorage.removeItem('token')
            window.location.href = '/login.html'
            return
        }

        const docs = await res.json()
        const container = document.getElementById('docs-list')

        if (docs.length === 0) {
            container.innerHTML = `<div class="empty-state">No documents uploaded yet.</div>`
            return
        }

        const rows = docs.map(doc => `
            <tr>
                <td>${doc.filename}</td>
                <td>${new Date(doc.created_at).toLocaleDateString()}</td>
                <td>
                    <span class="badge ${doc.status === 'processing' ? 'badge-processing' : 'badge-ready'}">
                        ${doc.status}
                    </span>
                </td>
            </tr>
        `).join('')

        container.innerHTML = `
            <table class="table">
                <thead>
                    <tr>
                        <th>Filename</th>
                        <th>Date Uploaded</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>${rows}</tbody>
            </table>
        `

    } catch (err) {
        console.error('Failed to load documents', err)
    }
}

function handleLogout() {
    localStorage.removeItem('token')
    window.location.href = '/login.html'
}

loadDocuments()