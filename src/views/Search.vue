<template>

    <div>
        <div class="uk-card uk-card-default uk-card-body foxeed-block">
            <legend class="uk-legend">Rechercher sur YggTorrent</legend>
            <div class="uk-search uk-search-default uk-width-1-1 uk-margin-small-top uk-margin-small-bottom">
                <span uk-search-icon></span>
                <input class="uk-search-input" type="search" placeholder="" v-model="searchQuery">
            </div>
            <div class="uk-flex">
                <span class="uk-margin-small-right uk-text-uppercase" style="font-size: 0.875rem;" 
                    v-for="(category, label) in categories" 
                    :class="{ 'uk-button uk-button-text' : category != currentCategory }"
                    @click.prevent="changeCategory(category)"
                    v-bind:key="category"
                >
                    {{ label }}
                </span>
            </div>
        </div>
        <div v-if="torrents.length > 0" class="uk-padding-small">
            <table class="uk-table uk-table-small uk-table-hover uk-table-middle">
                <thead>
                    <tr>
                        <th class="uk-width-expand">Titre</th>
                        <th class="uk-text-center">Ajouté</th>
                        <th class="uk-text-center">Peers</th>
                        <th class="uk-text-center">Seeds</th>
                        <th class="uk-text-center">Taille</th>
                        <th class="uk-text-center">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="torrent in torrents" :key="torrent.id">
                        <td>{{ torrent.title }}</td>
                        <td class="uk-text-center uk-text-nowrap">{{ torrent.time | fromNow }}</td>
                        <td class="uk-text-center uk-text-primary">{{ torrent.peers }}</td>
                        <td class="uk-text-center uk-text-success">{{ torrent.seeds }}</td>
                        <td class="uk-text-center">{{ torrent.size }}</td>
                        <td class="uk-text-right">
                            <a href="#" class="uk-button uk-button-small uk-button-primary" @click.prevent="downloadTorrent(torrent)">
                                <i class="fas fa-download"></i>
                            </a>
                        </td>
                    </tr>
                </tbody>
            </table>
            <ul v-if="pages.length > 0" class="uk-pagination uk-flex-center">
                <li v-for="page in pages" :key="page.label">
                    <span v-if="page.link == ''" class="uk-text-primary">{{ page.label }}</span>
                    <a v-else href="#" @click.prevent="search(page.link)">{{ page.label }}</a>
                </li>
            </ul>
        </div>
        <div v-else="" class="uk-width-1-1 uk-flex uk-margin-top">
            <div>
                <div id="torrents-loading" data-uk-spinner="ratio: .5"></div>
            </div>
            <div class="uk-margin-small-left">
                <span>Connexion à YggTorrent...</span>
                <br>
                <span class="uk-text-small">Cela ne devrait pas prendre plus de quelques secondes, sinon, pensez à vérifier votre connexion internet</span>
            </div>
        </div>
    </div>
    
</template>

<script>
    var _ = require('lodash')
    const fs = require('fs')
    const request = require('request-promise')
    const {app} = require('electron').remote;
    import UIkit from 'uikit'

    import TorrentSearch  from '../lib/torrents-search-api/index.js'
    var torrentSearch = new TorrentSearch()

    export default {
        name: 'search',
        data() {
            return {
                pages: [],
                torrents: [],
                searchQuery: '',
                cookieJar: request.jar(),
                torrentSearch: torrentSearch,
                categories: {
                    All: '',
                    Videos: '&category=2145',
                    Movies: '&category=2145&sub_category=2183',
                    TV: '&category=2145&sub_category=2184',
                    Emulation: '&category=2141',
                    Games: '&category=2142',
                    Applications: '&category=2144',
                    Music: '&category=2139',
                    Books: '&category=2140',
                    GPS: '&category=2143',
                    XXX: '&category=2188'
                },
                currentCategory: null,
                yggTorrent: {
                    url: 'https://yggtorrent.gg/',
                    username: this.$store.state.yggtorrentOptions.username,
                    password: this.$store.state.yggtorrentOptions.password
                }
            }
        },
        watch: {
            searchQuery: {
                handler: function () {
                    this.debouncedSearch()
                },
                deep: true
            }
        },
        created() {
            this.debouncedSearch = _.debounce(this.search, 500)
            this.currentCategory = this.categories.All
            this.init()
        },
        methods: {
            init (){
              
              let vm = this
              request({uri: "http://yggtorrent.deveosys.com/get-last-url"})
              .then(function(response) {
                vm.yggTorrent.url = "https://" + JSON.parse(response).url + '/'
                vm.login()
              }).catch(function() {
                vm.$log({
                    text: "<i class='fas fa-exclamation-circle uk-margin-small-right'></i>Impossible de récupérer l'adresse de YggTorrent, verifiez votre connexion internet",
                    status: 'info'
                })
              })
            },
            search(query = null) {
                if (query == null) {
                    query = this.yggTorrent.url + "engine/search?name=" + encodeURI(this.searchQuery) +"&do=search&order=desc&sort=seed" + this.currentCategory
                }
                let vm = this
                this.torrentSearch.search(query)
                .then(({ data, response }) => {
                    data.torrents.shift()
                    vm.torrents = data.torrents
                    data.pages.splice((data.pages.length/2), (data.pages.length/2))
                    vm.pages = data.pages
                })
            },
            downloadTorrent(torrent) {
                let vm = this
                let url = this.yggTorrent.url + 'engine/download_torrent?id=' + torrent.id
                let path = app.getPath('userData') + '/' + torrent.title +'.torrent'
                request({ uri: url, jar: this.cookieJar, resolveWithFullResponse: true, encoding: null})
                .then(function (response) {
                    fs.writeFile(path, response.body, function() {
                        vm.$transmission.addFile(path)
                        .then(function() {
                            vm.$log({
                                text: "<i class='fas fa-check uk-margin-small-right'></i> <strong>"+ torrent.title +"</strong> ajouté aux téléchargements",
                                status: 'success'
                            })
                        })
                        .catch(function() {
                        })
                        .then(function() {
                            fs.unlink(path, function() {})
                        })
                      })
                    })
                    .catch(function (err) {
                      console.log(err)
                    });
            },
            changeCategory(category) {
                this.currentCategory = category
                this.search()
            },
            login() {
                // YGGTORRENT AUTHENTICATION
                let vm = this

                let options = {
                    method: 'POST',
                    uri: this.yggTorrent.url + 'user/login',
                    headers: { 'Connection': 'Keep-Alive' },
                    jar: this.cookieJar,
                    form: {
                        id: this.yggTorrent.username,
                        pass: this.yggTorrent.password
                    }
                }
                request(options).then(function (body) {
                    vm.search()
                    // console.log('loged in')
                }).catch(function (err) {
                    vm.$log({
                        text: "<i class='fas fa-exclamation-circle uk-margin-small-right'></i>Impossible de se connecter à YggTorrent, verifiez vos identifiants dans les options",
                        status: 'danger'
                    })
                    console.log('log in error : ' + err)
                });
            }
        }
    }
</script>