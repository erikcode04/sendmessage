import { getAuthState } from '../utils/auth.ts';

export class MessagesPage {
    private contactId: string = '';
    private contactName: string = '';

    render(contactId: string, contactName: string): string {
        this.contactId = contactId;
        this.contactName = contactName;

        return `
            <div class="container">
                <div class="auth-card" style="max-width: 800px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                        <h2>Konversation med ${contactName}</h2>
                        <button id="back-btn" class="btn btn-secondary">Tillbaka</button>
                    </div>

                    <div id="messages-container" style="border: 1px solid #ddd; padding: 20px; min-height: 300px; max-height: 400px; overflow-y: auto; margin-bottom: 20px; background-color: #f9f9f9;">
                        <p>Laddar meddelanden...</p>
                    </div>

                    <form id="send-message-form">
                        <div class="form-group" style="display: flex; gap: 10px;">
                            <input type="text" id="message-input" class="form-control" placeholder="Skriv ett meddelande..." required style="flex: 1;">
                            <button type="submit" class="btn btn-primary">Skicka</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    }

    addEventListeners(router: any) {
        const backBtn = document.getElementById('back-btn');
        const form = document.getElementById('send-message-form') as HTMLFormElement;

        if (backBtn) {
            backBtn.addEventListener('click', () => {
                router.navigate('/home');
            });
        }

        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const input = document.getElementById('message-input') as HTMLInputElement;
                const text = input.value;

                if (text.trim()) {
                    await this.sendMessage(text);
                    input.value = '';
                }
            });
        }

        this.loadMessages();
    }

    async loadMessages() {
        const container = document.getElementById('messages-container');
        if (!container) return;

        try {
            const token = getAuthState().token || localStorage.getItem('token');
            const response = await fetch(`/api/contacts/${this.contactId}/messages`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const messages = await response.json();
                if (messages.length === 0) {
                    container.innerHTML = '<p style="color: #999;">Inga meddelanden än. Skriv det första meddelandet!</p>';
                } else {
                    container.innerHTML = messages.map((msg: any) => `
                        <div style="margin-bottom: 15px; ${msg.sentBy === 'user' ? 'text-align: right;' : ''}">
                            <div style="display: inline-block; max-width: 70%; padding: 10px 15px; border-radius: 15px; ${msg.sentBy === 'user' ? 'background-color: #007bff; color: white;' : 'background-color: #e9ecef; color: black;'}">
                                <div style="word-wrap: break-word;">${msg.text}</div>
                                <div style="font-size: 0.75rem; margin-top: 5px; opacity: 0.8;">
                                    ${new Date(msg.sentAt).toLocaleString('sv-SE')}
                                </div>
                            </div>
                        </div>
                    `).join('');

                    // Scroll to bottom
                    container.scrollTop = container.scrollHeight;
                }
            } else {
                container.innerHTML = '<p style="color: red;">Kunde inte hämta meddelanden.</p>';
            }
        } catch (error) {
            console.error('Error loading messages:', error);
            container.innerHTML = '<p style="color: red;">Ett fel uppstod.</p>';
        }
    }

    async sendMessage(text: string) {
        try {
            const token = getAuthState().token || localStorage.getItem('token');
            const response = await fetch(`/api/contacts/${this.contactId}/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ text })
            });

            if (response.ok) {
                this.loadMessages();
            } else {
                alert('Kunde inte skicka meddelande');
            }
        } catch (error) {
            console.error('Error sending message:', error);
        }
    }
}
