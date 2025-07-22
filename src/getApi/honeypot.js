const axios = require('axios');
const express = require('express');
const cors = require('cors');





let date = new Date();
function  main (address){
   let data =   axios.get('https://aywt3wreda.execute-api.eu-west-1.amazonaws.com/default/IsHoneypot',{
        params:{
          "chain": 'eth',
          "token": address
        },
        headers:{
            "access-control-allow-headers": "*",
            "access-control-allow-origin": "*",
            "apigw-requestid": "U2AiYg45joEEMUA=",
            "content-type": "application/json",
            "date": date,
            "User-Agent": "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.67 Mobile Safari/537.36",

            "Referer": `https://aywt3wreda.execute-api.eu-west-1.amazonaws.com/default/IsHoneypot?chain=eth&token=${address}`,
            "Origin": 'https://aywt3wreda.execute-api.eu-west-1.amazonaws.com'
        }
      //httpsAgent: new https.Agent({ keepAlive: true }),
    });

    return data;
}


module.exports = main;