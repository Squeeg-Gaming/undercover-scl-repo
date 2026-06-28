import List from './pages/List.js?a=1';
import Leaderboard from './pages/Leaderboard.js';
import Roulette from './pages/Roulette.js';
import Statistics from './pages/Statistics.js';
import Packs from './pages/ListPacks.js';
 
export default [
    { path: '/', component: List },
    { path: '/leaderboard', component: Leaderboard },
    { path: '/roulette', component: Roulette },
    { path: '/statistics', component: Statistics },
    { path: '/packs', component: Packs },
];
