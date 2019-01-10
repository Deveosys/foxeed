# Foxeed

#### ENG

Foxeed is a desktop application that allows you to search for torrents (only on YggTorrent for now), manage your seedbox Transmission (for now) and upload your files via FTP.

Foxeed is available for Windows, Linux and MacOS platforms.

The application is still in alpha version, do not hesitate to report your comments and bugs on Github. Thank you! 

#### FR 

Foxeed est une application qui permet de rechercher des torrent (seulement sur YggTorrent pour l'instant), gérer votre seedbox Transmission (pour l'instant) et télécharger vos fichier via FTP.

Foxeed est disponible pour les plateformes Windows, Linux et MacOS.

L'application est encore en version alpha, n'hésitez pas à faire remonter vos remarques et bug sur Github. Merci !

## Features to come 
- Internationalization (FR / ENG / DE)
- First use visit
- Video Streaming
- Refine the torrent search 
- Add and select torrent trackers
- Other torrent clients compatibility
- Display more info on dowloading torrents
- Display more info on torrents in search
- Mobile application for torrents search and seedbox management only (that's another story)
- ... every proposals are welcome !

## Development

Feel free to participate and propose features or changes !

Foxeed uses VueJs v2.5, VueCli v3, Vuex v3, VueRouter v3, Electron v2 and Vue CLI Plugin Electron Builder v1.

By the way, it's my first VueJs app so all optimization proposals are welcome !


### Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run electron:serve
```

### Generate Windows NSIS
```
npm run electron:build:windows
```
### Generate Linux ImageApp
```
npm run electron:build:linux
```
### Generate MacOS app
```
npm run electron:build:mac
```

### Run your tests
```
npm run test
```

### Lints and fixes files
```
npm run lint
```
