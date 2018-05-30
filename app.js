const express = require('express')
const webdriver = require('selenium-webdriver')

const app = express()

app.get('/', (req, res) => {
  res.send({hello: 'there1'})
})

app.get('/open', (req, res) => {
  let _driver = new webdriver.Builder().forBrowser('chrome').build()

  open(_driver)

  res.status(200).send({
    'a': 'abc'
  })
  // open(_driver)
})

async function open (_driver) {
  _driver.get('https://www.linkedin.com/uas/login?session_redirect=%2Fsales%2F&fromSignIn=true&trk=navigator')
  _driver.findElement(webdriver.By.id('session_key-login')).clear()
  // _driver.findElement(webdriver.By.id('session_key-login')).sendKeys('aaron@linkedprospect.com')
  _driver.findElement(webdriver.By.id('session_key-login')).sendKeys('janjunsay@gmail.com')
  _driver.findElement(webdriver.By.id('session_password-login')).clear()
  // _driver.findElement(webdriver.By.id('session_password-login')).sendKeys('Portsmouth1')
  _driver.findElement(webdriver.By.id('session_password-login')).sendKeys('p0rkyp1g')
  await _driver.findElement(webdriver.By.id('btn-primary')).click()
  let verificationCode = _driver.findElement(webdriver.By.id('verification-code'))
  console.log(verificationCode)
}

const PORT = process.env.PORT || 3000
app.listen(PORT)
