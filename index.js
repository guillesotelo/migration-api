const express = require('express')
const axios = require('axios')
const app = express()
const PORT = process.env.PORT || 3100
const URL = 'https://www.migrationsverket.se/English/Contact-us/Check-your-application-without-logging-in.html?sv.12.2e150b9f1743f689cbff0.route=/ansokningar&sv.target=12.2e150b9f1743f689cbff0&arendeNrTyp=KONTROLLNR&arendeNr='
const CN_GUILLE = '59641251'
const CN_DANY = '59641351'
const transporter = require('./mailer')

app.get('/', async (req, res) => {
    const html = await sendEmails()
    res.send(html)
})

app.get('/all', async (req, res) => {
    const html = await getLastApplications()
    res.send(html)
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

const sendEmails = async () => {
    const result_guille = await getApplicationStatus(CN_GUILLE)
    const result_dany = await getApplicationStatus(CN_DANY)
    const name_guille = 'Visa Guille: '
    const name_dany = 'Visa Dany: '
    let status_guille = name_guille + 'Error en la consulta'
    let status_dany = name_dany + 'Error en la consulta'

    if (result_guille.includes('BEHANDLAS')) status_guille = name_guille + 'SIN RESPUESTA 😐'
    else if (result_guille.includes('BESLUTAT')) status_guille = name_guille + 'Llegó la Visa!!! 🙀🙀🙀'
    if (result_dany.includes('BEHANDLAS')) status_dany = name_dany + 'SIN RESPUESTA 😐'
    else if (result_dany.includes('BESLUTAT')) status_dany = name_dany + 'LLEGÓ LA VISA!!! 🙀🙀🙀 🎉🎉🎉'

    await transporter.sendMail({
        from: `"Visa Status" <${process.env.EMAIL}>`,
        to: 'guille.sotelo.cloud@gmail.com',
        subject: 'Visa Status',
        html: '<h2>' + status_guille + '</h2>' + '<h2>' + status_dany + '</h2>'
    }).catch((err) => console.error('Something went wrong!', err))

    return status_guille + '<br>' + status_dany
}

const getLastApplications = async () => {
    try {
        let html = '<div style="margin: 3vw">'
        for(let i=59641151; i<59641251 ; i++) {
            const res = await axios.get(URL + i)

            if (!res || !res.data) return 'Error getting Application Data'

            const text = res.data
            const registered = text.indexOf('registreringsdatum')
            const index = text.indexOf('beslutdatum')
            
            if(registered === -1) {
                html += `<h4>Numero de control ${i} --- NO VALIDO</h4>`
            }
            else if(index !== -1) {
                const date = text.substring(index + 14, index + 14 + 10)
                html += `<h4>Numero de control ${i} --- Otorgamiento: ${date}</h4>`
            } else {
                html += `<h4>Numero de control ${i} --- Otorgamiento: EN ESPERA</h4>`
            }
        }
        html += '</div>'

        return html
    } catch (err) { console.error(err) }
}