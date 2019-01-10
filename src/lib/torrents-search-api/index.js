const scrapeIt = require("scrape-it")

export default class TorrentSearch {
    constructor() {
    }

    search (query) {
        return scrapeIt(query, {
            torrents: {
                listItem: ".results tr",
                data: {
                    title: 'td:nth-child(2) a',
                    time: 'td:nth-child(5) div',
                    seeds: 'td:nth-child(8)',
                    peers: 'td:nth-child(9)',
                    size: 'td:nth-child(6)',
                    desc: 'td:nth-child(2)',
                    id: {
                        selector: 'td:nth-child(3) a',
                        attr: 'target'
                    }
                }
            },
            pages: {
                listItem: "section.content ul.pagination li a",
                data: {
                    label: "",
                    link: {
                        attr: "href"
                    }
                }
            }
        })
    }
}
