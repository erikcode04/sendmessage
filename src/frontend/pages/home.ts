import { getAuthState } from '../utils/auth.ts';

export class HomePage {
  render(): string {
    return `
            <div class="container">
                <div class="auth-card" style="max-width: 800px;">
                    <h2>Mina Kontakter</h2>
                    
                    <div class="form-group">
                        <h3>Lägg till ny kontakt</h3>
                        <form id="add-contact-form">
                            <div class="form-group">
                                <label for="contact-name">Namn</label>
                                <input type="text" id="contact-name" class="form-control" required>
                            </div>
                            <div class="form-group">
                                <label for="contact-phone">Telefonnummer</label>
                                <input type="tel" id="contact-phone" class="form-control" required>
                            </div>
                            <button type="submit" class="btn btn-primary">Lägg till</button>
                        </form>
                    </div>

                    <div class="contacts-list" style="margin-top: 30px;">
                        <h3>Sparade kontakter</h3>
                        <div id="contacts-container">
                            <p>Laddar kontakter...</p>
                        </div>
                    </div>

                    <div style="margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
                        <button id="profile-btn" class="btn btn-secondary">Gå till profil</button>
                    </div>
                </div>
            </div>
        `;
  }

  addEventListeners(router: any) {
    const form = document.getElementById('add-contact-form') as HTMLFormElement;
    const profileBtn = document.getElementById('profile-btn');

    if (profileBtn) {
      profileBtn.addEventListener('click', () => {
        router.navigate('/profile');
      });
    }

    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const nameInput = document.getElementById('contact-name') as HTMLInputElement;
        const phoneInput = document.getElementById('contact-phone') as HTMLInputElement;

        const name = nameInput.value;
        const phoneNumber = phoneInput.value;

        try {
          const token = getAuthState().token || localStorage.getItem('token');
          const response = await fetch('/api/contacts', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ name, phoneNumber })
          });

          if (response.ok) {
            nameInput.value = '';
            phoneInput.value = '';
            this.loadContacts();
          } else {
            alert('Kunde inte spara kontakt');
          }
        } catch (error) {
          console.error('Error saving contact:', error);
        }
      });
    }

    this.loadContacts();
  }

  async loadContacts() {
    const container = document.getElementById('contacts-container');
    if (!container) return;

    try {
      const token = getAuthState().token || localStorage.getItem('token');
      const response = await fetch('/api/contacts', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }); if (response.ok) {
        const contacts = await response.json();
        if (contacts.length === 0) {
          container.innerHTML = '<p>Inga kontakter sparade än.</p>';
        } else {
          container.innerHTML = contacts.map((contact: any) => `
                        <div class="contact-item" style="padding: 10px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <strong>${contact.name}</strong><br>
                                <span>${contact.phoneNumber}</span>
                            </div>
                            <button class="btn btn-danger btn-sm delete-contact-btn" data-id="${contact.id}">Ta bort</button>
                        </div>
                    `).join('');

          // Add delete listeners
          document.querySelectorAll('.delete-contact-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
              const id = (e.target as HTMLElement).dataset.id;
              await this.deleteContact(id!);
            });
          });
        }
      } else {
        container.innerHTML = '<p>Kunde inte hämta kontakter.</p>';
      }
    } catch (error) {
      console.error('Error loading contacts:', error);
      container.innerHTML = '<p>Ett fel uppstod.</p>';
    }
  }

  async deleteContact(id: string) {
    if (!confirm('Vill du ta bort denna kontakt?')) return;

    try {
      const token = getAuthState().token || localStorage.getItem('token');
      const response = await fetch(`/api/contacts/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }); if (response.ok) {
        this.loadContacts();
      } else {
        alert('Kunde inte ta bort kontakt');
      }
    } catch (error) {
      console.error('Error deleting contact:', error);
    }
  }
}
