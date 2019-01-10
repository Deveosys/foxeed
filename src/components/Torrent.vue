<template>

	   <li  v-bind:class="'torrent-item torrent-status-' + getTorrentStatus(torrent)">
            <div class="uk-flex uk-flex-between"> 
                
                <div>
                    <i class="fas fa-arrow-down"></i> {{ torrent.rateDownload | prettyBytes }}/s <i class="fas fa-arrow-up"></i> {{ torrent.rateUpload | prettyBytes }}/s
                </div>

                <!-- ACTIONS -->
                <div>
                    <ul class="uk-iconnav">
                        <li v-if="torrent.loading"><div data-uk-spinner="ratio: .5"></div></li>
                        <li v-if="!torrent.loading"><a @click.prevent="$emit('toggleTorrentStatus', torrent)" href="#"><i :class="(getTorrentStatus(torrent) === 'STOPPED') ? 'fas fa-play' : 'fas fa-pause' "></i></a></li>
                        <li v-if="!torrent.loading"><a v-on:click.prevent="$emit('removeTorrent', torrent)" href="#"><i class="fas fa-trash"></i></a></li>
                    </ul>
                </div>
            </div>
            <div class="uk-flex uk-flex-between"> 
                <div class="uk-text-truncate" :uk-tooltip="torrent.name">
                     <strong>{{ torrent.name }}</strong>
                </div> 
                <div>
                    <!-- <span v-if="torrent.percentDone < 1">{{ remaingTime }} <i v-if="torrent.remaingTime !== ''" class="fas fa-stopwatch"></i></span>  -->
                     {{ currentSize | prettyBytes }} / {{ torrent.totalSize | prettyBytes }} <i class="fas fa-database"></i>
                </div>
            </div>

            <!-- PROGRESS -->
            <div class="uk-flex uk-flex-middle">
                <div>
                    <span v-if="torrent.percentDone < 1">{{ percentDone }}%</span>
                    
                </div>
                <progress class="uk-progress uk-margin-left uk-margin-right" v-bind:value="torrent.percentDone * 100" max="100"></progress>
                <div>
                    <a href="#" @click.prevent="$emit('openInfo', torrent)" uk-tooltip="Torrent infos">
                        <i class="fas fa-info-circle"></i>
                    </a>
                </div>
            </div>
        </li>

</template>

<script>
	export default {
		name: 'Torrent',
		props: {
            torrent: Object
        },
        computed: {
            currentSize: function () {
                return this.torrent.totalSize * this.torrent.percentDone
            },
            percentDone: function() {
                return Math.round((this.torrent.percentDone * 100))
            },
            remaingTime: function() {
                // TODO
                if (this.torrent.status != 4 || this.torrent.rateDownload == 0) return
                var remains = this.torrent.totalSize - (this.torrent.totalSize * this.torrent.percentDone)
                var seconds = remains / this.torrent.rateDownload
                var hours = Math.round(seconds / 3600)
                var minutes = Math.round((seconds % 60) / 60)
                seconds = Math.round(seconds % 60);
                return (hours > 0 ? hours + 'h ' : '') + (minutes > 0 ? minutes + 'm ' : '') + seconds + 's'
            }
        },
        methods: {
            getTorrentStatus(torrent) {
                return this.$transmission.statusArray[torrent.status]
            }
        }
	}
</script>