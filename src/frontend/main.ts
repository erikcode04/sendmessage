import './style.css'
import { Router } from './router.ts'
import { AuthPage } from './pages/auth.ts'
import { ProfilePage } from './pages/profile.ts'
import { isAuthenticated } from './utils/auth.ts'

const router = new Router();
const authPage = new AuthPage();
const profilePage = new ProfilePage();

console.log('App initialized');

router.addRoute('/', async () => {
    console.log('Auth route triggered');

    if (await isAuthenticated()) {
        console.log('User already authenticated, redirecting to profile');
        router.navigate('/profile');
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

router.init();