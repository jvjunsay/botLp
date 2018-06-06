const express = require('express')
const bodyParser = require('body-parser')
const axios = require('axios').default
const axiosCookieJarSupport = require('axios-cookiejar-support').default
const _ = require('lodash')
const LinkedInAccount = require('./libs/linkedInAccount')
const LinkedInSalesNav = require('./libs/linkedInSalesNav')
const linkedin = new LinkedInAccount()
const linkedinSalesNav = new LinkedInSalesNav()

axiosCookieJarSupport(axios)

// const cookieJar = new tough.CookieJar()
const app = express()

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.get('/', (req, res) => {
  res.send({hello: 'there1'})
})

app.post('/searchByUrls', (req, res) => {
  linkedin.searchByUrls(req.body).then(s => {
    res.status(200).send(s)
  })
})

app.post('/search', (req, res) => {
  linkedin.searchByKeyWord(req.body).then(s => {
    res.status(200).send(s)
  })
})

app.post('/searchSalesNav', (req, res) => {
  linkedinSalesNav.searchkeyWord(req.body).then(s => {
    res.status(200).send(s)
  })
})

app.post('/searchSalesNavByURL', (req, res) => {
  linkedinSalesNav.searchByUrl(req.body).then(s => {
    res.status(200).send(s)
  })
})

app.post('/connectSalesNav', (req, res) => {
  linkedinSalesNav.connect(req.body).then(s => {
    res.status(200).send(s)
  })
})

app.post('/login', (req, res) => {
  linkedin.logIn(req.body).then((s) => {
    res.status(200).send(s)
  })
})

app.post('/loginSalesNav', (req, res) => {
  linkedinSalesNav.login(req.body).then(s => {
    res.status(200).send(s)
  })
})

app.get('/hit', (req, res) => {
  linkedin.getCookies().then(cookies => {
    let cookie = _.find(cookies, {name: 'JSESSIONID'})
    let csrfToken = cookie.value.toString()
    csrfToken = csrfToken.replace(/"/g, '')
    let cookieString = ''

    _.map(cookies, (c) => {
      cookieString += c.name + '=' + c.value + ';'
    })
    // console.log(cookieString)
    axios.get('https://linkedin.com/voyager/api/search/hits', {
      withCredentials: true,
      params: {
        keywords: 'IT Davao',
        start: 1,
        count: 20
      },
      headers: {
        'Content-Type': 'application/json',
        'Csrf-Token': csrfToken,
        Cookie: cookieString,
        Accept: 'application/vnd.linkedin.normalized+json',
        'X-Requested-With': 'XMLHttpRequest'
      }
    }).then((s) => {
      console.log(s)
    }, (err) => {
      console.log(err)
    })
  })
  // console.log(cookies)
})

// async function getCookies () {
//   await axios.get('https://www.linkedin.com/sales/', {
//     jar: cookieJar,
//     withCredentials: true
//   }).then(() => {
//     console.log(cookieJar)
//   })
// }

const PORT = process.env.PORT || 5000
app.listen(PORT)
