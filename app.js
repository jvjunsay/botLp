const express = require('express')
const webdriver = require('selenium-webdriver')
const _driver = new webdriver.Builder().forBrowser('chrome').build()
// const baseURL = 'https://www.linkedin.com/'
const app = express()

app.get('/', (req, res) => {
  res.send({hello: 'there1'})
})

app.get('/open', (req, res) => {
  login()

  res.status(200).send({
    'a': 'abc'
  })
  // open(_driver)
})

async function login () {
  _driver.get('https://www.linkedin.com/uas/login?session_redirect=%2Fsales%2F&fromSignIn=true&trk=navigator')
  _driver.findElement(webdriver.By.id('session_key-login')).clear()
  // _driver.findElement(webdriver.By.id('session_key-login')).sendKeys('aaron@linkedprospect.com')
  _driver.findElement(webdriver.By.id('session_key-login')).sendKeys('janjunsay@gmail.com')
  _driver.findElement(webdriver.By.id('session_password-login')).clear()
  // _driver.findElement(webdriver.By.id('session_password-login')).sendKeys('Portsmouth1')
  _driver.findElement(webdriver.By.id('session_password-login')).sendKeys('p0rkyp1g')
  await _driver.findElement(webdriver.By.id('btn-primary')).click()

  // let verificationCode = _driver.FindElement(webdriver.By.id('verification-code'))
  // console.log(verificationCode)

  var existed = await _driver.findElement(webdriver.By.id('verification-code')).then(function () {
    return true // it existed
  }, function (err) {
    if (err instanceof webdriver.error.NoSuchElementError) {
      return false// it was not found
    } else {
      webdriver.promise.rejected(err)
    }
  })
  if (!existed) {
    let cookies = await _driver.manage().getCookies()
    console.log(cookies)
  }

}

const PORT = process.env.PORT || 5000
app.listen(PORT)
