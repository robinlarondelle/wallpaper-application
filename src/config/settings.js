const homedir = require("os").homedir()

module.exports = {
  accessKey: "f2762ca3de935268b52a750778fc1c6ecdd398b0a16b0685403a586fc3f25dfa",
  questions: [
    {
      type: "input",
      name: "category",
      message: "What category do you want as wallpaper? Leave empty if you want a random wallpaper.",

    },
    {
      type: "confirm",
      name: "saveImages",
      message:
        `Do you want the wallpaper to be saved on your computer? \n  They will be saved at '${homedir}\\Pictures\\Wallpaper Application'`,
      default: true
    },
    {
      type: "input",
      name: "interval",
      message:
        `At what interval should the wallpaper be updated?\n  Format: '[number] [time-range: hour[s], day[s] etc]'`,
      validate: function(value) {
        let result = /[0-9]{1,3} ((minute[s]*)|(hour[s]*)|(day[s]*)|(week[s]*)|(month[s]*))/.test(
          value
        );
        return result ? true : "Min is 5 minutes, max is 2 weeks. Please make sure you use the correct format";
      },
      default: "1 hour"
    }
  ]
};
