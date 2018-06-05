const common = require('./common')
const webdriver = require('selenium-webdriver')
const proxy = require('selenium-webdriver/proxy')

class LinkedInAccounts {
  constructor () {
    this._driver = {}
  }

  async logIn (body) {
    let { username, password, httpProxy } = body

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

    // this._driver.quit()

    this._driver.get('https://www.linkedin.com')
    await this._driver.wait(webdriver.until.elementLocated({id: 'login-email'}), 20000).then
    this._driver.findElement(webdriver.By.id('login-email')).clear()
    this._driver.findElement(webdriver.By.id('login-password')).clear()
    this._driver.findElement(webdriver.By.id('login-email')).sendKeys(username)
    this._driver.findElement(webdriver.By.id('login-password')).sendKeys(password)
    await common.sleep(10000)
    // await _driver.wait(webdriver.until.elementLocated({id: 'login-submit'}), 150000)
    await this._driver.findElement(webdriver.By.id('login-submit')).click()

    var existed = await this._driver.findElement(webdriver.By.id('session_password-login-error')).then(function () {
      return true // it existed
    }, function (err) {
      if (err instanceof webdriver.error.NoSuchElementError) {
        return false// it was not found
      } else {
        webdriver.promise.rejected(err)
      }
    })

    if (existed) {
      return {
        success: false,
        message: 'Invalid Linkedin Credentials.'
      }
    } else {
      return {
        success: true,
        message: 'Successfully Logged-in.'
      }
    }
  }

  async searchByKeyWord (body) {
    let { keyword, count = 10, firstName = '', lastName = '', title = '', company = '', school = '' } = body
    let pages = Math.round(count / 10)
    let data = []
    // _driver.getPageSource().then(s => {
    //   source = s
    // })
    await this._driver.findElement(webdriver.By.css('input[placeholder=\'Search\']')).clear()
    await this._driver.findElement(webdriver.By.css('input[placeholder=\'Search\']')).sendKeys(keyword)
    await this._driver.findElement(webdriver.By.css('input[placeholder=\'Search\']')).sendKeys(webdriver.Key.ENTER)
    await common.sleep(10000)

    await this._driver.findElement(webdriver.By.className('search-filters-bar__all-filters')).then(function (elem) {
      elem.click()
      return true // it existed
    }, function (err) {
      if (err instanceof webdriver.error.NoSuchElementError) {
        return false// it was not found
      } else {
        webdriver.promise.rejected(err)
      }
    })
    await common.sleep(2000)
    this._driver.wait(webdriver.until.elementLocated(webdriver.By.id('search-advanced-firstName')))
    if (firstName !== '') { await this._driver.findElement(webdriver.By.id('search-advanced-firstName')).clear() }
    if (firstName !== '') { await this._driver.findElement(webdriver.By.id('search-advanced-firstName')).sendKeys(firstName) }
    if (lastName !== '') { await this._driver.findElement({id: 'search-advanced-lastName'}).clear() }
    if (lastName !== '') { await this._driver.findElement({id: 'search-advanced-lastName'}).sendKeys(lastName) }
    if (title !== '') { await this._driver.findElement({id: 'search-advanced-title'}).clear() }
    if (title !== '') { await this._driver.findElement({id: 'search-advanced-title'}).sendKeys(title) }
    if (company !== '') { await this._driver.findElement({id: 'search-advanced-company'}).clear() }
    if (company !== '') { await this._driver.findElement({id: 'search-advanced-company'}).sendKeys(company) }
    if (school !== '') { await this._driver.findElement({id: 'search-advanced-school'}).clear() }
    if (school !== '') { await this._driver.findElement({id: 'search-advanced-school'}).sendKeys(school) }

    // if (location !== '') { await this._driver.findElement(webdriver.By.css('input[placeholder=\'Add a location\']')).clear() }
    // if (location !== '') { await this._driver.findElement(webdriver.By.css('input[placeholder=\'Add a location\']')).sendKeys('test') }
    // if (location !== '') { await this._driver.findElement(webdriver.By.css('input[placeholder=\'Add a location\']')).sendKeys(webdriver.Key.ENTER) }

    await this._driver.findElement(webdriver.By.className('search-advanced-facets__button--apply')).click()

    // await this._driver.findElement(webdriver.until.elementLocated({className: 'search-filters-bar__all-filters'}))
    // this._driver.findElement({className: 'search-filters-bar__all-filters'}).click()

    data = await this.scrapeResults(pages, data)

    return {
      success: true,
      data: data
    }
  }

  async searchByUrls (body) {
    let { url, count } = body
    await this._driver.get(url)
    common.sleep(5000)

    let data = []
    let pages = Math.round(count / 10)

    data = await this.scrapeResults(pages, data)

    return {
      success: true,
      data: data
    }
  }

  async getCookies () {
    let cookies = await this._driver.manage().getCookies()
    return cookies
  }

  async scrapeResults (pages, data) {
    for (let i = 1; i <= pages; i++) {
      await common.sleep(1000)
      await this._driver.wait(webdriver.until.elementLocated({className: 'search-result__occluded-item'}))
      let elems = await this._driver.findElements({className: 'search-result__occluded-item'})

      for (let j = 0, k = 500; j < 10; j++, k += 500) {
        await common.sleep(common.getRandomInt(500, 1000))
        await this._driver.executeScript('window.scrollBy(0,' + k + ')')
      }
      await this._driver.executeScript('window.scrollBy(0,10000)')
      common.sleep(500)

      for (let elem of elems) {
        let value = await elem.getText()
        await this._driver.wait(webdriver.until.elementLocated({className: 'search-result__result-link'}))
        let link = await elem.findElement({className: 'search-result__result-link'}).getAttribute('href')
        value = value.split('\n')
        data.push({
          url: link,
          currentJob: 'none',
          name: value[0],
          job: value[3],
          location: value[4]
        })
        await common.sleep(1000)
        console.log(data)
      }

      await this._driver.findElement(webdriver.By.className('next')).then(function (elem) {
        elem.click()
      }, function (err) {
        if (err instanceof webdriver.error.NoSuchElementError) {
          return data// it was not found
        } else {
          webdriver.promise.rejected(err)
        }
      })

      // await this._driver.findElement({className: 'next'}).click()
    }
    return data
  }
}

module.exports = LinkedInAccounts
