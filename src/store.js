import Vue from 'vue'
import Vuex from 'vuex'
import VuexPersist from './store-plugins/vuex-persist'

const {app} = require('electron').remote;
const persist = new VuexPersist({
    path: app.getPath('userData')
})

const {webFrame} = require('electron')

Vue.use(Vuex)

export default new Vuex.Store({
    state: {
        transmissionOptions : {
            url: '/transmission/rpc',
            host: 'localhost',
            port: 9091,
            ssl: false,
            key: null,
            username: null,
            password: null
        },
        torrentsSortBy: { id: 'addedDate', 'label' : 'Age'},
        ftpOptions : {
            ftpConnection: {
                host: 'host',
                user: 'username',
                password: 'password'
            },
            localTargetDir: '',
            maxTransferts: 2,
            sortBy: { id: 'lastModification', 'label' : 'Dernière Modification'}
        },
        yggtorrentOptions : {
            username: 'username',
            password: 'password'
        },
        theme: {
            dark: true,
            zoom: null
        },
        downloadQueue: []
    },
    getters: {
    },
    mutations: {
        setTransmissionOptions(state, options) {
            state.transmissionOptions = Object.assign(options)
        },
        setFtpOptions(state, options) {
            state.ftpOptions = Object.assign(options)
        },
        setYggtorrentOptions(state, options) {
            state.yggtorrentOptions = Object.assign(options)
        },
        setTorrentsSortBy(state, sortBy) {
            state.torrentsSortBy = sortBy
        },
        setTheme(state, theme) {
            state.theme = theme
            webFrame.setZoomFactor(parseFloat(state.theme.zoom))
        },
        setDownloadQueue(state, downloadQueue) {
            state.downloadQueue = downloadQueue
        },
        setFTPSortBy(state, sortBy) {
            state.ftpOptions.sortBy = sortBy
        }
    },
    actions: {

    },
    plugins: [persist.subscribe()]
})
