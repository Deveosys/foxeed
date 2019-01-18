<template>
	<div v-if="loading" class="uk-width-1-1 uk-flex">
		<div>
			<div id="torrents-loading" data-uk-spinner="ratio: .5"></div>
		</div>
		<div class="uk-margin-small-left">
			<span>Connexion au serveur...</span>
			<br>
			<span class="uk-text-small">Cela ne devrait pas prendre plus de quelques secondes, sinon, pensez à vérifier votre connexion internet et les <router-link to="/settings">paramètres de connexion à transmission</router-link></span>
		</div>
	</div>
	
	<div v-else>
		<div id="torrent-container" v-bind:class="{ 'torrent-info-opened': torrentInfo.opened }">
			<div  class="uk-card uk-card-default uk-card-body uk-margin-large-bottom foxeed-block">
				<div class="uk-flex uk-flex-between uk-margin-bottom">
					<div class="uk-inline">
					    <button class="uk-button uk-button-small uk-button-link" type="button">Trié par : {{ sortBy.label }}</button>
					    <div uk-dropdown="pos: bottom-justify">
					        <ul class="uk-nav uk-dropdown-nav">

					            <li v-for="sort in sorts">
					            	<a href="#" @click="setSortBy(sort)">
					            		{{ sort.label }}
					            		<i v-if="sort.id == sortBy.id" class="fas fa-check"></i>
					            	</a>
					            </li>
					        </ul>
					    </div>
					</div>
					<div >
						<i class="fas fa-arrow-down"></i> {{ globalDownloadSpeed | prettyBytes }}/s <i class="fas fa-arrow-up"></i> {{ globalUploadSpeed | prettyBytes }}/s
					</div>
				</div>
				<div class="uk-flex uk-flex-between">
                    
                    <div>
    					<a href="#" class="foxeed-button uk-inline" type="button" @click.prevent="addTorrents" uk-tooltip="Ajouter un fichier Torrent">
    						<i class="fas fa-file-upload uk-position-center"></i>
    					</a>
    					<a href="#" class="foxeed-button uk-inline uk-margin-small-left" type="button" @click.prevent="startAll" uk-tooltip="Tout Démarrer">
    						<i class="fas fa-reply-all uk-position-center"></i>
    					</a>
    					<a href="#" class="foxeed-button uk-inline uk-margin-small-left" type="button" @click.prevent="stopAll" uk-tooltip="Tout arrêter">
    						<i class="fas fa-stop uk-position-center"></i>
    					</a>
                    </div>

                    <div>
                        {{ globalSize | prettyBytes }} <i class="fas fa-database"></i>
                    </div>
				</div>
			</div>
			

			<div v-for="(category, index) in torrents" v-if="category.count > 0"  class="uk-card uk-card-default uk-card-body uk-margin-bottom foxeed-block">
				<ul uk-accordion="multiple: true">
    				<li :class="{'uk-open' : index == 'DOWNLOAD'}">
    					<a  class="uk-accordion-title" href="#">
    						<h5 class="uk-heading-divider">{{ index }} ({{ category.count }})</h5>
    					</a>
						<div class="uk-accordion-content">
							<ul id="torrents-list" class="uk-list uk-list-large uk-list-divider">
								<Torrent 
									v-for="(torrent, index) in category.torrents" 
									v-bind:key="torrent.hash" 
									v-bind:torrent="torrent" 
									@openInfo="openInfo" 
									@removeTorrent="removeTorrent"
									@toggleTorrentStatus="toggleTorrentStatus"
								/>
							</ul>
						</div>
					</li>
				</ul>
			</div>
		</div>

		<TorrentInfo :opened="torrentInfo.opened" :torrent="torrentInfo.torrent" @closeInfo="closeInfo"></TorrentInfo>
		
	</div>
</template>

<script>
	// @ is an alias to /src
	import Torrent from '@/components/Torrent.vue'
	import TorrentInfo from '@/components/TorrentInfo.vue'
	const { dialog } = require('electron').remote
	const fs = require('fs')

	var sorts = [
    	{ id: 'name', 'label' : 'Nom'},
    	{ id: 'addedDate', 'label' : 'Age'},
		{ id: 'totalSize', 'label' : 'Taille'},
    	{ id: 'rateDownload', 'label' : 'Download Speed'},
    	{ id: 'rateUpload', 'label' : 'Upload Speed'},
	]

	export default {
		name: 'torrents',
		components: {
			Torrent,
			TorrentInfo
		},
		data() {
            return {
                sorts: sorts,
                globalSize: 0,
                loading: true,
                torrents: undefined,
                globalUploadSpeed: 0,
                globalDownloadSpeed: 0,
                torrentInfo: {
                	'opened': false,
                	'torrent': {}
                },
                loadingTorrents: {},
            }
        },
        computed: {
			sortBy () {
				return this.$store.state.torrentsSortBy
			}
		},
        methods: {
	        /////////////
        	// DISPLAY //
	        /////////////
        	setSortBy(sort) {
        		this.$store.commit('setTorrentsSortBy', sort)
        	},

	        ///////////////////
        	// TORRENT LIST  //
	        ///////////////////
			initialTorrentsCategories () {
				return {
					'DOWNLOAD': { torrents: [], count: 0 },
					'DOWNLOAD_WAIT': { torrents: [], count: 0 },
					'SEED_WAIT': { torrents: [], count: 0 },
					'SEED': { torrents: [], count: 0 },
					'STOPPED': { torrents: [], count: 0 },
					'CHECK_WAIT': { torrents: [], count: 0 },
					'CHECK': { torrents: [], count: 0 },
					'ISOLATED': { torrents: [], count: 0 }
				}
			},
        	getTorrents() {
				var vm = this
				this.$transmission.all()
					.then(function(data){
						vm.sortTorrents(data.torrents)
						if (vm.torrents !== undefined) {
							vm.loading = false
						}
					})
					.catch(function(error) {
						console.log(error)
						vm.loading = true
					})
        	},
        	sortTorrents(torrents = this.torrents) {

        		// Sort all torrents without regarding category
        		var vm = this
        		torrents.sort( function(a, b) {
					if (a[vm.sortBy.id] < b[vm.sortBy.id]) return -1;
					if (a[vm.sortBy.id] > b[vm.sortBy.id]) return 1;
					return 0;
        		})
        		if (['addedDate', 'rateDownload', 'rateUpload'].includes(vm.sortBy.id)) {
        			torrents.reverse()
        		}

                this.globalSize = 0
        		this.globalUploadSpeed = 0
        		this.globalDownloadSpeed = 0
        		let torrentsCategories = this.initialTorrentsCategories()
        		torrents.forEach(function(torrent, index) {
        			// add loading property to each torrent for binding
        			torrent.loading = vm.checkTorrentLoading(torrent)
        			
        			// Computed global upload / download speed
        			vm.globalSize += torrent.totalSize * torrent.percentDone
                    vm.globalUploadSpeed += torrent.rateUpload
                	vm.globalDownloadSpeed += torrent.rateDownload

        			// Divide torrents by category
        			let catLabel = vm.$transmission.statusArray[torrent.status]
        			torrentsCategories[catLabel].count++
        			torrentsCategories[catLabel].torrents.push(torrent)
        		})

        		this.torrents = torrentsCategories
        	},
        	checkTorrentLoading(torrent) {
        		if (this.loadingTorrents[torrent.id] === torrent.status) {
        			return true
        		}
        		delete this.loadingTorrents[torrent.id]
        		return false
        	},

	        /////////////////////////
        	// TORRENT INFO ACTION //
	        /////////////////////////
            openInfo(torrent) {
            	this.torrentInfo.opened = true
            	this.torrentInfo.torrent = torrent
            },
            closeInfo() {
            	this.torrentInfo.opened = false
            },

            /////////////////////
            // TORRENT ACTIONS //
            /////////////////////
            stopAll() {
            	this.$transmission.stopAll()
            },
            startAll() {
            	this.$transmission.startAll()
            },
            addTorrents() {
            	let vm = this
            	dialog.showOpenDialog({
            		'properties': [
            			'openFile',
            			'multiSelections'
            		],
            		'filters': [
            			{ name: 'Fichiers Torrent', extensions: ['torrent'] },
            		]
            	}, function (files) {

            		if (files === undefined) return

            		files.forEach(function (file, index) {
            			vm.$transmission.addFile(file)
            		})
            	})
            },
            toggleTorrentStatus(torrent) {
                torrent.loading = true
                this.loadingTorrents[torrent.id] = torrent.status
                if (this.$transmission.statusArray[torrent.status] === 'STOPPED') {
                	this.$transmission.startNow(torrent.id)
                } else {
                	this.$transmission.stop(torrent.id)
                }
                
            },
            removeTorrent(torrent) {
                torrent.loading = true
                this.loadingTorrents[torrent.id] = torrent.status
                this.$transmission.remove(torrent.id, true)
            },
        },
        created() {
        	this.torrent = undefined
        	this.getTorrents()
        	setInterval(this.getTorrents, 1500)

	        ////////////////////////////////
        	// DROP FILES TO ADD TORRENT  //
	        ////////////////////////////////
        	let vm = this
			window.ondragover = function(e) {
				e.preventDefault();
				e.dataTransfer.dropEffect = 'copy';
				return false;
			};
        	window.ondrop = function(e) {
				e.preventDefault();
				for (var i = 0; i < e.dataTransfer.files.length; ++i) {
        			vm.$transmission.addFile(e.dataTransfer.files[i].path).then(function(e) {
        				console.log(e)
        			})
				}
				return false;
			};

        }
	}
</script>
