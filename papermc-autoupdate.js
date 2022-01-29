const axios = require('axios');
const crypto = require('crypto');
const fs = require('fs');

const baseUrl = "https://papermc.io/api/v2";
const project = "paper";
const version = "1.18.1";

const paperPath = "./paper.jar"

const versionUrl = `${baseUrl}/projects/${project}/versions/${version}`;

let paper = fs.existsSync(paperPath) 
              ? fs.readFileSync(paperPath) 
              : "";

let sha256 = crypto.createHash('sha256')
              .update(paper)
              .digest('hex');

let download = async function() {
    console.log(`Searching for latest build for: ${project}-${version}`);
    let versionInfo = await axios.get(versionUrl);
    let latestBuild = versionInfo.data.builds.reverse()[0];

    console.log(`Found latest build: #${latestBuild}`);

    let buildUrl = `${versionUrl}/builds/${latestBuild}`;

    let buildInfo = await axios.get(buildUrl);
    let Build = buildInfo.data.downloads.application

    let filename =  Build.name;
    let papersha256 = Build.sha256;

    console.log(`Build #${latestBuild} Filename: ${filename}`);

    console.log(`Comparing old and new sha256`);
    console.log(`Old: ${sha256}`);
    console.log(`New: ${papersha256}`);
    if (sha256 !== papersha256){
        console.log(`sha256 unmatched, Downloading the latest build...`)
        axios({
            method: 'get',
            url: `${buildUrl}/downloads/${filename}`,
            responseType: 'stream',
        }).then((res) => {
            let pipe = fs.createWriteStream(paperPath);
            res.data.pipe(pipe);
            pipe.on('finish', () => {
                console.log("Downloaded into " + paperPath);
                return true
            });
        });
    } else {
        console.log("sha256 matched, Already have latest build");
        return true
    }
};

download();
