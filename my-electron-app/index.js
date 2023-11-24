const {app,BrowserWindow,Menu} = require('electron');
const {drpc} = require("./discordrpc");
const path = require('path');

const loadwin = ()=>{
    const window = new BrowserWindow({
        width : 1000,
        height : 1000,
        minHeight : 200,
        minWidth : 200,
        webPreferences : {
            devTools : false,
            nodeIntegrationInWorker : true
        },
        title : "Youtbe app",
        icon : path.join(__dirname,'unnamed.ico')
    });
    const menu = new Menu();
    window.loadURL('https://www.youtube.com/');
    return window;
};

(() =>{
    app.whenReady().then(async ()=>{
        const window = loadwin();
        //window.webContents.on('update-target-url',(e)=>{
        //    if(!(window.webContents.getURL().startsWith('https://www.youtube.com/')) && !(window.menuBarVisible)){
        //        window.setAutoHideMenuBar(false);
        //        window.setMenuBarVisibility(true);
        //    }
        //    else{
        //        window.setAutoHideMenuBar(true);
        //        window.setMenuBarVisibility(false);
        //    }
        //});
        window.webContents.on('audio-state-changed',async(event)=>{
            if(event.audible){
                try{
                    await window.webContents.executeJavaScript(
                        `
                        var data = {};
                        var scriptTags = document.getElementsByTagName('script');
                        for (let i = 0; i < scriptTags.length; i++) {
                            if (scriptTags[i].type === 'application/ld+json') {
                                data = JSON.parse(scriptTags[i].innerText);
                                break;
                            };
                        };
                        data;
                        `
                    )
                    await drpc();
                }
                catch(e){
                    console.error(e);
                };
            };
        });
        app.on('window-all-closed',()=>{if(process.platform !== 'darwin') app.quit();});
        app.on('activate',()=>{if(BrowserWindow.getAllWindows().length === 0) return 0});
    })
    .catch(err =>{console.error(err)});
})();