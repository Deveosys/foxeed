<template>
    <div id="app" v-bind:class="{ 'theme-dark' : theme.dark }">
        <div id="nav" class="foxeed-block">
            <router-link to="/" class="uk-inline foxeed-button" exact uk-tooltip="title: Torrents; pos: right;">
                <i class="uk-position-center fas fa-cloud-download-alt"></i>
            </router-link>
             <router-link to="/ftp" class="uk-inline foxeed-button" exact uk-tooltip="title: FTP; pos: right;">
                <i class="uk-position-center fas fa-file-download"></i>
            </router-link>
            <router-link to="/search" class="uk-inline foxeed-button" exact uk-tooltip="title: Rechercher des torrents; pos: right;">
                <i class="uk-position-center fas fa-search"></i>
            </router-link>
            <router-link to="/settings" class="uk-inline foxeed-button" exact uk-tooltip="title: Paramètres; pos: right;">
                <i class="uk-position-center fas fa-cog"></i>
            </router-link>
        </div>
        
        <div id="main-container" class="uk-container uk-container-expand uk-padding uk-background-muted" uk-height-viewport>
            <transition name="fade" mode="out-in">
                <router-view></router-view>
            </transition>
        </div>
    </div>
</template>

<script>
    export default {
        name: 'app',
        computed: {
            theme() {
                return this.$store.state.theme
            }
        },
        created() {
            // this.initDowloadQueue()
        },
        methods: {
            // initDowloadQueue() {
            //     let downloadQueue = this.$store.state.downloadQueue
            //     console.log(downloadQueue)
            //     downloadQueue.forEach(function( download, index) {
            //         download.processing = false
            //     })
            //     console.log(downloadQueue)
            //     // this.$store.commit('', downloadQueue)
            // }
        }
    }
</script>

<style lang="less">
    @import "assets/less/main.less";
</style>
