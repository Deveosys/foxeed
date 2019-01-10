import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import Transmission from './lib/transmission.js'
import PromiseFtp from 'promise-ftp'

require('uikit')

// require('uikit')

Vue.config.productionTip = true

//////////////////////////
// ELECTRON GLOBAL ZOOM //
//////////////////////////
const {webFrame} = require('electron')

///////////////////////////////
// GOBAL TRANSMISSION OBJECT //
///////////////////////////////
const transmission = new Transmission(store.state.transmissionOptions)
Vue.prototype.$transmission = transmission

//////////////////////////////
// FTP QUEUES               //
//////////////////////////////
Vue.prototype.$ftpQueues = {
    waitingQueue: [],
    completedQueue: [],
    downloadingQueue: [],
    connectionsQueue: []
}

////////////////////////
// Vue custom filters //
////////////////////////
import prettyBytes from './filters/prettyBytes'
Vue.filter('prettyBytes', prettyBytes)

import fromNow from './filters/fromNow'
Vue.filter('fromNow', fromNow)

new Vue({
    router,
    store,
    render: h => h(App),
    mounted() {
        // Prevent blank screen in Electron builds
        this.$router.push('/')
    },
    created() {
        this.checkConfig()
        this.applyInitSettings()
    },
    methods: {
        checkConfig() {

            let theme = this.$store.state.theme
            if (theme.zoom == null) {
                theme.zoom = 0.8;
                this.$store.commit('setTheme', theme)
            }
        },
        applyInitSettings(){
            
        	// Theme zoom init
    		webFrame.setZoomFactor(parseFloat(this.$store.state.theme.zoom))
        }
    }
}).$mount('#app')
