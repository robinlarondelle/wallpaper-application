const settings = require("./config/settings");
const fetch = require("node-fetch");
global.fetch = fetch;
const wallpaper = require("wallpaper");
var fs = require("fs");
let request = require("request");
const Unsplash = require("unsplash-js").default;
const { toJson } = require("unsplash-js");

const unsplash = new Unsplash({
  accessKey: settings.accessKey,
  secret: settings.secretKey
});

unsplash.search
  .photos("rotterdam", "1", "1", { orientation: "landscape" })
  .then(toJson)
  .then(res => {
    console.log(res.results);

    console.log(res.results[0].urls);
    console.log(res.results[0].links);
    download(res.results[0].urls.full, "download.jpg", () => {
      (async () => {
        await wallpaper.set("download.jpg");
      })();
    });
  });

let download = function(uri, filename, callback) {
  request.head(uri, function(err, res, body) {
    request(uri)
      .pipe(fs.createWriteStream(filename))
      .on("close", callback);
  });
};
