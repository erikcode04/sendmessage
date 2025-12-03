import { getAuthState } from '../utils/auth.ts';

export class ProfilePage {
    render(): string {
        const userJson = localStorage.getItem('user');
        const user = userJson ? JSON.parse(userJson) : { fullname: 'Användare' };

        return `
            <div class="container">
                <div class="auth-card">
                    <h2>Välkommen, ${user.fullname}!</h2>
                    <p>Du är nu inloggad.</p>
                    <div class="form-group">
                        <button id="logout-btn" class="btn btn-secondary">Logga ut</button>
                    </div>
                    <div class="form-group" style="margin-top: 20px; border-top: 1px solid #eee; padding-top: 20px;">
                        <h3>Konto inställningar</h3>
                        <button id="delete-account-btn" class="btn btn-danger" style="background-color: #dc3545;">Ta bort konto</button>
                    </div>
                </div>
            </div>
        `;
    }

    addEventListeners(router: any) {
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                router.navigate('/');
            });
        }

        const deleteAccountBtn = document.getElementById('delete-account-btn');
        if (deleteAccountBtn) {
            deleteAccountBtn.addEventListener('click', async () => {
                if (confirm('Är du säker på att du vill ta bort ditt konto? Detta går inte att ångra.')) {
                    try {
                        const token = getAuthState().token || localStorage.getItem('token');
                        const response = await fetch('/api/auth/me', {
                            method: 'DELETE',
                            headers: {
                                'Authorization': `Bearer ${token}`
                            }
                        });

                        const data = await response.json();
                        if (data.success) {
                            localStorage.removeItem('token');
                            localStorage.removeItem('user');
                            alert('Ditt konto har tagits bort.');
                            router.navigate('/');
                        } else {
                            alert(data.message || 'Kunde inte ta bort konto');
                        }
                    } catch (error) {
                        console.error('Error deleting account:', error);
                        alert('Ett fel uppstod');
                    }
                }
            });
        }
    }
}
