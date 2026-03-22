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
            background-color: #3B82F6;
            border-radius: 50%;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 0 0 0 rgba(59,130,246,0.4);
            z-index: 9999;
            transition: transform 0.2s;
            animation: dm-pulse 2.5s ease-in-out infinite;
        }

        #dm-bubble:hover { transform: scale(1.08); }

        @keyframes dm-pulse {
            0% { box-shadow: 0 0 0 0 rgba(59,130,246,0.4); }
            70% { box-shadow: 0 0 0 12px rgba(59,130,246,0); }
            100% { box-shadow: 0 0 0 0 rgba(59,130,246,0); }
        }

        #dm-bubble svg {
            width: 24px;
            height: 24px;
            fill: white;
        }

        #dm-window {
            position: fixed;
            bottom: 90px;
            right: 24px;
            width: 360px;
            height: 500px;
            background-color: #111111;
            border-radius: 16px;
            box-shadow: 0 8px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06);
            display: none;
            flex-direction: column;
            z-index: 9999;
            overflow: hidden;
            font-family: -apple-system, 'Inter', sans-serif;
        }

        #dm-window.open { display: flex; }

        #dm-header {
            background-color: #0A0A0A;
            padding: 14px 18px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid rgba(255,255,255,0.06);
        }

        #dm-header-left {
            display: flex;
            align-items: center;
            gap: 10px;
        }

        #dm-avatar {
            width: 32px;
            height: 32px;
            background-color: #3B82F6;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        #dm-avatar svg {
            width: 16px;
            height: 16px;
            fill: white;
        }

        #dm-header-info span {
            display: block;
            font-size: 13px;
            font-weight: 600;
            color: white;
            line-height: 1.3;
        }

        #dm-header-info small {
            font-size: 11px;
            color: #22C55E;
            display: flex;
            align-items: center;
            gap: 4px;
        }

        #dm-online-dot {
            width: 6px;
            height: 6px;
            background-color: #22C55E;
            border-radius: 50%;
        }

        #dm-close {
            cursor: pointer;
            font-size: 18px;
            color: #4B5563;
            background: none;
            border: none;
            line-height: 1;
            padding: 4px;
            border-radius: 4px;
            transition: color 0.15s;
        }

        #dm-close:hover { color: white; }

        #dm-messages {
            flex: 1;
            padding: 16px;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
            gap: 10px;
            background-color: #1A1A1A;
            scrollbar-width: thin;
            scrollbar-color: #2A2A2A transparent;
        }

        #dm-messages::-webkit-scrollbar { width: 4px; }
        #dm-messages::-webkit-scrollbar-track { background: transparent; }
        #dm-messages::-webkit-scrollbar-thumb { background-color: #2A2A2A; border-radius: 4px; }

        .dm-msg {
            max-width: 82%;
            padding: 10px 13px;
            border-radius: 12px;
            font-size: 13px;
            line-height: 1.6;
        }

        .dm-msg.user {
            background-color: #3B82F6;
            color: white;
            align-self: flex-end;
            border-bottom-right-radius: 3px;
        }

        .dm-msg.bot {
            background-color: #2A2A2A;
            color: #E5E7EB;
            align-self: flex-start;
            border-bottom-left-radius: 3px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.3);
        }

        .dm-msg.thinking {
            background-color: #2A2A2A;
            color: #6B7280;
            align-self: flex-start;
            font-size: 12px;
            display: flex;
            align-items: center;
            gap: 6px;
            padding: 10px 14px;
        }

        .dm-thinking-dots {
            display: flex;
            gap: 3px;
        }

        .dm-thinking-dots span {
            width: 5px;
            height: 5px;
            background-color: #4B5563;
            border-radius: 50%;
            animation: dm-dot-bounce 1.2s ease-in-out infinite;
        }

        .dm-thinking-dots span:nth-child(2) { animation-delay: 0.2s; }
        .dm-thinking-dots span:nth-child(3) { animation-delay: 0.4s; }

        @keyframes dm-dot-bounce {
            0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
            40% { transform: translateY(-4px); opacity: 1; }
        }

        #dm-input-area {
            padding: 12px 14px;
            background-color: #0A0A0A;
            display: flex;
            gap: 8px;
            border-top: 1px solid rgba(255,255,255,0.06);
        }

        #dm-input {
            flex: 1;
            padding: 9px 14px;
            border: 1px solid rgba(255,255,255,0.08);
            border-radius: 8px;
            font-size: 13px;
            outline: none;
            font-family: inherit;
            background-color: #1A1A1A;
            color: white;
            transition: border-color 0.15s;
        }

        #dm-input::placeholder { color: #4B5563; }
        #dm-input:focus { border-color: #3B82F6; }

        #dm-send {
            width: 36px;
            height: 36px;
            background-color: #3B82F6;
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background-color 0.15s;
            flex-shrink: 0;
        }

        #dm-send:hover { background-color: #2563EB; }

        #dm-send svg {
            width: 15px;
            height: 15px;
            fill: white;
        }

        @media (max-width: 480px) {
            #dm-window {
                width: calc(100vw - 24px);
                right: 12px;
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
                <div id="dm-header-left">
                    <div id="dm-avatar">
                        <svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
                    </div>
                    <div id="dm-header-info">
                        <span>Support Assistant</span>
                        <small><div id="dm-online-dot"></div> Online and ready to help</small>
                    </div>
                </div>
                <button id="dm-close" onclick="dmToggle()">&#x2715;</button>
            </div>
            <div id="dm-messages">
                <div class="dm-msg bot">Hi! Ask me anything about our products or services.</div>
            </div>
            <div id="dm-input-area">
                <input type="text" id="dm-input" placeholder="Type your question..." onkeydown="if(event.key==='Enter') dmSend()">
                <button id="dm-send" onclick="dmSend()">
                    <svg viewBox="0 0 24 24"><path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z"/></svg>
                </button>
            </div>
        </div>
    `

    window.dmToggle = function () {
        document.getElementById('dm-window').classList.toggle('open')
    }

    window.dmSend = async function () {
        const input = document.getElementById('dm-input')
        const messages = document.getElementById('dm-messages')
        const question = input.value.trim()

        if (!question) return

        input.value = ''

        messages.innerHTML += `<div class="dm-msg user">${question}</div>`
        messages.innerHTML += `
            <div class="dm-msg thinking" id="dm-thinking">
                <div class="dm-thinking-dots">
                    <span></span><span></span><span></span>
                </div>
            </div>
        `
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
            const thinking = document.getElementById('dm-thinking')
            if (thinking) thinking.remove()

            if (!res.ok) {
                messages.innerHTML += `<div class="dm-msg bot">Sorry, something went wrong. Please try again.</div>`
            } else {
                const formatted = data.answer
                    .replace(/\n\n/g, '<br><br>')
                    .replace(/\n/g, '<br>')
                    .replace(/(\d+\.)\s/g, '<br>$1 ')

                messages.innerHTML += `<div class="dm-msg bot">${formatted}</div>`
            }

        } catch (err) {
            const thinking = document.getElementById('dm-thinking')
            if (thinking) thinking.remove()
            messages.innerHTML += `<div class="dm-msg bot">Connection error. Please try again.</div>`
        }

        messages.scrollTop = messages.scrollHeight
    }
})()