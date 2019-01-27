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

        <div id="log-container" class="foxeed-block uk-flex uk-flex-between">
            <p>
                <span v-html="lastLogMessage"></span>
            </p>

            <a href="#" uk-toggle="target: #log-modal">
                <i class="far fa-eye"></i>
            </a>
        </div>

        <div id="log-modal" class="uk-modal-container" uk-modal>
            <div class="uk-modal-dialog uk-modal-body">
                <button class="uk-modal-close-default" type="button" uk-close></button>
                <h2 class="uk-modal-title">
                    Activités
                </h2>
                <ul>
                    <li v-for="message in logMessages" :key="message.id">
                        <span v-html="message.text"></span>
                    </li>
                </ul>
                <p class="uk-text-right">
                    <a href="#" @click.prevent="clearLogMessages()" class="uk-button uk-button-secondary">Vider</a>
                </p>
            </div>
        </div>
    </div>
</template>

<script>
    const ipcRenderer = require('electron').ipcRenderer
    import UIkit from 'uikit'

    ipcRenderer.on('auto-update', (event, message) => {
        if (message !== "update-downloaded") {
            this.$log({
                text: message,
                status: 'info'
            })
        } else {
            UIkit.modal.confirm(
                "<h3>Une mise à jour de l'application a été téléchargée et est prête à être installée.</h3> Souhaitez-vous l'installer maintenant (redémarrage de Foxeed) ou plus tard (lors de la fermeture de Foxeed) ?",
             {
                 labels: {
                     ok: 'Mettre à jour', 
                     cancel: 'Mettre à jour à la fermeture de Foxeed'
                 }
             }).then(function() {
                 ipcRenderer.send('quit-and-install-update', "");
             }, function () {
             });
        }
    })

    ipcRenderer.on('open-file', (event, message) => {
        console.log(event)
        console.log(message)
    })

    export default {
        name: 'app',
        data() {
            return {
                logMessages: this.$logMessages,
                lastLogMessage: ""
            }
        },
        watch: {
            logMessages: function() {
                this.lastLogMessage = this.$logMessages.length > 0 ? this.$logMessages[this.$logMessages.length - 1].text : ""
            }
        },
        computed: {
            theme() {
                return this.$store.state.theme
            }
        },
        methods: {
            clearLogMessages() {
                this.logMessages.splice(0, this.logMessages.length)
            }
        }
    }
</script>

<style lang="less">
    @import "assets/less/main.less";
</style>
