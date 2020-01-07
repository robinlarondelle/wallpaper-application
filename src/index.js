const settings = require("./config/settings");
const fetch = require("node-fetch");
const wallpaper = require("wallpaper");
const fs = require("fs");
const request = require("request");
const Unsplash = require("unsplash-js").default;
const { toJson } = require("unsplash-js");
const os = require("os");
const inquirer = require("inquirer");

const homedir = os.homedir();
let dir = `${homedir}\\Pictures\\Wallpaper Application`;
if (!fs.existsSync(dir)) fs.mkdirSync(dir);

global.fetch = fetch;

const unsplash = new Unsplash({
  accessKey: settings.accessKey
});

console.log(`

* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 

██╗    ██╗ █████╗ ██╗     ██╗     ██████╗  █████╗ ██████╗ ███████╗██████╗         
██║    ██║██╔══██╗██║     ██║     ██╔══██╗██╔══██╗██╔══██╗██╔════╝██╔══██╗        
██║ █╗ ██║███████║██║     ██║     ██████╔╝███████║██████╔╝█████╗  ██████╔╝        
██║███╗██║██╔══██║██║     ██║     ██╔═══╝ ██╔══██║██╔═══╝ ██╔══╝  ██╔══██╗        
╚███╔███╔╝██║  ██║███████╗███████╗██║     ██║  ██║██║     ███████╗██║  ██║        
 ╚══╝╚══╝ ╚═╝  ╚═╝╚══════╝╚══════╝╚═╝     ╚═╝  ╚═╝╚═╝     ╚══════╝╚═╝  ╚═╝        
                                                                                  
 █████╗ ██████╗ ██████╗ ██╗     ██╗ ██████╗ █████╗ ████████╗██╗ ██████╗ ███╗   ██╗
██╔══██╗██╔══██╗██╔══██╗██║     ██║██╔════╝██╔══██╗╚══██╔══╝██║██╔═══██╗████╗  ██║
███████║██████╔╝██████╔╝██║     ██║██║     ███████║   ██║   ██║██║   ██║██╔██╗ ██║
██╔══██║██╔═══╝ ██╔═══╝ ██║     ██║██║     ██╔══██║   ██║   ██║██║   ██║██║╚██╗██║
██║  ██║██║     ██║     ███████╗██║╚██████╗██║  ██║   ██║   ██║╚██████╔╝██║ ╚████║
╚═╝  ╚═╝╚═╝     ╚═╝     ╚══════╝╚═╝ ╚═════╝╚═╝  ╚═╝   ╚═╝   ╚═╝ ╚═════╝ ╚═╝  ╚═══╝
                            

* * * * * * * * * * *  * * By Robin La Rondelle * * * * * * * * * * * *  * 

`);

inquirer.prompt(settings.questions).then(awnswers => {
  console.log(
    `\n\n Searching for new wallpapers in the ${awnswers.category} category`
  );

  unsplash.photos
    .getRandomPhoto({
      query: `${awnswers.category}`,
      orientation: "landscape",
      count: 5
    })
    .then(toJson)
    .then(res => {
      res.forEach(result => {
        if (result.width > 1920 && result.height > 1080) {

          //HD-images only
          downloadUnsplashImage(
            result.urls.full,
            `${dir}\\${awnswers.category}.jpg`,
            filename => {
              setWindowsWallpaper(filename);
            }
          );
        }
      });
    });
});

/**
 * Downloads an image from the Unsplash API and saves it to the C:\[USER]\images\Wallpaper Application folder
 * @param {string} uri the uri from Unsplash to download the image from. Remember - only use the full resolution link
 * @param {string} filename the desired file name to save to. If the file name already exists, it will be appended with a number
 * @param {function} callback callback function which returns the filename the image is saved to
 */
let downloadUnsplashImage = function(uri, filename, callback) {
  request.head(uri, function(err, res, body) {
    request(uri)
      .pipe(writeFile(filename))
      .on("close", callback);
  });
};

let writeFile = function(filename) {
  let folders = filename.split("\\");
  folders.splice(-1,1)
  folders = folders.join().replace(/,/g, "/")
  fs.readdir(folders, (err, files) => {
    console.log(files);
    fs.createWriteStream(filename, { flags: "a" });
  });
}

let setWindowsWallpaper = function(url) {
  (async () => {
    await wallpaper.set(url);
    console.log("successfully set new wallpaper");
  })();
};