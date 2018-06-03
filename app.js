const express = require('express')
const webdriver = require('selenium-webdriver')
const _ = require('lodash')
const bodyParser = require('body-parser')
const axios = require('axios').default
const tough = require('tough-cookie')
const axiosCookieJarSupport = require('axios-cookiejar-support').default

const _driver = new webdriver.Builder().forBrowser('chrome').build()
axiosCookieJarSupport(axios)

const cookieJar = new tough.CookieJar()
const app = express()

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

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

app.post('/search', (req, res) => {
  searchKeywords(req.body).then(s => {
    res.status(200).send(s)
  })
})

app.post('/login', (req, res) => {
  linkedInLogin(req.body).then((s) => {
    res.status(200).send(s)
  })
})

async function searchKeywords (body) {
  let { keyword, count } = body
  // _driver.getPageSource().then(s => {
  //   source = s
  // })
  await _driver.findElement(webdriver.By.css('input[placeholder=\'Search\']')).clear()
  await _driver.findElement(webdriver.By.css('input[placeholder=\'Search\']')).sendKeys(keyword)
  await _driver.findElement(webdriver.By.css('input[placeholder=\'Search\']')).sendKeys(webdriver.Key.ENTER)
  await sleep(5000)
  console.log('finsihed sleep')

  let data = []
  let pages = Math.round(count / 10)
  let i = 0

  for (i = 1; i <= pages; i++) {
    await _driver.wait(webdriver.until.elementLocated({className: 'search-result__occluded-item'}))
    let elems = await _driver.findElements({className: 'search-result__occluded-item'})

    // _driver.executeScript('window.scrollBy(0,1)')
    // await sleep(1000)
    // _driver.executeScript('window.scrollBy(0,10000)')
    // await sleep(1000)

    for (let j = 0, k = 500; j < 10; j++, k += 500) {
      await sleep(getRandomInt(500, 1000))
      await _driver.executeScript('window.scrollBy(0,' + k + ')')
    }
    await _driver.executeScript('window.scrollBy(0,10000)')
    sleep(500)

    for (let elem of elems) {
      let value = await elem.getText()
      await _driver.wait(webdriver.until.elementLocated({className: 'search-result__result-link'}))
      let link = await elem.findElement({className: 'search-result__result-link'}).getAttribute('href')
      value = value.split('\n')
      data.push({
        url: link,
        currentJob: 'none',
        name: value[0],
        job: value[3],
        location: value[4]
      })
      await sleep(1000)
      console.log(data)
    }

    await _driver.findElement({className: 'next'}).click()
    await sleep(5000)
  }

  return {
    success: true,
    data: data
  }

  // _driver.findElement({xpath: '//*[@class="nav-typeahead-wormhole"]/div'}).then(s => {
  //   element = s
  // }, function (err) {
  //   if (err instanceof webdriver.error.NoSuchElementError) {
  //     console.log('not found')
  //   } else {
  //     webdriver.promise.rejected(err)
  //   }
  // })
  // console.log(element)
  // _driver.findElement({xpath: '//*[@id="ember1363"]/input'}).clear()
  // _driver.findElement({xpath: '//*[@id="ember1363"]/input'}).sendKeys(keyword)
}

function getRandomInt (m, a) {
  const min = Math.ceil(m)
  const max = Math.floor(a)
  return Math.floor(Math.random() * (max - min)) + min
}

function sleep (ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function linkedInLogin (body) {
  let { username, password } = body
  _driver.get('https://www.linkedin.com')
  await _driver.wait(webdriver.until.elementLocated({id: 'login-email'}), 20000).then
  _driver.findElement(webdriver.By.id('login-email')).clear()
  _driver.findElement(webdriver.By.id('login-password')).clear()
  _driver.findElement(webdriver.By.id('login-email')).sendKeys(username)
  _driver.findElement(webdriver.By.id('login-password')).sendKeys(password)
  await sleep(10000)
  // await _driver.wait(webdriver.until.elementLocated({id: 'login-submit'}), 150000)
  await _driver.findElement(webdriver.By.id('login-submit')).click()

  var existed = await _driver.findElement(webdriver.By.id('session_password-login-error')).then(function () {
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
  // *[@id="ember1373"]/input
}

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
    await getCookies()
    // let cookies = await _driver.manage().getCookies()
    // _.map(cookies, (c) => {
    //   // let Cookie = tough.Cookie
    //   // let cookie = Cookie.fromJSON(c)
    //   // cookieJar.setCookie(cookie)
    // })
  }
  console.log(existed)
}

async function getCookies () {
  await axios.get('https://www.linkedin.com/sales/', {
    jar: cookieJar,
    withCredentials: true
  }).then(() => {
    console.log(cookieJar)
  })
}

async function getPreSearchVariable () {
  await axios.get('https://www.linkedin.com/sales/search?keywords=&trk=lss-nav-typeahead&updateHistory=false&search=&EL=auto', {
    jar: cookieJar,
    withCredentials: true
  }).then((response) => {
    console.log(response.data)
  })
}

const PORT = process.env.PORT || 5000
app.listen(PORT)
