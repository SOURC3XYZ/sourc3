// @ts-ignore

// eslint-disable-next-line import/no-extraneous-dependencies
const { ipcRenderer } = require('electron');

process.once('loaded', () => {
    window.addEventListener('message', (evt) => {
        if (evt.data.type === 'select-dirs') {
            console.log('kek');
            ipcRenderer.send('select-dirs');
        }
    });

    ipcRenderer.on('ping', (_, message) => {
        window.postMessage({
            type: 'select-dirs-answer',
            path: message
        });
    });
});
