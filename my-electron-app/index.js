const {app,BrowserWindow,Menu,Tray,MenuItem} = require('electron');
const {drpc} = require("./discordrpc");
const path = require('path');
const discordR = require('discord-rpc');
const {client_sid,client_id} = require('./config.json');
//-----------------------------------------------------------------------------------------

var icon = path.join(__dirname,'image\\icone\\favicon.ico');

//-----------------------------------------------------------------------------------------

const videoskipad = async (window)=>{
    await window.webContents.executeJavaScript(
        `
        if(document.querySelector("div.ad-showing")){
            video = document.getElementsByClassName('video-stream html5-main-video')[0];
            video.currentTime = video.duration;
        }
        `
    );
};
const pageskipad = async (window)=>{
    return await window.webContents.executeJavaScript(
        `
        var skip = false;
        //----------------------------------------------------------------------------------------------------
        if(document?.querySelector('ytd-promoted-sparkles-web-renderer')){
            skip = true;
            document?.querySelector('ytd-promoted-sparkles-web-renderer').remove();
        }
        //----------------------------------------------------------------------------------------------------
        if(document?.querySelector('ytd-action-companion-ad-renderer')){
            skip = true;
            document?.querySelector('ytd-action-companion-ad-renderer')?.remove();
        }
        //----------------------------------------------------------------------------------------------------
        if(document?.getElementById('player-ads')){
            skip = true;
            document?.getElementById('player-ads')?.remove();
        }
        //----------------------------------------------------------------------------------------------------
        if(document?.querySelector('ytd-ad-slot-renderer')){
            skip = true;
            document.querySelector('ytd-ad-slot-renderer')?.remove();
        }
        //----------------------------------------------------------------------------------------------------
        if(document?.querySelector('ytd-compact-promoted-video-renderer')){
            skip = true;
            document.querySelector('ytd-compact-promoted-video-renderer')?.remove();
        }
        //----------------------------------------------------------------------------------------------------
        if(document?.querySelector('ytd-banner-promo-renderer')){
            skip = true;
            document.querySelector('ytd-banner-promo-renderer').remove();
        }
        //-----------------------------------------------------------------------------------------------------
        if(document?.querySelector('ytd-statement-banner-renderer')){
            skip = true;
            document.querySelector('ytd-statement-banner-renderer').remove();
        }
        skip;
        `
    ).catch((err)=>{
        console.error(err);
    })
};

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

const pip = async (window)=>{
    await window.webContents.executeJavaScript(
        `
            for(video of document.getElementsByTagName('video')){
                video.requestPictureInPicture()
            }
        `
    );
};

const loadwin = ()=>{
    const window = new BrowserWindow({
        width : 1000,
        height : 1000,
        minHeight : 200,
        minWidth : 200,
        webPreferences : {
            devTools : true,
            nodeIntegrationInWorker : true
        },
        title : "Youtube",
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
            label : "pic and pic",
            type : "normal",
            checked : false,
            click : ()=>{pip(window)}
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
                    await videoskipad(window);
                    if(data.name != undefined){await drpc(rich,data,window.webContents.getURL())}
                }).catch((err)=>{console.error(err)});
            }
        });
        window.webContents.on('media-paused',()=>{
                norpc(rich);
        });
        window.on('enter-html-full-screen',(event)=>{
            window.setMenuBarVisibility(false);
        });
        window.on('leave-html-full-screen',(event)=>{
            window.setMenuBarVisibility(true);
        });
        window.webContents.on('update-target-url',async (event)=>{
            event.preventDefault();
            await pageskipad(window);
        })

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
    app.on('quit',(event)=>{
        
    })
})();