const discordR = require('discord-rpc');

const drpc = async (rich,st,url)=>{

    if(!rich){
        console.error("perso err");
    };
    await rich.setActivity({
        details : `Utilise youtube`,
        state : `Regarde ${st.name}`,
        startTimestamp : Date.now(),
        largeImageKey : st.thumbnailUrl.at(0),
        largeImageText : 'test img.',
        instance : false,
        buttons : [{
            label : "Regarder",
            url : `${url}`
        }]
    });
};

module.exports = {drpc};