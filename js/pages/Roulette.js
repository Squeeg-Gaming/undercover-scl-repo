import { fetchList } from '../content.js';
import { getThumbnailFromId, getYoutubeIdFromUrl, shuffle, getLevelThumbnailR } from '../util.js';

import Spinner from '../components/Spinner.js';
import Btn from '../components/Btn.js';

export default {
    components: { Spinner, Btn },
    template: `
        <main v-if="loading">
            <Spinner></Spinner>
        </main>
        <main v-else class="page-roulette">
            <div class="sidebar">
                <p class="type-label-md" style="color: #aaa">
                    Copy of the Extreme Demon Roulette by <a href="https://matcool.github.io/extreme-demon-roulette/" target="_blank">matcool</a>.
                </p>
                <form class="options">
                    <div class="check">
                        <input type="checkbox" id="main" value="Main List" v-model="useMainList">
                        <label for="main">Main List</label>
                    </div>
                    <div class="check">
                        <input type="checkbox" id="extended" value="Extended List" v-model="useExtendedList">
                        <label for="extended">Extended List</label>
                    </div>
                    <Btn @click.native.prevent="onStart">{{ levels.length === 0 ? 'Start' : 'Restart'}}</Btn>
                </form>
                <p class="type-label-md" style="color: #aaa">
                    The roulette saves automatically.
                </p>
                <form class="save">
                    <p>Manual Load/Save</p>
                    <div class="btns">
                        <Btn @click.native.prevent="onImport">Import</Btn>
                        <Btn :disabled="!isActive" @click.native.prevent="onExport">Export</Btn>
                    </div>
                </form>
            </div>
            <section class="levels-container">
                <div class="levels">
                    <template v-if="levels.length > 0">
                        <!-- Completed Levels -->
                        <div class="level" v-for="(level, i) in levels.slice(0, progression.length)">
                            <a :href="level.video" class="video">
                            	<!-- wnioskuj -->
                                <!-- width="1280" height="720" -->
                                <img :src="getThumbnailFromId(getYoutubeIdFromUrl(level.video))" alt="" >
                            </a>
                            <div class="meta" :style="getLevelThumbnailR(i, levels)">
                                <p>#{{ level.rank }}</p>
                                <h2>{{ level.name }}</h2>
                                <p style="color: #00b54b; font-weight: 700">{{ progression[i] }}%</p>
                            </div>
                        </div>
                        <!-- Current Level -->
                        <div class="level" v-if="!hasCompleted">
                            <a :href="currentLevel.video" target="_blank" class="video">
                                <img :src="getThumbnailFromId(getYoutubeIdFromUrl(currentLevel.video))" alt="">
                            </a>
                            <div class="meta" :style="getLevelThumbnailR(this.progression.length, levels)">
                                <p>#{{ currentLevel.rank }}</p>
                                <h2>{{ currentLevel.name }}</h2>
                                <div class="button-holder" style="justify-content: flex-start; align-items: normal;">
                                <!-- money folder -->
                                    <a v-if="currentLevel.scratchLink != null" :href="currentLevel.scratchLink" target="_blank">
                                        <button class="link-button" style="background-color: #f7a935; border-color: #f7a935;">
                                            <img src="../assets/scratchS.svg" class="button-center" style="width:70%;">
                                        </button>
                                    </a>
                                    <a v-if="currentLevel.turbowarpLink != null" :href="currentLevel.turbowarpLink" target="_blank">
                                        <button class="link-button" style="background-color: #ff4c4c; border-color: #ff4c4c;">
                                            <img src="../assets/turbowarpT.svg" class="button-center" style="width:110%;">
                                        </button>
                                    </a>
                                    <a v-if="currentLevel.itchLink != null" :href="currentLevel.itchLink" target="_blank">
                                        <button class="link-button" style="background-color: #fa5c5c; border-color: #fa5c5c;">
                                            <img src="../assets/itchioShop.svg" class="button-center" style="width:100%;"></button>
                                    </a>
                                    <a v-if="currentLevel.itchLink2 != null" :href="currentLevel.itchLink2" target="_blank">
                                        <button class="link-button" style="background-color: #7d2e2e; border-color: #7d2e2e;">
                                            <p class="button-center" style="width: 100%;">LDM</p>
                                        </button>
                                    </a>                                
                                </div>
                            </div>
                            <form class="actions" v-if="!givenUp">
                                <input type="number" v-model="percentage" :placeholder="placeholder" :min="currentPercentage + 1" max=100>
                                <Btn @click.native.prevent="onDone">Done</Btn>
                                <Btn @click.native.prevent="onGiveUp" style="background-color: #e91e63;">Give Up</Btn>
                            </form>
                        </div>
                        <!-- Results -->
                        <div v-if="givenUp || hasCompleted" class="results">
                            <h1>Results</h1>
                            <p>Number of levels: {{ progression.length }}</p>
                            <p>Highest percent: {{ currentPercentage }}%</p>
                            <Btn v-if="currentPercentage < 99 && !hasCompleted" @click.native.prevent="showRemaining = true">Show remaining levels</Btn>
                            <article v-if="hasCompleted"><article v-if="onWin"></article></article>
                        </div>
                        <!-- Remaining Levels -->
                        <template v-if="givenUp && showRemaining">
                            <div class="level" v-for="(level, i) in levels.slice(progression.length + 1, levels.length - currentPercentage + progression.length)" :key="level.id || i">
                                <a :href="level.video" target="_blank" class="video">
                                    <img :src="getThumbnailFromId(getYoutubeIdFromUrl(level.video))" alt="">
                                </a>
                                <div class="meta" :style="getLevelThumbnailR(currentPercentage + 1 + i, levels)">
                                    <p>#{{ level.rank }}</p>
                                    <h2>{{ level.name }}</h2>
                                    <p style="color: #d50000; font-weight: 700">{{ currentPercentage + 2 + i }}%</p>
                                                                    <div class="button-holder" style="justify-content: flex-start; align-items: normal;">
                                <!-- money folder -->
                                    <a v-if="level.scratchLink != null" :href="level.scratchLink" target="_blank">
                                        <button class="link-button" style="background-color: #f7a935; border-color: #f7a935;">
                                            <img src="../assets/scratchS.svg" class="button-center" style="width:70%;">
                                        </button>
                                    </a>
                                    <a v-if="level.turbowarpLink != null" :href="level.turbowarpLink" target="_blank">
                                        <button class="link-button" style="background-color: #ff4c4c; border-color: #ff4c4c;">
                                            <img src="../assets/turbowarpT.svg" class="button-center" style="width:110%;">
                                        </button>
                                    </a>
                                    <a v-if="level.itchLink != null" :href="level.itchLink" target="_blank">
                                        <button class="link-button" style="background-color: #fa5c5c; border-color: #fa5c5c;">
                                            <img src="../assets/itchioShop.svg" class="button-center" style="width:100%;"></button>
                                    </a>
                                    <a v-if="level.itchLink2 != null" :href="level.itchLink2" target="_blank">
                                        <button class="link-button" style="background-color: #7d2e2e; border-color: #7d2e2e;">
                                            <p class="button-center" style="width: 100%;">LDM</p>
                                        </button>
                                    </a>                                
                                </div>
                                </div>
                            </div>
                        </template>
                    </template>
                </div>
            </section>
            <div class="toasts-container">
                <div class="toasts">
                    <div v-for="toast in toasts" class="toast">
                        <p>{{ toast }}</p>
                    </div>
                </div>
            </div>
        </main>
    `,
    data: () => ({
        loading: false,
        levels: [],
        progression: [], // list of percentages completed
        percentage: undefined,
        givenUp: false,
        showRemaining: false,
        useMainList: true,
        useExtendedList: true,
        toasts: [],
        fileInput: undefined,
    }),
    mounted() {
        // Create File Input
        this.fileInput = document.createElement('input');
        this.fileInput.type = 'file';
        this.fileInput.multiple = false;
        this.fileInput.accept = '.json';
        this.fileInput.addEventListener('change', this.onImportUpload);

        // Load progress from local storage
        const roulette = JSON.parse(localStorage.getItem('roulette'));

        if (!roulette) {
            return;
        }

        this.levels = roulette.levels;
        this.progression = roulette.progression;
    },
    computed: {
        currentLevel() {
            console.error("aw shit");
            console.error(this.levels[this.progression.length].video);
            console.error(this.levels[this.progression.length].scratchLink);
            return this.levels[this.progression.length];
        },
        currentPercentage() {
            return this.progression[this.progression.length - 1] || 0;
        },
        placeholder() {
            return `At least ${this.currentPercentage + 1}%`;
        },
        hasCompleted() {
            return (
                this.progression[this.progression.length - 1] >= 100 ||
                this.progression.length === this.levels.length
            );
        },
        isActive() {
            return (
                this.progression.length > 0 &&
                !this.givenUp &&
                !this.hasCompleted
            );
        },
    },
    methods: {
        getLevelThumbnailR,
        shuffle,
        getThumbnailFromId,
        getYoutubeIdFromUrl,
        async onStart() {
            if (this.isActive) {
                this.showToast('Give up before starting a new roulette.');
                return;
            }

            if (!this.useMainList && !this.useExtendedList) {
                return;
            }

            this.loading = true;

            const fullList = await fetchList();

            if (fullList.filter(([_, err]) => err).length > 0) {
                this.loading = false;
                this.showToast(
                    'List is currently broken. Wait until it\'s fixed to start a roulette.',
                );
                return;
            }

            const fullListMapped = fullList.map(([lvl, _], i) => ({
                rank: i + 1,
                id: lvl.id,
                name: lvl.name,
                video: lvl.verification,
                scratchLink: lvl.scratchLink,
                turbowarpLink: lvl.turbowarpLink,
                itchLink: lvl.itchLink,
                itchLink2: lvl.itchLink2,
            }));
            const list = [];
            if (this.useMainList) list.push(...fullListMapped.slice(0, 75));
            if (this.useExtendedList) {
                list.push(...fullListMapped.slice(75, 150));
            }
            this.levels = shuffle(list).slice(0, 100);
            this.showRemaining = false;
            this.givenUp = false;
            this.progression = [];
            this.percentage = undefined;

            this.loading = false;
        },
        save() {
            localStorage.setItem(
                'roulette',
                JSON.stringify({
                    levels: this.levels,
                    progression: this.progression,
                }),
            );
        },
        onDone() {
            if (!this.percentage) {
                return;
            }

            if (
                this.percentage <= this.currentPercentage ||
                this.percentage > 100
            ) {
                this.showToast('Invalid percentage.');
                return;
            }

            this.progression.push(this.percentage);
            this.percentage = undefined;

            this.save();
        },
        onGiveUp() {
            this.givenUp = true;

            // Save progress
            localStorage.removeItem('roulette');
        },
        onImport() {
            if (
                this.isActive &&
                !window.confirm('This will overwrite the currently running roulette. Continue?')
            ) {
                return;
            }

            this.fileInput.showPicker();
        },
        async onImportUpload() {
            if (this.fileInput.files.length === 0) return;

            const file = this.fileInput.files[0];

            if (file.type !== 'application/json') {
                this.showToast('Invalid file.');
                return;
            }

            try {
                const roulette = JSON.parse(await file.text());

                if (!roulette.levels || !roulette.progression) {
                    this.showToast('Invalid file.');
                    return;
                }

                this.levels = roulette.levels;
                this.progression = roulette.progression;
                this.save();
                this.givenUp = false;
                this.showRemaining = false;
                this.percentage = undefined;
            } catch {
                this.showToast('Invalid file.');
                return;
            }
        },
        onExport() {
            const file = new Blob(
                [JSON.stringify({
                    levels: this.levels,
                    progression: this.progression,
                })],
                { type: 'application/json' },
            );
            const a = document.createElement('a');
            a.href = URL.createObjectURL(file);
            a.download = 'sgdl_roulette';
            a.click();
            URL.revokeObjectURL(a.href);
        },
        showToast(msg) {
            this.toasts.push(msg);
            setTimeout(() => {
                this.toasts.shift();
            }, 3000);
        },
    },
};
