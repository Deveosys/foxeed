<template>
    <tr class="ftp-download-line">
        <td class="uk-text-center uk-text-nowrap">
            <span class="label">{{ download.progressState.percentage | floor }} <span class="smaller">%</span></span>
        </td>
        <td>{{ download.item.name }}</td>
        <td class="uk-text-center uk-text-nowrap">
            <span>
                {{ download.progressState.transferred | prettyBytes }} / {{ download.item.size | prettyBytes }}
            </span>
        </td>
        <td class="uk-text-center uk-text-nowrap">
            <span>
                {{ download.progressState.speed | prettyBytes }}/s
            </span>
        </td>
        <td class="uk-text-center uk-text-nowrap">

        </td>
        <td class="uk-text-right">
            <a href="#" class="uk-button uk-button-small uk-button-link" @click.prevent="">
                <i class="fas fa-trash"></i>
            </a>
        </td>
    </tr>
</template>

<script>

    export default {
        name: "ftp-download",
        props: {
            download: Object
        },
        data() {
            return {
                progressState: this.download.progressState
            }
        },
        filters: {
            floor: function(number) {
                return Math.floor(number * 100) / 100
            }
        },
    }
</script>