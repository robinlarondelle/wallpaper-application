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

global.fetch = fetch
const unsplash = new Unsplash({ accessKey: settings.accessKey })
const homedir = os.homedir()
let wallpaperDir = `${homedir}\\Pictures\\Wallpaper Application`
if (!fs.existsSync(wallpaperDir)) fs.mkdirSync(wallpaperDir) //Make sure the folder to write to exists

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
  const main = () => {

    console.log(`\n\n Searching for new wallpapers in the ${awnswers.category} category`)
    const imageSearchSettings = {
      query: `${awnswers.category}`,
      orientation: "landscape",
      count: 100 //Get 100 pictures from the API
    }

    unsplash.photos.getRandomPhoto(imageSearchSettings).then(toJson)
      .then(response => {
        let availablePictures = []
        const fullPath = `${wallpaperDir}\\${awnswers.category}.jpg`

        response.forEach(result => {
          if (result.width > 1920 && result.height > 1080) { //HD-images only
            availablePictures.push(result)
          }
        })

        const result = availablePictures[getRandomInt(availablePictures.length - 1)] //pick a random picture
        downloadUnsplashImage(result.urls.full, fullPath, (err, savedPath) => {
          if (err) return err
          setWindowsWallpaper(savedPath)
        })
      })

      .catch(err => {
        console.log("\nLooks like something went wrong! Error:\n")
        console.log(err)
        console.log("\nclosing application\n")
        process.exit(0)
      })
  }

  main() //run first time
  setInterval(main, getIntervalInMilliSeconds(awnswers.interval)) //then run every interval the user gave
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
    console.log("Enjoy your new wallpaper!")
  })()
}

const getRandomInt = (max) => {
  return Math.floor(Math.random() * Math.floor(max));
}

/**
 * This function turns the string interval the user provided to usable miliseconds
 * @param {string} userInterval the interval the user gave as awnswer at the start of the application
 */
const getIntervalInMilliSeconds = (userInterval) => {
  let number = userInterval.split(" ")[0]
  let timeUnit = userInterval.split(" ")[1]  
  
  switch(timeUnit) {
    case "hour" || "hours" : number = number * 1000 * 60 * 60; break;
    case "day" || "days" : number = number * 1000 * 60 * 60 * 24; break;
    case "week" || "weeks" : number = number * 1000 * 60 * 60 * 24 * 7; break;
    case "month" || "months" : number = number * 1000 * 60 * 60 * 24 * 7 * 30,5; break; // i dont care about leapyears or februari
    case "year" || "years" : number = number * 1000 * 60 * 60 * 24 * 7 * 30,5 * 365,25; break;
  }

  return number
}