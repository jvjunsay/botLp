const express = require('express')
const bodyParser = require('body-parser')
const axios = require('axios').default
const axiosCookieJarSupport = require('axios-cookiejar-support').default

const LinkedInAccount = require('./libs/linkedInAccount')
const linkedin = new LinkedInAccount()

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

app.post('/login', (req, res) => {
  linkedin.logIn(req.body).then((s) => {
    res.status(200).send(s)
  })
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
