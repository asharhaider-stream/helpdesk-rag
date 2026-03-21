// Redirect to dashboard if already logged in
const token = localStorage.getItem('token')
if (token) window.location.href = '/dashboard.html'

function switchTab(tab) {
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'))
    document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'))

    document.getElementById(`${tab}-form`).classList.add('active')
    event.target.classList.add('active')
}

async function handleLogin() {
    const email = document.getElementById('login-email').value
    const password = document.getElementById('login-password').value
    const alertBox = document.getElementById('login-alert')

    const formData = new FormData()
    formData.append('username', email)
    formData.append('password', password)

    try {
        const res = await fetch('/api/v1/auth/login', {
            method: 'POST',
            body: formData
        })
        const data = await res.json()

        if (!res.ok) {
            alertBox.innerHTML = `<div class="alert alert-error">${data.detail}</div>`
            return
        }

        localStorage.setItem('token', data.access_token)
        window.location.href = '/dashboard.html'

    } catch (err) {
        alertBox.innerHTML = `<div class="alert alert-error">Something went wrong. Try again.</div>`
    }
}

async function handleRegister() {
    const email = document.getElementById('register-email').value
    const password = document.getElementById('register-password').value
    const alertBox = document.getElementById('register-alert')

    try {
        const res = await fetch('/api/v1/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        })
        const data = await res.json()

        if (!res.ok) {
            alertBox.innerHTML = `<div class="alert alert-error">${data.detail}</div>`
            return
        }

        alertBox.innerHTML = `<div class="alert alert-success">Account created. Your Tenant ID: ${data.tenant_id} — save this. Now login.</div>`

    } catch (err) {
        alertBox.innerHTML = `<div class="alert alert-error">Something went wrong. Try again.</div>`
    }
}