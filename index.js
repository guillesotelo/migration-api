const express = require('express')
const axios = require('axios')
const app = express()
const PORT = process.env.PORT || 5000
const URL = 'https://www.migrationsverket.se/English/Contact-us/Check-your-application-without-logging-in.html?sv.12.2e150b9f1743f689cbff0.route=/ansokningar&sv.target=12.2e150b9f1743f689cbff0&arendeNrTyp=KONTROLLNR&arendeNr='
const CN_GUILLE = '59641251'
const CN_DANY = '59641351'
const transporter = require('./mailer')

app.get('/', async (req, res) => {
    setTimeout(sendEmails(res), 43200000)
})

app.listen(PORT, () => {
    console.log(`App listening on PORT ${PORT}`)
})

const getApplicationStatus = async cn => {
    try {
        const res = await axios.get(URL + cn)
        if (!res || !res.data) return 'Error getting Application Data'
        return res.data
    } catch (err) { console.error(err) }
}

const sendEmails = async (res) => {
    const result_guille = await getApplicationStatus(CN_GUILLE)
    const result_dany = await getApplicationStatus(CN_DANY)
    const name_guille = 'Visa Guille: '
    const name_dany = 'Visa Dany: '
    let status_guille = name_guille + 'Error en la consulta'
    let status_dany = name_dany + 'Error en la consulta'

    if (result_guille.includes('BEHANDLAS')) status_guille = name_guille + 'Sin Respuesta 😐'
    else if (result_guille.includes('BESLUTAT')) status_guille = name_guille + 'Llegó la Visa!!! 🙀🙀🙀'
    if (result_dany.includes('BEHANDLAS')) status_dany = name_dany + 'Sin Respuesta 😐'
    else if (result_dany.includes('BESLUTAT')) status_dany = name_dany + 'Llegó la Visa!!! 🙀🙀🙀'

    res.send(status_guille + '<br>' + status_dany)

    await transporter.sendMail({
        from: `"Visa Status" <${process.env.EMAIL}>`,
        to: 'guille.sotelo.cloud@gmail.com',
        subject: 'Visa Status',
        html: '<h2>' + status_guille + '</h2>' + '<br>' + '<h2>' + status_dany + '</h2>'
    }).catch(() => res.status(400).json({ message: 'Something went wrong!' }))
}