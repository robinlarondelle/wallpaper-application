const homedir = require("os").homedir()

module.exports = {
  accessKey: "f2762ca3de935268b52a750778fc1c6ecdd398b0a16b0685403a586fc3f25dfa",
  questions: [
    {
      type: "input",
      name: "category",
      message: "What category do you want as wallpaper? ",
      validate: function(value) {
        if (!value) return "No category provided. Defaulted to Rotterdam.";
        return true
      },
      default: "Rotterdam"
    },
    {
      type: "confirm",
      name: "saveImages",
      message:
        `Do you want the wallpaper to be saved on your computer? \nThey will be saved at '${homedir}\\Pictures\\Wallpaper Application'`,
      default: true
    },
    {
      type: "input",
      name: "interval",
      message:
        "At what interval should the wallpaper be updated? \nFormat: '[number] [time-range: hour[s], day[s] etc]'",
      validate: function(value) {
        let result = /[1-9]{1,3} ((hour[s]*)|(day[s]*)|(week[s]*)|(month[s]*))/.test(
          value
        );
        return result ? true : "Max range is 999 [time-range]. Please make sure you use the correct format";
      },
      default: "1 hour"
    }
  ]
};
