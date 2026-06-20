import { store } from "../main.js";
import { embed, getEngineSelect, getSelectSelect, doStuff, getThumbnailImage, incVisits, getYoutubeIdFromUrl, getLevelThumbnail, listLevelNameFilter, getFpsSelect } from "../util.js";
import { score } from "../score.js";
import { fetchEditors, fetchList, fetchPacks } from "../content.js";

import Spinner from "../components/Spinner.js";
import LevelAuthors from "../components/List/LevelAuthors.js";

const roleIconMap = {
    owner: "crown",
    admin: "user-gear",
    helper: "user-shield",
    dev: "code",
    trial: "user-lock",
};

export default {
    components: { Spinner, LevelAuthors },
    template: `
        <main v-if="loading">
            <Spinner></Spinner>
        </main>
        <main v-else class="page-list">
            <div class="list-container">
		<div style="display: grid;">
			<input v-model="searchQuery" placeholder="Input text to Filter! here..." class="btn" type="text" id="filterForLevelName"/>
		</div>
                <table class="list" v-if="list && list.length">
                    <tr v-for="(item, i) in filteredListDisplay" :key="item.originalIndex">
                                <td class="rank">
                                    <p v-if="item.originalIndex + 1 <= 900" class="type-label-lg">#{{ item.originalIndex + 1 }}</p>
                                    <p v-else class="type-label-lg">Legacy</p>
                                </td>
                                <td class="level" :class="{ 'active': selected === item.originalIndex, 'error': !item.level }">
                                    <button id="levelThumbnailReal" @click="selected = item.originalIndex" style="background-color: rgb(255 0 0 / 0); width: 90%; margin: 0.5em;" :style="getLevelThumbnail(item.originalIndex, list)" :class="{ 'active': selected === item.originalIndex, 'error': !item.level }">
                                        <span class="type-label-lg
                                        ">{{ item.level?.name || \`Error (\${item.err}.json)\` }}</span>
                                        <span class="type-label-sm">Verified by {{ item.level.verifier }}</span>
                                    </button>
                                </td>
                    </tr>
                </table>
                <p v-if="list && list.length > 0 && filteredListDisplay && filteredListDisplay.length === 0" class="type-body-lg">
					<br>
                    No levels found matching your search.
                </p>
            </div>
            <div class="level-container">
			<a v-if="level" @click="selected = null">back</a>
                <div class="level" v-if="level">
					<div style="display: flex; flex-direction: column; gap: 1rem; width: 100%; justify-self: center;">
                    <div class="button-holder" style="gap: 1em; ">
                        <h1>{{ level.name }}</h1>
                    </div>
                    <h1 style="border-bottom: 1px solid #808080;padding-bottom: 8px;"></h1>
					<p class="desc" v-if="level.description" v-html="level.description"></p>
					</div>
                    <LevelAuthors :author="level.author" :creators="level.creators" :verifier="level.verifier" :engine="level.engine"></LevelAuthors>
                    <iframe class="video" id="videoframe" :src="video" frameborder="0" allowfullscreen scrolling="no" allow="encrypted-media *; fullscreen *;" style="border-radius: 1rem;"></iframe>
                    <ul class="stats">
                        <li>
                            <div class="type-title-sm">Points when completed</div>
                            <p>{{ score(selected + 1, 100, level.percentToQualify) }}</p>
                        </li>
                        <li>
                            <div class="type-title-sm">ID</div>
                            <p>{{ level.id }}</p>
                        </li>
                        <li>
                            <div class="type-title-sm">Method</div>
                            <p>{{ level.password || 'Free to Copy' }}</p>
                        </li>
                    </ul>
                    <h2>Records ({{ level.records.length }})</h2>
                    <p v-if="selected + 1 <= 200"><strong>{{ level.percentToQualify }}%</strong> or better to qualify</p>
                    <p v-else-if="selected +1 <= 500"><strong>100%</strong> or better to qualify</p>
                    <p v-else>This level does not accept new records.</p>
                    <p v-if="level.legacy">This level should be beaten with legacy hitboxes</p>
                    <p v-else-if="level.legacy == false">This level must be beaten using the new hitboxes</p>
                    <p v-if="level.twoplayer">This level must be beaten solo to qualify</p>
                    <table class="records">
                        <tr v-for="record in level.records" class="record">
                            <td class="percent">
                                <p>{{ record.percent }}%</p>
                            </td>
                            <td class="user">
                                <a :href="record.link" target="_blank" class="type-label-lg">{{ record.user }}</a>
                            </td>
                            <td class="mobile">
                                <img v-if="record.mobile" :src="\`/assets/phone-landscape\${store.dark ? '-dark' : ''}.svg\`" alt="Mobile">
                            </td>
                            <td class="hz">
                                <p>{{ record.hz }}</p>
                            </td>
                        </tr>
                    </table>
                </div>
                    <div v-else-if="selected == null" class="level" style="height: 100%; display: flex; justify-content: center; align-items: center; text-align: center;">
                    <h2>Welcome to the Spam Challenge List!</h2>
                    <p>Click the levels on the left side to see information about them!</p>
                    <p>For more information about the submission rules check the right side!</p>
                    <button class="btn" @click="selected = Math.ceil(Math.random() * list.length)">
                    	<span class="type-label-lg">I'm feeling lucky</span>
					</button>
                    <h2>Filter levels:</h2>
					<form action="#" class="type-label-lg">
                        <div style="display: flex; align-items: center; gap: 10px;">
                    	    <select class="btn" v-model="engineSelected" id="method" name="method">
                        	    <option class="type-label-lg" value="All" selected>Any Method</option>
                                <option class="type-label-lg" value="Alternating">Alternating</option>
                                <option class="type-label-lg" value="Jitter">Jitter</option>
                                <option class="type-label-lg" value='["Altjitter","Alterjitter","Ludwig"]'>Alterjitter/Ludwig</option>
                                <option class="type-label-lg" value="Rake">Rake</option>
                                <option class="type-label-lg" value='["G502","G512","K55","K70"]'>Capped Devices</option>
                                <option class="type-label-lg" value='["Scroll Clicking","Geode Scroll","FlyHec","Lip Spam"]'>Others</option>
                            </select>
                    	    <input type="text" class="btn" v-model="fpsSelected" id="fps" name="fps" placeholder="Enter FPS value" autocomplete="off">
					        <button class="btn" type="button" @click="applyFilters()">Filter!</button>
                        </div>
					</form>
                    <a class="nav__icon" href="https://discord.gg/d47pcnV7Fg">
                        <img src="../assets/discord.svg" alt="Discord Logo" />
                    </a>
                    <p>
                    	<a href="https://discord.com/invite/d47pcnV7Fg">
                        	join our discord please
                        </a>
                    </p>
					<h2>Changelog</h2>

			<!-- new guide -->

			<!-- add level: <p class="cl">- <clw>name</clw> has been placed at <clw>#</clw>, above <clw>name</clw> and below <clw>name</clw></p> -->
			<!-- raise level: <p class="cl">- <clw>name</clw> has been raised from <clw>#</clw> to <clw>#</clw>, above <clw>name</clw> and below <clw>name</clw></p> -->
			<!-- lower level: <p class="cl">- <clw>name</clw> has been lowered from <clw>#</clw> to <clw>#</clw>, above <clw>name</clw> and below <clw>name</clw></p> -->
			<!-- swap levels: <p class="cl">- <clw>name</clw> and <clw>name</clw> have been swapped, with <clw>name</clw> now sitting above at <clw>#</clw></p> -->
			<!-- delete level: <p class="cl">- <clw>name</clw> have been removed</p> --> 

                    <main style="display: flex; flex-direction: column; align-items: left; gap: 24px; text-align: left; overflow: hidden; overflow-y: auto; max-height: 300px; width: 700px; border: 3px solid var(--color-primary); border-radius: 5px;">
            			<div style="display: flex; flex-direction: column; align-items: left; gap: 24px; overflow: visible; margin-left: 10px; margin-top: 12px">
                            <h2>5/30/26</h2>
                            <p class="cl">- <clw>Acidic</clw> has been placed at <clw>#1</clw></p>
							<p class="cl">hello changelog!</p>
				</div>
        			</main>
                </div>
            </div>
            <div class="meta-container">
                <div class="meta">
                    <div class="errors" v-show="errors.length > 0">
                        <p class="error" v-for="error of errors">{{ error }}</p>
                    </div>
                    <div class="og">
                        <p class="type-label-md">Website layout made by <a href="https://tsl.pages.dev" style="text-decoration: underline;" target="_blank">TheShittyList</a> and <a href="https://sgdlist.pages.dev/" style="text-decoration: underline;" target="_blank">SGD Level List</a>. <br> UI inspired by <a href="https://aredl.net" style="text-decoration: underline;" target="_blank">The All Rated Extreme Demons List</a>. <br> Points equation stolen from <a href="https://list-calc.finite-weeb.xyz" style="text-decoration: underline;" target="_blank">this peak website</a> and <a href="https://www.pointercrate.com" style="text-decoration: underline;" target="_blank">Pointercrate</a>.</p>
		    </div>
                    <template v-if="editors">
                        <h2>List Moderators</h2>
                        <ol class="editors">
                            <li v-for="editor in editors">
                                <img :src="\`/assets/\${roleIconMap[editor.role]}\${store.dark ? '-dark' : ''}.svg\`" :alt="editor.role">
                                <a v-if="editor.link" class="type-label-lg link" target="_blank" :href="editor.link">{{ editor.name }}</a>
                                <p v-else>{{ editor.name }}</p>
                            </li>
                        </ol>
                    </template>
                    <h2>Submission Requirements</h2>
                    <h3 style="font-weight: 550;">
                        Record submission:
                    </h3>
                    <p>
                        - Achieved the record without using hacks, Footage must not be cropped
                    </p>
                    <p>
                        - Completions done after 5/30/26 must have a previous death in the recording
                    </p>
                    <p>
                        - Use of bots or autoclickers will result in a permanent list ban
                    </p>
                    <p>
                        - Levels must be made ON SCRATCH, levels on CodeTorch are also allowed
                    </p>
                    <h3 style="font-weight: 550;">
                        Level requirement:
                    </h3>
                    <p>
                        - Levels must be more than 5 clicks in length
                    </p>
                    <p>
			- Bug fixes will not place seperately
                    </p>
                    <p>
                        - Lazily modified levels will be taken on a case by case basis
                    </p>
                </div>
            </div>
        </main>
    `,
    data: () => ({
        list: [],
        editors: [],
        loading: true,
        selected: null,
        engineAsked: getEngineSelect(),
        fpsAsked: getFpsSelect(),
        engineSelected: "All",
        fpsSelected: "",
		grat: "../assets/levels/",
        fileFormat: "h",
        sdhfkjsdbhfkjs: "assets/levels/B R A I N S P A C E.png",
        levelSearch: null,
        searchQuery: '',
        ii: 0,
        blt: 0,
        errors: [],
        roleIconMap,
        store,
    }),
    computed: {
        getDemonDifficulty() {
            if (this.selected == null) {
            	return 0;
            } else {
                if (this.list[this.selected][0].demonDifficulty == "Iraq Demon") {
                    this.fileFormat = '.svg';
                } else {
                    this.fileFormat = '.png';
                }
                if (this.list[this.selected][0].demonDifficulty == "PETA Demon") {
                    return "https://www.peta.org/wp-content/themes/peta/src/assets/images/svgs/peta-logo.svg";
                } else if (this.list[this.selected][0].demonDifficulty == "Poopy Demon") {
                    return "https://raw.githubusercontent.com/twitter/twemoji/a6f943b958d94b2b82f886aa540b915d9a694a75/assets/svg/1f4a9.svg";
                } else if (this.list[this.selected][0].demonDifficulty == "love Demon") {
                    return "https://upload.wikimedia.org/wikipedia/commons/c/c8/Twemoji15.0.2_1fa77.svg";
                } else if (this.list[this.selected][0].demonDifficulty == "Top 14 Very Hard Timing Map Very Demon") {
                    return "https://media.tenor.com/ejuK2N9toPMAAAAe/gd-geometry-dash.png";
                } else if (this.list[this.selected][0].name == "Lucid Dreaming") {
                    return "https://upload.wikimedia.org/wikipedia/commons/7/72/Twemoji_1f634.svg";
                }
                // Playstation Vita credit: https://image.ceneostatic.pl/data/products/13107195/i-sony-playstation-vita-wifi.jpg can we even use this legally idk don't sue
                return encodeURI(`assets/difficulties/${this.list[this.selected][0].demonDifficulty}${this.fileFormat}`);
            }
        },
        level() {
            if (this.selected == null) {
            	return 0;
            } else {
                return this.list[this.selected][0];
            }
        },
        originalListWithIndex() {
            return (this.list || []).map(([level, err], index) => ({
                level,
                err,
                originalIndex: index,
            }));
        },
        filteredListDisplay() {
    let filtered = this.originalListWithIndex;
    if (this.searchQuery.trim()) {
        const searchTerm = this.searchQuery.toLowerCase();
        filtered = filtered.filter(item => 
            item.level?.name?.toLowerCase().includes(searchTerm)
        );
    }
    if (this.engineAsked && this.engineAsked !== "All") {
        const engineFilter = Array.isArray(this.engineAsked) ? this.engineAsked : [this.engineAsked];
        filtered = filtered.filter(item =>
            (item.level?.password || '')
                .split('/')
                .map(s => s.trim())
                .some(pwd => engineFilter.includes(pwd))
        );
    }
    if (this.fpsAsked && this.fpsAsked.trim() !== "") {
        const fpsLower = this.fpsAsked.toLowerCase();
        filtered = filtered.filter(item =>
            (item.level?.password || '')
                .split('/')
                .map(s => s.trim().replace(/fps/i, '').toLowerCase())
                .some(pwd => pwd === fpsLower)
        );
    }

    return filtered;
},
		originalPacksWithIndex() {
            console.error(this.packs);
            return this.packs;
        },
        video() {
            if (!this.level.showcase) {
				console.warn("! Level Names:");
				for (let i = 0; i < this.list.length; i++) {
                    console.warn(this.list[i][0].name);
                }
				console.warn("! Level Info:");
				for (let i = 0; i < this.list.length; i++) {
                    console.warn(this.list[i][0].name + "⓪" + this.list[i][0].verifier + "⓪" + this.list[i][0].author + "⓪" + this.list[i][0].engine + "⓪");
                }
				console.warn("! Level URL's:");
                for (let i = 0; i < this.list.length; i++) {
                    console.warn(this.list[i][0].id + "⓪" + this.list[i][0].itchLink + "⓪" + this.list[i][0].itchLink2 + "⓪");
                }
				console.warn("! Level Videos:");
                for (let i = 0; i < this.list.length; i++) {
                    console.warn(getYoutubeIdFromUrl(this.list[i][0].verification));
                }
				
                return embed(this.level.verification);
            }

            return embed(
                this.toggledShowcase
                    ? this.level.showcase
                    : this.level.verification
            );
        },
    },
    watch: {
        filteredListDisplay: {
            handler(newList) {
                if (newList.length > 0) {
                    const currentSelectionInNewList = newList.find(item => item.originalIndex === this.selected);
                    if (!currentSelectionInNewList) {
                        this.selected = newList[0].originalIndex;
                    }
                } else {
                    this.selected = null;
                }
            },
        },
    },
    async mounted() {
        // Hide loading spinner
        this.list = await fetchList();
        this.editors = await fetchEditors();
		this.packs = await fetchPacks();
        this.selected = await getSelectSelect(this.list);

        // Error handling
        if (!this.list) {
            this.errors = [
                "Failed to load list. Retry in a few minutes or notify list staff.",
            ];
        } else {
            this.errors.push(
                ...this.list
                    .filter(([_, err]) => err)
                    .map(([_, err]) => {
                        return `Failed to load level. (${err}.json)`;
                    })
            );
            if (!this.editors) {
                this.errors.push("Failed to load list editors.");
            }
        }

        this.loading = false;
    },
    methods: {
    applyFilters() {
        this.engineAsked = this.engineSelected;
        this.fpsAsked = this.fpsSelected.trim() || null;
        try {
            const parsed = JSON.parse(this.engineAsked);
            if (Array.isArray(parsed)) this.engineAsked = parsed;
        } catch (e) {
        }
    },
        embed,
        score,
        getLevelThumbnail,
        getThumbnailImage,
        listLevelNameFilter,
    },
};
