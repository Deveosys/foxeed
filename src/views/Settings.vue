<template>

	<div>
		<!-- THEME -->
		<div class="uk-card uk-card-default uk-card-body uk-margin-bottom foxeed-block">
			<form class="uk-form-horizontal">
			    <fieldset class="uk-fieldset">

			        <legend class="uk-legend uk-margin-bottom">Affichage</legend>

					<div class="uk-margin">
						<label class="uk-form-label">Thème sombre</label>
						<div class="uk-form-controls">
							<input class="uk-checkbox" type="checkbox" v-model="theme.dark">
						</div>
					</div>
					<div class="uk-margin">
						<label class="uk-form-label">Niveau de zoom</label>
						<div class="uk-form-controls">
				            <input class="uk-range uk-form-width-large" type="range" min="0.5" max="1.5" step="0.05" v-model="theme.zoom">
							{{ theme.zoom * 100 }}%
						</div>
					</div>
				</fieldset>
			</form>
		</div>

		<!-- TRANSMISSION -->
		<div class="uk-card uk-card-default uk-card-body uk-margin-bottom foxeed-block">
			<form class="uk-form-horizontal">
			    <fieldset class="uk-fieldset">

			        <legend class="uk-legend uk-margin-bottom">Connexion à Transmission</legend>

					<div class="uk-margin">
						<label class="uk-form-label">Host</label>
						<div class="uk-form-controls">
							<input class="uk-input uk-form-width-large" type="text" v-model="transmissionOptions.host">
						</div>
					</div>
					<div class="uk-margin">
						<label class="uk-form-label">URL</label>
						<div class="uk-form-controls">
							<input class="uk-input uk-form-width-large" type="text" v-model="transmissionOptions.url">
						</div>
					</div>
					<div class="uk-margin">
						<label class="uk-form-label">Port</label>
						<div class="uk-form-controls">
							<input class="uk-input uk-form-width-large" type="text" v-model="transmissionOptions.port">
						</div>
					</div>
					<div class="uk-margin">
						<label class="uk-form-label">User</label>
						<div class="uk-form-controls">
							<input class="uk-input uk-form-width-large" type="text" v-model="transmissionOptions.username">
						</div>
					</div>
					<div class="uk-margin">
						<label class="uk-form-label">Password</label>
						<div class="uk-form-controls">
							<input class="uk-input uk-form-width-large" type="text" v-model="transmissionOptions.password">
						</div>
					</div>
					<div class="uk-margin">
						<label class="uk-form-label">SSL</label>
						<div class="uk-form-controls">
							<input class="uk-checkbox" type="checkbox" v-model="transmissionOptions.ssl">
						</div>
					</div>
			    </fieldset>
			</form>
		</div>

		<!-- FTP -->
		<div class="uk-card uk-card-default uk-card-body uk-margin-bottom foxeed-block">
			<form class="uk-form-horizontal">
			    <fieldset class="uk-fieldset">

			        <legend class="uk-legend uk-margin-bottom">Connexion FTP</legend>

					<div class="uk-margin">
						<label class="uk-form-label">Host</label>
						<div class="uk-form-controls">
							<input class="uk-input uk-form-width-large" type="text" v-model="ftpOptions.ftpConnection.host">
						</div>
					</div>
					<div class="uk-margin">
						<label class="uk-form-label">User</label>
						<div class="uk-form-controls">
							<input class="uk-input uk-form-width-large" type="text" v-model="ftpOptions.ftpConnection.user">
						</div>
					</div>
					<div class="uk-margin">
						<label class="uk-form-label">Password</label>
						<div class="uk-form-controls">
							<input class="uk-input uk-form-width-large" type="text" v-model="ftpOptions.ftpConnection.password">
						</div>
					</div>
					<div class="uk-margin">
						<label class="uk-form-label">Transferts maximum</label>
						<div class="uk-form-controls">
							<select class="uk-select uk-form-width-large" v-model="ftpOptions.maxTransferts">
								<option class="1">1</option>
								<option class="2">2</option>
								<option class="3">3</option>
								<option class="4">4</option>
								<option class="5">5</option>
								<option class="6">6</option>
								<option class="7">7</option>
								<option class="8">8</option>
								<option class="9">9</option>
								<option class="10">10</option>
							</select>
						</div>
					</div>
					<div class="uk-margin">
						<label class="uk-form-label">Dossier de réception</label>
						<div class="uk-form-controls">
							<span class="uk-margin-right">{{ ftpOptions.localTargetDir }}</span>
							<a href="#" @click.prevent="chooseFtpLocalTargetDir">choisir</a>
						</div>
					</div>
			    </fieldset>
			</form>
		</div>

		<!-- YggTorrent -->
		<div class="uk-card uk-card-default uk-card-body uk-margin-bottom foxeed-block">
			<form class="uk-form-horizontal">
			    <fieldset class="uk-fieldset">

			        <legend class="uk-legend uk-margin-bottom">Connexion à YggTorrent</legend>

					<div class="uk-margin">
						<label class="uk-form-label">Username</label>
						<div class="uk-form-controls">
							<input class="uk-input uk-form-width-large" type="text" v-model="yggtorrentOptions.username">
						</div>
					</div>
					<div class="uk-margin">
						<label class="uk-form-label">Password</label>
						<div class="uk-form-controls">
							<input class="uk-input uk-form-width-large" type="text" v-model="yggtorrentOptions.password">
						</div>
					</div>
			    </fieldset>
			</form>
		</div>
	</div>

</template>

<script>

	var _ = require('lodash')
	import { mapState } from 'vuex'
	const { dialog } = require('electron').remote

	export default {
		name: 'setting',
		computed: mapState([
			'transmissionOptions',
			'yggtorrentOptions',
			'ftpOptions',
			'theme'
		]),
        created() {
        	this.debouncedInputs = _.debounce(this.applyInputsSettings, 500)
        },
		watch: {
			transmissionOptions: {
				handler: function () {
					this.debouncedInputs()
				},
				deep: true
			},
			ftpOptions: {
				handler: function () {
					this.debouncedInputs()
				},
				deep: true
			},
			yggtorrentOptions: {
				handler: function () {
					this.debouncedInputs()
				},
				deep: true
			},
			theme: {
				handler: function() {
					return this.$store.commit('setTheme', this.theme)
				},
				deep: true
			}
		},
        methods: {
        	applyInputsSettings() {
        		this.$store.commit('setTransmissionOptions', this.transmissionOptions)
				this.$transmission.loadOptions(this.transmissionOptions)

				this.$store.commit('setFtpOptions', this.ftpOptions)

				this.$store.commit('setYggtorrentOptions', this.yggtorrentOptions)
        	},
        	chooseFtpLocalTargetDir() {
        		let vm = this
            	dialog.showOpenDialog({
            		'properties': [
            			'openDirectory',
            		]
            	}, function (directory) {

            		if (directory === undefined) return

            		vm.ftpOptions.localTargetDir = directory[0]
            		
            	})
        	}
        }
	}
</script>
