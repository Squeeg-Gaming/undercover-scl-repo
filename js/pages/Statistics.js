import { fetchLeaderboard, fetchList } from '../content.js';
import { localize, getPeople, otherStats } from '../util.js';

import Spinner from '../components/Spinner.js';

export default {
    components: {
        Spinner,
    },
    data: () => ({
        leaderboard: [],
        loading: true,
        selected: 0,
        err: [],
    }),
    template: `
	<main style="display: flex; flex-direction: column; align-items: center; gap: 24px; text-align: center;">
		<p> </p>
        <div style="display: flex; flex-direction: row; align-items: center; gap: 12px; overflow: hidden;">
        	<h1 id="displayListLength" style="line-height: 1.1; margin: 0;">???</h1>
        	<p>levels on the list</p>
    	</div>
        <div style="display: flex; flex-direction: row; align-items: center; gap: 12px; overflow: hidden;">
        	<p>It has been</p>
        	<h1 id="displayDaysSincePublic" style="line-height: 1.1; margin: 0;">???</h1>
        	<p>days since the list became public</p>
    	</div>
    	<div style="display: flex; flex-direction: row; align-items: center; gap: 12px; overflow: hidden;">
        	<img src="../assets/pig.svg" height="128">
        	<p>pig</p>
    	</div>
	</main>
    `,
    computed: {
        entry() {
            return this.leaderboard[this.selected];
        },
    },
    async mounted() {
        getPeople();
        this.list = await fetchList();
        await otherStats(this.list);
        console.log(this.list.length);
        this.loading = false;
    },
    methods: {
        localize,
    },
};
