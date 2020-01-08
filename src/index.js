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
                            

* * * * * * * * * * * * * By Robin La Rondelle * * * * * * * * * * * * * 

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
    }).catch(err => {
      console.log("\nLooks like something went wrong! Error:\n");
      console.log(err);
      console.log("\nclosing application\n");
    })
});

/**
 * Downloads an image from the Unsplash API and saves it to the C:\[USER]\images\Wallpaper Application folder
 * @param {string} uri the uri from Unsplash to download the image from. Remember - only use the full resolution link
 * @param {string} filename the desired file name to save to. If the file name already exists, it will be appended with a number
 * @param {function} callback callback function which returns the filename the image is saved to
 */
const downloadUnsplashImage = function(uri, filename, callback) {
  request.head(uri, function(err, res, body) {
    request(uri)
      .pipe(writeFile(filename))
      .on("close", callback);
  });
};

/**
 * Stores a file in a given path. Appends a number to the file name if the file name already exists in the given directory
 * @param {string} fullPath The full path name including the file name
 */
const writeFile = (fullPath) => {
  let folders = fullPath.split("\\");
  let imagename = folders.splice(-1,1).join().toLowerCase()
  folders = folders.join().replace(/,/g, "/") 
  
  try {
    const files = fs.readdirSync(folders)
    let counter = 1
    for(var file in files) {
      if (file.toLowerCase() === imagename) {
        counter++
      }
    }

    imagename = imagename.split(".")
    console.log(imagename);
    
    imagename[0].concat(`-${counter}`)
    console.log(imagename);
    

    console.log(files);
    
  } catch (err) {
    throw err
  }
}

/**
 * Sets a windows wallpaper from a given path
 * @param {string} path The full path to the image
 */
const setWindowsWallpaper = (path) => {
  (async () => {
    await wallpaper.set(path);
    console.log("successfully set new wallpaper");
  })();
};