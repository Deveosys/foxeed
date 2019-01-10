var moment = require('moment');
moment.locale('fr')

export default function(timestamp) {
	return moment.unix(timestamp).fromNow()
}