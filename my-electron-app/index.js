const {app,BrowserWindow,Menu,Tray,MenuItem} = require('electron');
const {drpc} = require("./discordrpc");
const path = require('path');
const discordR = require('discord-rpc');
const {client_sid,client_id} = require('./config.json');
//-----------------------------------------------------------------------------------------
var icon = path.join(__dirname,'image\\icone\\favicon.ico');
//-----------------------------------------------------------------------------------------
const norpc = (rich)=>{
    if(!rich){
        console.error("perso err");
    };
    rich.setActivity({
        details : `Utilise youtube`,
        state : `Ne fais rien`,
        startTimestamp : Date.now(),
        largeImageKey : 'image_2023-07-18_163423094',
        largeImageText : 'test img.',
        instance : false,
    });
};

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
        title : "Youtbe",
        icon : icon,
    });

    const menu = new Menu();
    window.loadURL('https://www.youtube.com/');
    return window;
};

const bar = (window)=>{
    const tray = new Tray(icon);
    const contextmenu = new Menu.buildFromTemplate([
        new MenuItem({
            label : 'Ouvrir',
            type : 'normal',
            click : ()=>{window.isVisible() ? 0 : window.show()}
        }),
        new MenuItem({
            label : 'Quitter',
            type : 'normal',
            click : ()=>{app.exit()}
        })
    ]);
    tray.setToolTip('Youtube');
    tray.setContextMenu(contextmenu);
    return tray;
};
//-----------------------------------------------------------------------------------------
(() =>{
    app.whenReady().then(async ()=>{
        const window = loadwin();
        //-------------------------------------------------------------
        const tray = bar(window);
        //-------------------------------------------------------------
        const rich = new discordR.Client({transport : 'ipc'});
        discordR.register(client_id);
        rich.on('ready',()=>{
            norpc(rich);
        });
        rich.login({clientId : client_id,clientSecret : client_sid}).catch(err => console.error(err));
        //-------------------------------------------------------------

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
        window.webContents.on('media-started-playing',async ()=>{
            if(window.webContents.getURL().startsWith('https://www.youtube.com/watch')){
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
                ).then(async (data)=>{
                    if(data.name != undefined){await drpc(rich,data,window.webContents.getURL())}
                }).catch((err)=>{console.error(err)});
            }
        });
        window.webContents.on('media-paused',()=>{
                norpc(rich);
        });
        //---------------------------------------------------------------------------------
        window.on('close',(event)=>{
            event.preventDefault();
            window.hide();
        });
        tray.on('double-click',()=>{
            if(!window.isVisible()){
                window.show();
            };
        });
    })
    .catch(err =>{console.error(err)});
})();