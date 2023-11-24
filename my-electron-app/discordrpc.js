const drpc = async ()=>{
    const discordR = require('discord-rpc');
    const {client_sid,client_id} = require('./config.json');
    const rich = new discordR.Client({transport : 'ipc'});
    discordR.register(client_id);
    const acti = async (st)=>{
        if(!rich){
            console.error("perso err");
        };
        if(rich.application !== undefined){
            console.log(rich);
        }
        console.log(rich);
        rich.setActivity({
            details : `Utilise youtube`,
            state : `${st}`,
            startTimestamp : Date.now(),
            largeImageKey : 'image_2023-07-18_163423094',
            largeImageText : 'test img.',
            instance : false,
        })
    };

    rich.on('ready',()=>{
        console.log("ready");
        acti();
    });

    rich.login({clientId : client_id,clientSecret : client_sid}).catch(err => console.error(err));
    return rich;
};

module.exports = {drpc};