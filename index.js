const fs = require('fs');
const neatCsv = require('neat-csv');
const { google } = require('googleapis');
const credentials = require('./credentials.json');

const scopes = ['https://www.googleapis.com/auth/drive'];
const auth = new google.auth.JWT(
    credentials.client_email, null,
    credentials.private_key, scopes
);
const drive = google.drive({ version: "v3", auth });

let dataArray = '';
let output = 'username,firstName,lastName,studentID,photoURL,fileName\n';


let seattleURL = 'https://drive.google.com/u/0/open?usp=forms_web&id=';

let dataArr = [];

const getFirstPage = (currentDrive, fileName) => {
    currentDrive.files.list({pageSize: 1000, fields: 'nextPageToken, files(id, name)'}, (err, res) => {
        if (err) throw err;
    
        console.log('length:',res.data.files.length);
    
        res.data.files.map(entry => {
            const { name, id } = entry;
            dataArr.push({photoURL: `${seattleURL}${id}`, fileName: name});
        });
    
        if (res.data.nextPageToken){
            nextPage(currentDrive, fileName, res.data.nextPageToken);
        }
        else{
            console.log('End reached. Length:', dataArr.length);
            // console.log('data:', dataArr)
            verifier();
        }
    });
}

const nextPage = (currentDrive, fileName, nextPageToken) => {
    currentDrive.files.list({'pageToken': nextPageToken, pageSize: 1000}, (err, res) => {
        console.log('Accessing next page. Current Length:', dataArr.length);
        if (err) throw err;
    
        res.data.files.map(entry => {
            const { name, id } = entry;
            dataArr.push({photoURL: `${seattleURL}${id}`, fileName: name});
        });
        if (res.data.nextPageToken){
            nextPage(currentDrive, fileName, res.data.nextPageToken);
        }
        else{
            console.log('End reached. Length:', dataArr.length);
            // console.log('data:', dataArr)
            verifier();
        }
    });
}

getFirstPage(drive, 'Data-Seattle');

const verifier = () => {
    fs.readFile('./Input.csv', async (err, data) => {
        if (err) { console.error(err)
          return
        }
        dataArray = await neatCsv(data);
        // console.log(dataArray[dataArray.length-1]);
    if (dataArray){
        // console.log('verifier dataArr length', dataArr.length)
        // console.log('verifier dataArray length', dataArray.length)
        console.log('verifier dataArr[0]', dataArr[1])
        console.log('verifier dataArray[0]', dataArray[0])
        for (let i = 0; i < dataArray.length; i++){
            // console.log('dataArray[i]',dataArray[i])
            // console.log('filename: ',dataArray[i].fileName)
        //    let returnString = `${dataArray[i].username},${dataArray[i].firstName},${dataArray[i].lastName},${dataArray[i].studentID},${dataArray[i].fileName}`;
           for (let b = 0; b < dataArr.length; b++){
            //    console.log('if photourl: ', dataArr[b].photoURL === dataArray[i].photoURL);
            //    console.log(`photourl b: ${dataArr[b].photoURL} photourl i: ${dataArray[i].photoURL}`);
                if(dataArr[b].photoURL === dataArray[i].photoURL){
                    // console.log(`if statement true: b:${b}, i:${i}`)
                    if(dataArr[b].fileName !== dataArray[i].fileName){
                        console.log(`\nDiscrepancy found: \nGoogleDrive url: ${dataArr[b].photoURL}\nMatchedSetSheet url: ${dataArray[i].photoURL}\nGD filename: ${dataArr[b].fileName}\nMS filename: ${dataArray[i].fileName}` )
                    }
                }
           }
        //    output += `${returnString}\n`
       }
    
    //     fs.writeFile(`Output.csv`, output, (err) => {
    //         if (err) throw err;
    //         console.log('The file has been saved!');
    //         });
        }
    })
}