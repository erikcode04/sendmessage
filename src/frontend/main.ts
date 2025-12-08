import './style.css'
import { Router } from './router.ts'
import { AuthPage } from './pages/auth.ts'
import { ProfilePage } from './pages/profile.ts'
import { HomePage } from './pages/home.ts'
import { MessagesPage } from './pages/messages.ts'
import { isAuthenticated } from './utils/auth.ts'

const router = new Router();
const authPage = new AuthPage();
const profilePage = new ProfilePage();
const homePage = new HomePage();
const messagesPage = new MessagesPage();

// Store router globally so pages can access it
(window as any).currentRouter = router;

console.log('App initialized');

router.addRoute('/', async () => {
    console.log('Auth route triggered');

    if (await isAuthenticated()) {
        console.log('User already authenticated, redirecting to home');
        router.navigate('/home');
        return;
    }

    const app = document.querySelector<HTMLDivElement>('#app')!;
    app.innerHTML = authPage.render();
    authPage.addEventListeners(router);
});

router.addRoute('/profile', () => {
    console.log('Profile route triggered');
    const app = document.querySelector<HTMLDivElement>('#app')!;
    app.innerHTML = profilePage.render();
    profilePage.addEventListeners(router);
});

router.addRoute('/home', async () => {
    console.log('Home route triggered');

    if (!await isAuthenticated()) {
        console.log('User not authenticated, redirecting to login');
        router.navigate('/');
        return;
    }

    const app = document.querySelector<HTMLDivElement>('#app')!;
    app.innerHTML = homePage.render();
    homePage.addEventListeners(router);
});

router.addRoute('/messages/:contactId/:contactName', async () => {
    console.log('Messages route triggered');

    if (!await isAuthenticated()) {
        console.log('User not authenticated, redirecting to login');
        router.navigate('/');
        return;
    }

    const path = window.location.pathname;
    const parts = path.split('/');
    const contactId = parts[2];
    const contactName = decodeURIComponent(parts[3]);

    const app = document.querySelector<HTMLDivElement>('#app')!;
    app.innerHTML = messagesPage.render(contactId, contactName);
    messagesPage.addEventListeners(router);
});

router.init();