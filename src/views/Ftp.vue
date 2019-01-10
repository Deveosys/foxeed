<template>
	<div uk-height-viewport="offset-top: true, offset-bottom: true" @click.prevent="contextMenu.show = false">
		
		<!-- CONTEXT MENU -->
		<div id="context-menu" class="context-menu uk-card uk-card-default uk-card-body foxeed-block" v-bind:class="{ hidden: !contextMenu.show  }" v-bind:style="contextMenu.position" >
			<ul>
				<li v-for="item in contextMenu.items">
					<a href="#" @click.prevent="item.action(item.params)">{{ item.label }}</a>
				</li>
			</ul>
		</div>

		<!-- TOP DISPLAY -->
		<div class="uk-card uk-card-default uk-card-body foxeed-block uk-margin-bottom">
			<div class="uk-flex uk-flex-between uk-flex-middle">
				<div>
					<a href="#" @click.prevent="changeDisplay(true)" class="foxeed-button uk-inline">
						<i class="fas fa-th-large uk-position-center"></i>
					</a>
					<a href="#" @click.prevent="changeDisplay(false)" class="foxeed-button uk-inline">
						<i class="fas fa-list uk-position-center"></i>
					</a>
				</div>
				<div>
					<span v-bind:class="{ connected: isConnected }" class="state-pill" uk-tooltip="Etat de la connexion au serveur FTP"></span>
				</div>
			</div>
			<div class="uk-flex uk-flex-between">

				<!-- SORT BY -->
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

				<!-- LOCAL DIRECTORY -->
				<div class="uk-text-right">
					Dossier de réception : {{ config.localTargetDir }}
				</div>
			</div>
			<div class="uk-search uk-search-default uk-width-1-1 uk-margin-small-top uk-margin-small-bottom">
				<span uk-search-icon></span>
				<input class="uk-search-input" type="search" placeholder="" v-model="searchQuery">
			</div>
			<div class="uk-text-danger">
				{{ error }}
			</div>
		</div>

		<!-- DOWNLOAD QUEUE -->
		<FtpDownloadQueue :config="config" ref="downloadQueueComponent"/>

		<!-- BREADCRUMB -->
		<div class="uk-flex">
			<div v-if="breadcrumb.length > 0">
				<a href="#" @click.prevent="previousDir()" class="uk-button uk-button-link">
					<i class="fas fa-reply"></i>
				</a>
			</div>
			<div class="uk-margin-left">
				<ul class="uk-breadcrumb">
				    <li v-for="(dir, index) in breadcrumb">
				    	<span v-if="index == breadcrumb.length - 1">{{ dir.label }}</span>
				    	<a v-else="" href="#" @click.prevent="goto(dir.goto)">{{ dir.label }}</a>
				    </li>
				</ul>
			</div>
		</div>

		<!-- CURRENT DIRECTORY DISPAY -->
		<div id="ftp-current-directory-container" v-if="currentDirContentList.length > 0" class="uk-clearfix" v-bind:class="{ 'grid-display' : displayGrid}">
			<div v-for="(item, index) in currentDirContentList" class="ftp-current-directory-item uk-grid-collapse" :data-id="item.id" v-bind:class="{ visible: item.visible }">

				<!-- DIRECTORY ITEM -->
				<a v-if="item.type == 'd'" href="#" class="uk-card uk-card-body uk-card-default foxeed-block uk-flex uk-padding-small uk-padding-remove"  @click.prevent="goto(item.name)" @click.right.prevent="setContextMenu">
					<div class="icon-container uk-padding-small uk-text-primary">
						<i class="fas fa-folder"></i>
					</div>
					<div class="uk-width-expand uk-text-truncate uk-padding-small">
						{{ item.name }}
					</div>
				</a>

				<!-- FILE ITEM -->
				<a v-else="" href="#" class="uk-card uk-card-body uk-card-default foxeed-block uk-flex uk-padding-small uk-padding-remove" @click.right.prevent="setContextMenu">
					<div class="icon-container uk-padding-small">
						<i class="fas fa-file"></i>
					</div>
					<div class="uk-width-expand uk-text-truncate uk-padding-small">
						{{ item.name }}
					</div>
				</a>
			</div>
		</div>

		<div v-else="" class="uk-width-1-1 uk-flex">
			<div>
				<div id="torrents-loading" data-uk-spinner="ratio: .5"></div>
			</div>
			<div class="uk-margin-small-left">
				<span>Connexion au serveur FTP...</span>
				<br>
				<span class="uk-text-small">Cela ne devrait pas prendre plus de quelques secondes, sinon, pensez à vérifier votre connexion internet et vos <router-link to="/settings">paramètres de connexion au serveur FTP</router-link></span>
			</div>
		</div>

	</div>
</template>

<script>

	import UIkit from 'uikit'
	
	var _ = require('lodash')
	const fs = require('fs-extra')
	const path = require('path')
	const {app} = require('electron').remote

	import PromiseFtp from 'promise-ftp'
	import FtpDownloadQueue from '@/components/FtpDownloadQueue.vue'

	export default {
		name: 'ftp',
		components: {
			FtpDownloadQueue
		},
		data() {
			return {
				ftp: new PromiseFtp(), //Current FTP instance only used for the tree structure walk 
				error: '',
				breadcrumb : [],
				displayGrid: true,
				isConnected: false,
				currentDirContentList: [], // Array of items (directories & files) in the current directory
				contextMenu: {
					items: [],
					show: false,
					position: {
						top: 0,
						left: 0,
					},
				},
				config: {},
				sorts: [
			    	{ id: 'name', 'label' : 'Nom'},
			    	{ id: 'lastModification', 'label' : 'Dernière Modification'},
				],
				searchQuery: ""
			}
		},
		computed: {
			sortBy () {
				return this.$store.state.ftpOptions.sortBy
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
		mounted() {

			if (this.loadConfig()) {
				this.connection()
			} else {
				// Unvalid config 
			}
			this.debouncedSearch = _.debounce(this.search, 300)
			
		},
		methods: {
			loadConfig() {
				let config = this.$store.state.ftpOptions
				if (config.localTargetDir == '' || !fs.existsSync(config.localTargetDir)) {
					this.error = "Le dossier local de réception n'existe pas, rendez-vous dans les paramètres de l'application pour le sélectionner"
					return false
				}

				this.config = config
				return true
			},
			connection() {

				let vm = this
				vm.ftp.connect(vm.config.ftpConnection)
					.catch(function(error) {
						// Connexion error 
						vm.error = error
					})
					.then(function (serverMessage) {
						vm.getConnectionStatus()
						vm.list()
					})
			},
			list() {
				let vm = this
				vm.ftp.listSafe()
					.then(function(data) {
						
						data.forEach(function(element, index){
							element.id = index
							element.name = decodeURIComponent(escape(element.name))
							element.visible = true
						})

						vm.searchQuery = ""
						vm.currentDirContentList = data
						vm.sortList()
						vm.setBreadcrumb()
					})
					.catch(function(error) {
						console.log(error)
					})
			},
			goto(dir) {
				let vm = this
				vm.ftp.cwd(dir)
					.then(function() {
						vm.list()
					})
					.catch(function(e) {
						vm.error = e
					})
			},
			previousDir() {
				let vm = this
				vm.ftp.cdup()
					.then(function(response) {
						vm.list()
					})
			},
			setBreadcrumb() {
				let vm = this
				vm.ftp.pwd()
					.then(function(currentPath) {
						
						let breadcrumb = []
						let cumulatedPath = "/"
						let pathLevels = currentPath.split(/[\\\/]/)

						while (pathLevels.indexOf("") !== -1) {
							pathLevels.splice(pathLevels.indexOf(""), 1)
						}

						pathLevels.forEach(function(element, index) {
							cumulatedPath += element + "/"
							breadcrumb.push({
								label: element,
								goto: cumulatedPath
							})
						})

						vm.breadcrumb = breadcrumb
					})
			},
			setContextMenu(event) {

				// Need to retrieve item by DOM to get mouseEvent and get cursor position
				let target = event.target.closest('.ftp-current-directory-item')
				if (target == null) return

				let item = this.currentDirContentList.find(function(element) {
					return element.id == target.dataset.id;
				});
				if (item == null) return

				let vm = this
				this.contextMenu.items = [
					{
						item: item.id,
						label: "Télécharger",
						action: vm.initDownload,
						params: item
					}
				]
				if (item.type == "d") {
					this.contextMenu.items.push({
						id: item.id,
						label: "Parcourir",
						action: vm.goto,
						params: item.name
					})
				}


				// Display Context Menu
				let top = event.clientY
				let left = event.clientX

				if (top > window.innerHeight - 200) {
					top = top - 100
				}
				if (left > window.outerWidth -200) {
					left = left - 200
				}
				this.contextMenu.position.top = top + 'px'
				this.contextMenu.position.left = left  + 'px'
				this.contextMenu.show = true

			},
			initDownload(item) {
				let vm = this
				vm.ftp.pwd()
				.then(function(currentPath) {

					if (item.type == "d") {

						let tree = []
						let rootDir = vm.formatPath(path.join(currentPath, item.name))
						vm.getDirTree(rootDir, rootDir, tree)

					} else {

						vm.$refs["downloadQueueComponent"].addDowload({

							item: item,
							source: vm.formatPath(path.join(currentPath, item.name)),
							target: path.join(vm.config.localTargetDir, item.name) // no path format because it's depending on local OS
						})
					}
				})
				return
			},
			getDirTree(rootDir, currentDirectory, tree) {

				let vm = this
				
				return new Promise((resolve, reject) => {

					let walkTreeConnection = new PromiseFtp()
					walkTreeConnection.connect(vm.config.ftpConnection)
					.then(function (serverMessage) {

						walkTreeConnection.cwd(currentDirectory)
						.then(function() {

							walkTreeConnection.listSafe()
							.then(function(data) {

								walkTreeConnection.end()
								.then(async function() {

									let files = []
									let dirs = []
									for (let item of data) {

										if (item.type === "d") {

											dirs.push({
												rootDir: rootDir,
												currentDirectory: vm.formatPath(path.join(currentDirectory, item.name)),
												tree: tree
											})

										} else {

											files.push({
												item: item,
												source: path.join(currentDirectory, item.name)
											})

										}

									}

									vm.downloadDir(rootDir, {
										dir: currentDirectory,
										files: files
									})

									for (let dir of dirs) {
										await vm.getDirTree(
											dir.rootDir, 
											dir.currentDirectory, 
											dir.tree
										)
									}

									resolve(true);
								})

							})
							.catch(function(error) {
								// listSafe error
								console.log(error)
								walkTreeConnection.end()
							})
						})
						.catch(function(error) {
							// cwd error
							console.log(error)
							walkTreeConnection.end()
						})
					})
					.catch(function(error) {
						// Connexion error 
						vm.error = error
						walkTreeConnection.end()
					})


				})
			},
			downloadDir(rootDir, dir) {

				let vm = this

				dir.dir = dir.dir.replace(rootDir, "")
				rootDir = rootDir.substring(rootDir.lastIndexOf("/"))

				let localDir = path.join(vm.config.localTargetDir, rootDir, dir.dir) // no path format because it's dependig on local OS
				fs.ensureDirSync(localDir)

				dir.files.forEach(function(file, index) {
					vm.$refs["downloadQueueComponent"].addDowload({
						item: file.item,
						source: vm.formatPath(file.source),
						target: path.join(localDir, file.item.name) // no path format because it's depending on local OS
					})
				})
			},
			changeDisplay(displayGrid) {
				this.displayGrid = displayGrid
				UIkit.update()
			},
			formatPath(unformatedPath) {
				return unformatedPath.replace(/\\/g,  "/")
			},
			getConnectionStatus() {
				let state = this.ftp.getConnectionStatus()
				this.isConnected = state == 'connected' || false // Update state display
			},
			setSortBy(sort) {
				this.$store.commit('setFTPSortBy', sort)
				this.sortList()
			},
			sortList() {

				if (this.sortBy.id == "name") {

					this.currentDirContentList.sort(function(a, b) {
						return (a.name).localeCompare(b.name)
					})
				
				} else if (this.sortBy.id == "lastModification") {
				
					this.currentDirContentList.sort(function(a, b) {
						let dateA = new Date(a.date).getTime()
						let dateB = new Date(b.date).getTime()
						if (dateA < dateB) return 1
						if (dateA > dateB) return -1
						return 0
					})
				
				}
			},
			search() {
				if (this.searchQuery === "") {
					for (let item of this.currentDirContentList) {
						item.visible = true
					}
				} else {
					for (let item of this.currentDirContentList) {
						item.visible = item.name.toUpperCase().includes(this.searchQuery.toUpperCase())
					}
				}
        	},
		},
		beforeDestroy() {
			if (this.ftp.getConnectionStatus() == 'connected') {
				this.ftp.end()
			}
		}
	}
</script>