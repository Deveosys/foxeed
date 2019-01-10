<template>
	<div id="ftp-download-queue">
		<ul class="uk-dark" uk-tab>
			<li class="uk-active">
				<a href="">En cours ({{ downloadingQueue.length }})</a>
			</li>
			<li>
				<a href="">En attente ({{ waitingQueue.length }})</a>
			</li>
			<li class="">
				<a href="">Terminés ({{ completedQueue.length }})</a>
			</li>
		</ul>

		<ul id="ftp-download-queue-files-list" class="uk-switcher">
			<li>
				<table class="uk-table uk-table-small uk-table-hover uk-table-middle">
					<thead>
						<tr>
							<th></th>
							<th class="uk-width-expand"></th>
							<th class="uk-text-center"></th>
							<th class="uk-text-center"></th>
							<th class="uk-text-center"></th>
							<th class="uk-text-center"></th>
						</tr>
					</thead>
					<tbody>
						<FtpDownload v-for="download in downloadingQueue" :download="download" :key="download.id"/>
					</tbody>
				</table>
			</li>
			<li>
				<div v-for="download in waitingQueue">
					{{ download.source }}
				</div>
			</li>
			<li>
				<div v-for="download in completedQueue">
					{{ download.source }}
				</div>
			</li>
		</ul>

	</div>
</template>

<script>
	const fs = require('fs')
	import UIkit from 'uikit'
	import PromiseFtp from 'promise-ftp'
	const progressStream = require('progress-stream')

	import FtpDownload from '@/components/FtpDownload.vue'

	export default {
		name: "ftp-download-queue",
		components: {
			FtpDownload
		},
		data() {
			return {
				config: {},
				waitingQueue: this.$ftpQueues.waitingQueue,
				completedQueue: this.$ftpQueues.completedQueue,
				downloadingQueue: this.$ftpQueues.downloadingQueue,
				connectionsQueue: this.$ftpQueues.connectionsQueue,
			}
		},
		created() {
			this.config = this.$store.state.ftpOptions
			// this.downloadQueue = this.$store.state.downloadQueue
			// if (!this.initialized) {
			// 	this.initDownloadQueue()
			// }
		},
		methods: {
			processWaitingQueue() {

				let maxTransferts = this.config.maxTransferts
				let i = 0

				while (this.downloadingQueue.length < maxTransferts && this.waitingQueue.length != 0) {
					let download = this.waitingQueue[i]
					this.downloadingQueue.push(download)
					this.processDownload(download)
					this.waitingQueue.splice(i, 1)
				}
			},
			addDowload(download) {

				let vm = this
				download.connection = {}
				download.progressState = {
					percentage: 0,
					transferred: 0,
					length: 0,
					remaining: 0,
					eta: 0,
					runtime: 0,
					delta: 0,
					speed: 0
				}
				download.id = new Date().getTime() + Math.random() + download.item.name
				
				fs.open(download.target, 'wx', (err, fd) => {
					if (err) {
						if (err.code === 'EEXIST') {

							// Resume Download
							
							fs.stat(download.target, (err, stats) => {
								
								if (err) throw err;
								
								download.bytesOffset = stats.size
								vm.waitingQueue.push(download)
								vm.processWaitingQueue()
							});
							
							
						}
					} else {

						// New Dowload
						
						download.bytesOffset = 0
						vm.waitingQueue.push(download)
						vm.processWaitingQueue()
					}
					// TODO : Ask to resume or replace file

					// UIkit.modal.confirm(
					// 	'Le fichier local <strong>' + download.item.name + '</strong> éxiste déjà, voulez-vous reprendre le téléchargement ou remplacer le fichier ?', 
					// 	{
					// 		labels: {
					// 			ok: 'Reprendre', 
					// 			cancel: 'Remplacer'
					// 		}
					// 	}).then(function() {
					// 		console.log('Reprendre')
					// 		download.bytesOffset = stats.size
					// 		// vm.resumeDownload(download, stats.size)
					// 	}, function () {
					// 		console.log('remplacer')
					// 		// vm.newDownload(download)
					// 	});
				})
			},
			processDownload(download) {

				let vm = this
				let newConnection = new PromiseFtp()
				download.connection = newConnection

				newConnection.connect(vm.config.ftpConnection)
				.then(function (serverMessage) {

					newConnection.restart(download.bytesOffset)
					.then(function() {

						newConnection.get(download.source)
							.then(function(readableStream) {

								let progress = progressStream({
								    length: download.item.size,
								    transferred: download.bytesOffset,
								    time: 1000 /* ms */
								});

								progress.on('progress', function(progressState) {
								    download.progressState.speed = progressState.speed
								    download.progressState.transferred = progressState.transferred
								    download.progressState.percentage = progressState.percentage
								});
								
								let writeStream = fs.createWriteStream(download.target, { flags: 'a' })
								writeStream.on('finish', () => {

									let index = vm.downloadingQueue.indexOf(download)
									if (index != -1) {
										vm.downloadingQueue.splice(index, 1)
									}

									vm.completedQueue.push(download)

									vm.processWaitingQueue()

									download.connection.end()
									.then(function() {
										console.log(download.item.name + " downloaded")
									})
								})
								
								readableStream
									.pipe(progress)
									.pipe(writeStream)
							})
							.catch(function(error) {
								console.log(error)
								newConnection.end()
							})
					})
					.catch(function(error) {
						console.log(error)
						newConnection.end()
					})

				})
				.catch(function(error) {
					// Connexion error 
					console.log(error)
					newConnection.end()
				})
			}
		}
	}
</script>