const settings = require("./config/settings")
const fetch = require("node-fetch")
const wallpaper = require("wallpaper")
const fs = require("fs")
const request = require("request")
const Unsplash = require("unsplash-js").default
const { toJson } = require("unsplash-js")
const os = require("os")
const inquirer = require("inquirer")
const download = require('image-downloader')

const homedir = os.homedir()
let dir = `${homedir}\\Pictures\\Wallpaper Application`
if (!fs.existsSync(dir)) fs.mkdirSync(dir)

global.fetch = fetch

const unsplash = new Unsplash({
  accessKey: settings.accessKey
})

console.log(`

* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 

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
                            

* * * * * * * * * * * * * * * * By Robin La Rondelle * * * * * * * * * * * * * * * * 

`)

inquirer.prompt(settings.questions).then(awnswers => {
  const imageSearchSettings = {
    query: `${awnswers.category}`,
    orientation: "landscape",
    count: 1
  }
  console.log(
    `\n\n Searching for new wallpapers in the ${awnswers.category} category`
  )

  unsplash.photos
    .getRandomPhoto(imageSearchSettings).then(toJson).then(res => {
      res.forEach(result => {
        //HD-images only
        if (result.width > 1920 && result.height > 1080) {
          const fullPath = `${dir}\\${awnswers.category}.jpg`
          console.log(fullPath);
          
          downloadUnsplashImage(result.urls.full, fullPath, (err, savedPath) => {
            if (err) return err
            setWindowsWallpaper(savedPath)
          })
        }
      })
    })
    .catch(err => {
      console.log("\nLooks like something went wrong! Error:\n")
      console.log(err)
      console.log("\nclosing application\n")
    })
})

/**
 * Downloads an image from the Unsplash API and saves it to the C:\[USER]\images\Wallpaper Application folder
 * @param {string} uri the uri from Unsplash to download the image from. Remember - only use the full resolution link
 * @param {string} path the desired path + filename name to save to. If the file name already exists, it will be appended with a number
 * @param {function} callback callback function which returns the filename the image is saved to
 */
const downloadUnsplashImage = (uri, path, callback) => {
  generateDownloadPath(path, (err, downloadPath) => { //Get the updated path to download to
    if (err) return callback(err)

    const options = {
      url: uri,
      dest: downloadPath 
    }

    download.image(options)
      .then(({ filename, image }) => {
        console.log('Saved to', filename)
        callback(null, filename)
      })
      .catch((err) => callback(err))
    })
}

/**
 * Method to prevents overwriting of files by adding a suffix to a filename. Returns updated path with suffix
 * @param {string} originalPathName the original path name the image should be saved to
 */
const generateDownloadPath = (originalPathName, callback) => {
  let folders = originalPathName.split("\\") //Separate the path into separte strings of the folders
  let imagename = folders.splice(-1, 1).join().toLowerCase() //Remove the filename with extention to get just the folderstructure
  folders = folders.join().replace(/,/g, "/") //Recreate the string of just the folders without the filename

  try {
    const files = fs.readdirSync(folders) //Read the contents of the folder
    let counter = 1 //counter tells how many files with the same filename are in the folder

    //Check how many files in the folder contain the desired filename
    files.forEach(file => {
      file = file.replace(/-[1-9]*/g, "") //remove suffix from folderfiles to compare with the original filename
      if (file.toLowerCase() === imagename) counter++ 
    })

    //Generate new filename based on the amount of times the filename occured in the folder
    imagename = imagename.split(".") //separate file extention and filename
    imagename[0] = imagename[0].concat(`-${counter}`) //add file suffix
    imagename = imagename.join().replace(",", ".") //create new file name with suffix and file extention
    const path = folders + "/" + imagename //New path with the updated filename

    callback(null, path)
  } catch (err) {
    callback(err)
  }
}

/**
 * Sets a windows wallpaper from a given path
 * @param {string} path The full path to the image
 */
const setWindowsWallpaper = path => {
  (async () => {
    await wallpaper.set(path)
    console.log("successfully set new wallpaper")
  })()
}
