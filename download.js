const ytdl = require('ytdl-core');
const fs = require('fs');
const path = require('path');
const os = require('os');

const videoUrl = process.argv[2];

if (!videoUrl) {
  console.error('Por favor coloque a url!');
  process.exit(1);
}

ytdl.getInfo(videoUrl)
  .then(info => {
    const videoTitle = info.videoDetails.title;
    const videoFormat = ytdl.chooseFormat(info.formats, { quality: 'highest' });

    const videosDir = path.join(os.homedir(), 'Videos');
    const youtubeDir = path.join(videosDir, 'YTDVideos');

    if (!fs.existsSync(youtubeDir)) {
      fs.mkdirSync(youtubeDir);
    }

    const videoPath = path.join(youtubeDir, `${videoTitle}.mp4`);

    const message = `Baixando ${videoTitle}...`;
    const loading = createLoading(message);

    ytdl(videoUrl, { format: videoFormat })
      .pipe(fs.createWriteStream(videoPath))
      .on('finish', () => {
        loading.stop();
        console.log(`O video foi guardado em ${videoPath}`);
      });
  })
  .catch(error => {
    console.error(error.message);
    process.exit(1);
  });

function createLoading(message) {
  const spinner = ['|', '/', '-', '\\'];
  let i = 0;
  const interval = setInterval(() => {
    process.stdout.write(`\r${spinner[i++]} ${message}`);
    i %= spinner.length;
  }, 100);
  return {
    stop() {
      clearInterval(interval);
      process.stdout.write('\r');
    }
  };
}
