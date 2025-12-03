import './style.css'
import { Router } from './router.ts'
import { AuthPage } from './pages/auth.ts'
import { ProfilePage } from './pages/profile.ts'
import { HomePage } from './pages/home.ts'
import { isAuthenticated } from './utils/auth.ts'

const router = new Router();
const authPage = new AuthPage();
const profilePage = new ProfilePage();
const homePage = new HomePage();

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

router.init();