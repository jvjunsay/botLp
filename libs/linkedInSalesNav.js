const common = require('./common')
const webdriver = require('selenium-webdriver')
const proxy = require('selenium-webdriver/proxy')

class LinkedInSalesNav {
  constructor () {
    this._driver = null
  }

  async login (body) {
    let { username, password, httpProxy } = body
    if (this._driver !== null) this._driver.quit()
    if (httpProxy !== '') {
      this._driver = new webdriver.Builder()
        .forBrowser('chrome')
        .setProxy(proxy.manual({http: httpProxy}))
        .build()
    } else {
      this._driver = new webdriver.Builder()
        .forBrowser('chrome')
        .build()
    }

    this._driver.get('https://www.linkedin.com/uas/login?session_redirect=%2Fsales%2F&fromSignIn=true&trk=navigator')
    this._driver.findElement({id: 'session_key-login'}).clear()
    this._driver.findElement({id: 'session_key-login'}).sendKeys(username)
    this._driver.findElement({id: 'session_password-login'}).clear()
    this._driver.findElement({id: 'session_password-login'}).sendKeys(password)
    await common.sleep(1000)
    await this._driver.findElement({id: 'btn-primary'}).click()

    var forVerification = await this._driver.findElement({id: 'verification-code'})
      .then(() => { return true }, (err) => {
        if (err instanceof webdriver.error.NoSuchElementError) {
          return false// it was not found
        } else {
          webdriver.promise.rejected(err)
        }
      })

    if (!forVerification) {
      let cookies = await this._driver.manage().getCookies()
      console.log(cookies)

      return {
        success: true,
        message: 'Successfully Logged-in.'
      }
    }
  }

  async searchkeyWord (body) {
    let { keyword, count } = body
    let data = []
    // let pages = Math.round(count / 25)

    await common.sleep(1000)
    await this._driver.findElement({xpath: '//*[@id="global-nav-typeahead-input"]'}).clear()
    await this._driver.findElement({xpath: '//*[@id="global-nav-typeahead-input"]'}).sendKeys(keyword)
    await common.sleep(500)
    await this._driver.findElement({xpath: '//*[@id="global-nav-typeahead-input"]'}).sendKeys(webdriver.Key.ENTER)

    // for (let elem of elems) {
    //   let value = await elem.getText()
    //   console.log(value)
    // }
    await this._driver.wait(webdriver.until.elementLocated({className: 'result'}))
    let url = await this._driver.getCurrentUrl()
    url = url + '&count=' + count
    await this._driver.get(url)
    data = await this.scrapeResults(data, count)

    return {
      success: true,
      data: data
    }
  }

  async scrapeResults (data, count) {
    await this._driver.wait(webdriver.until.elementLocated({className: 'result'}))
    let elems = await this._driver.findElements({className: 'result'})

    for (let j = 0, k = 500; j < 10; j++, k += 500) {
      await common.sleep(common.getRandomInt(200, 500))
      await this._driver.executeScript('window.scrollBy(0,' + k + ')')
    }
    await this._driver.executeScript('window.scrollBy(0,10000)')
    common.sleep(500)
    let counter = 1
    for (let elem of elems) {
      if (counter !== count) {
        let value = await elem.getText()
        // await elem.wait(webdriver.until.elementLocated({className: 'image-wrapper'}))
        let link = await elem.findElement({className: 'image-wrapper'}).getAttribute('href')
        value = value.split('\n')
        data.push({
          url: link,
          currentJob: 'none',
          name: value[0],
          job: value[4],
          location: value[3]
        })
        await common.sleep(1000)
        console.log(data)
      } else {
        return data
      }

      counter++
    }

    return data
  }
}

module.exports = LinkedInSalesNav
