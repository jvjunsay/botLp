const common = {

  getRandomInt: (m, a) => {
    const min = Math.ceil(m)
    const max = Math.floor(a)
    return Math.floor(Math.random() * (max - min)) + min
  },

  sleep: (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

module.exports = common
