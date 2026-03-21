const token = localStorage.getItem('token')
if (!token) window.location.href = '/login.html'

async function loadKeyInfo() {
    try {
        const res = await fetch('/api/v1/apikeys/my-key', {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        const data = await res.json()

        if (data.total_keys === 0) {
            document.getElementById('no-key-notice').style.display = 'block'
            document.getElementById('embed-code').textContent = 'Generate an API key to get your embed code.'
        } else {
            document.getElementById('key-display').textContent = `Key generated on ${new Date(data.keys[0].created_at).toLocaleDateString()}`
            updateEmbedCode('your-stored-api-key')
        }

    } catch (err) {
        console.error('Failed to load key info', err)
    }
}

async function generateKey() {
    try {
        const res = await fetch('/api/v1/apikeys/generate', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        })
        const data = await res.json()

        if (!res.ok) {
            alert('Failed to generate key. Try again.')
            return
        }

        document.getElementById('key-display').textContent = data.api_key
        document.getElementById('no-key-notice').style.display = 'none'
        updateEmbedCode(data.api_key)

    } catch (err) {
        console.error('Failed to generate key', err)
    }
}

function updateEmbedCode(apiKey) {
    const code = `<script src="https://yourdomain.com/static/js/chat-widget.js"
  data-api-key="${apiKey}"><\/script>`
    document.getElementById('embed-code').textContent = code
}

function copyEmbedCode() {
    const code = document.getElementById('embed-code').textContent
    navigator.clipboard.writeText(code)
    alert('Embed code copied!')
}

function handleLogout() {
    localStorage.removeItem('token')
    window.location.href = '/login.html'
}

loadKeyInfo()