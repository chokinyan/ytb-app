const {app,BrowserWindow,webContents} = require('electron');
const path = require('path');
let window = null;


const loadwin = ()=>{
    window = new BrowserWindow({
        width : 1000,
        height : 1000,
        minHeight : 200,
        minWidth : 200,
        webPreferences : {
            devTools : false
        },
        autoHideMenuBar : true,
        title : "Youtbe musique app",
        icon : path.join(__dirname,'unnamed.png')
    });
    window.loadURL('https://music.youtube.com/');
};

(()=>{
    app.whenReady().then(()=>{
        loadwin();
        console.log(65);
        app.on('activate',()=>{if(BrowserWindow.getAllWindows().length === 0) return 0});
    }).catch(err =>{console.error(err);});
    app.on('window-all-closed',()=>{if(process.platform !== 'darwin') app.quit();});
    app.on('window-all-closed',()=>{})
})();