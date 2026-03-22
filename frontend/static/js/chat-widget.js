(function () {
    const script = document.currentScript
    const apiKey = script.getAttribute('data-api-key')

    if (!apiKey) {
        console.error('Deskmate: No API key provided')
        return
    }

    const styles = `
        #dm-bubble {
            position: fixed;
            bottom: 24px;
            right: 24px;
            width: 54px;
            height: 54px;
            background-color: #457b9d;
            border-radius: 50%;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 16px rgba(0,0,0,0.2);
            z-index: 9999;
            transition: background-color 0.2s;
        }

        #dm-bubble:hover {
            background-color: #1d3557;
        }

        #dm-bubble svg {
            width: 26px;
            height: 26px;
            fill: white;
        }

        #dm-window {
            position: fixed;
            bottom: 90px;
            right: 24px;
            width: 360px;
            height: 500px;
            background-color: white;
            border-radius: 16px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.15);
            display: none;
            flex-direction: column;
            z-index: 9999;
            overflow: hidden;
            font-family: 'Inter', sans-serif;
        }

        #dm-window.open {
            display: flex;
        }

        #dm-header {
            background-color: #1d3557;
            padding: 16px 20px;
            color: white;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        #dm-header span {
            font-weight: 600;
            font-size: 15px;
        }

        #dm-close {
            cursor: pointer;
            font-size: 20px;
            color: #a8dadc;
            background: none;
            border: none;
            line-height: 1;
        }

        #dm-messages {
            flex: 1;
            padding: 16px;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
            gap: 12px;
            background-color: #f1faee;
        }

        .dm-msg {
            max-width: 80%;
            padding: 10px 14px;
            border-radius: 12px;
            font-size: 14px;
            line-height: 1.5;
        }

        .dm-msg.user {
            background-color: #457b9d;
            color: white;
            align-self: flex-end;
            border-bottom-right-radius: 4px;
        }

        .dm-msg.bot {
            background-color: white;
            color: #1d3557;
            align-self: flex-start;
            border-bottom-left-radius: 4px;
            box-shadow: 0 2px 6px rgba(0,0,0,0.06);
        }

        .dm-msg.thinking {
            background-color: white;
            color: #457b9d;
            align-self: flex-start;
            font-style: italic;
            font-size: 13px;
        }

        #dm-input-area {
            padding: 12px 16px;
            background-color: white;
            display: flex;
            gap: 8px;
            border-top: 1px solid #f1faee;
        }

        #dm-input {
            flex: 1;
            padding: 10px 14px;
            border: 1px solid #a8dadc;
            border-radius: 8px;
            font-size: 14px;
            outline: none;
            font-family: inherit;
        }

        #dm-input:focus {
            border-color: #457b9d;
        }

        #dm-send {
            padding: 10px 16px;
            background-color: #457b9d;
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
            font-size: 14px;
        }

        #dm-send:hover {
            background-color: #1d3557;
        }

        @media (max-width: 480px) {
            #dm-window {
                width: calc(100vw - 32px);
                right: 16px;
                bottom: 80px;
            }
        }
    `

    const styleTag = document.createElement('style')
    styleTag.textContent = styles
    document.head.appendChild(styleTag)

    document.body.innerHTML += `
        <div id="dm-bubble" onclick="dmToggle()">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
            </svg>
        </div>

        <div id="dm-window">
            <div id="dm-header">
                <span>Support Assistant</span>
                <button id="dm-close" onclick="dmToggle()">&#x2715;</button>
            </div>
            <div id="dm-messages">
                <div class="dm-msg bot">Hi! Ask me anything about our products or services.</div>
            </div>
            <div id="dm-input-area">
                <input type="text" id="dm-input" placeholder="Type your question..." onkeydown="if(event.key==='Enter') dmSend()">
                <button id="dm-send" onclick="dmSend()">Send</button>
            </div>
        </div>
    `

    window.dmToggle = function () {
        const win = document.getElementById('dm-window')
        win.classList.toggle('open')
    }

    window.dmSend = async function () {
        const input = document.getElementById('dm-input')
        const messages = document.getElementById('dm-messages')
        const question = input.value.trim()

        if (!question) return

        input.value = ''

        messages.innerHTML += `<div class="dm-msg user">${question}</div>`
        messages.innerHTML += `<div class="dm-msg thinking" id="dm-thinking">Thinking...</div>`
        messages.scrollTop = messages.scrollHeight

        try {
            const res = await fetch('/api/v1/query/ask', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-Key': apiKey
                },
                body: JSON.stringify({ question })
            })

            const data = await res.json()
            document.getElementById('dm-thinking').remove()

            if (!res.ok) {
                messages.innerHTML += `<div class="dm-msg bot">Sorry, something went wrong. Try again.</div>`
            } else {
                messages.innerHTML += `<div class="dm-msg bot">${data.answer}</div>`
            }

        } catch (err) {
            document.getElementById('dm-thinking').remove()
            messages.innerHTML += `<div class="dm-msg bot">Connection error. Please try again.</div>`
        }

        messages.scrollTop = messages.scrollHeight
    }
})()