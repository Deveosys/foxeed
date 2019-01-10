<template>
	<div id="torrent-info" v-bind:class="{ 'opened': opened }" class="uk-card uk-card-default uk-card-body foxeed-block">
		<div class="uk-width-1-1 uk-text-right">
			<a href="#" @click.prevent="$emit('closeInfo')"><i class="fas fa-times"></i></a>
		</div>
		<div class="uk-text-break">
			{{ torrent.name }}
		</div>
	</div>
</template>

<script>
	export default {
		name: 'torrent-info',
		props: {
			opened: Boolean,
			torrent: Object,
		},
        methods: {
        }
	}
</script>
