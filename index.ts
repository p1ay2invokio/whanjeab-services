import express from 'express'
import cors from 'cors'
import axios, { Axios, AxiosError } from 'axios'
import { prisma } from './appDataSource.ts'

const app = express()

app.use(cors())
app.use(express.json())


const updateRequest = async (api_key: string) => {

    if (api_key) {
        let userData = await prisma.key.findFirst({
            where: {
                key: api_key
            },
            include: {
                User: true
            }
        })

        if (userData?.User.request == null) {
            return "IDIOT"
        }

        await prisma.user.update({
            where: {
                id: userData?.user_id
            },
            data: {
                request: userData?.User.request + 1
            }
        })
    }else{
        console.log("PASS!")
    }
}

const pushNotify = async (api_key: string, channel_access: string, to: string, message: string) => {
    let test = await axios.post(`https://api.line.me/v2/bot/message/push`, {
        to: to,
        messages: [
            {
                type: 'text',
                text: message
            }
        ]
    }, {
        headers: {
            Authorization: `Bearer ${channel_access}`,
            "Content-Type": 'application/json'
        }
    }).then((res) => {
        updateRequest(api_key)
        return res.data
    }).catch((err: AxiosError) => {
        return err.response?.data
    })

    return test

}

app.post('/webhook', async (req, res) => {

    const events = req.body.events

    if (events[0].message.text == "-getid") {
        if (events[0].source.groupId) {
            pushNotify('', '/OnNiDtxqCLBupWvspkf8bbgRadK+r1T1M/2DZW2mlKOTcQHodKZPtL56KOI7O64nUaD82rdKYHUrkLJY/CcF3p+qAy+T71xltTZRA0JqtBvStp8OHaaLYeYATwA0xGjGpGBI8OkbwtXyQdoL6ASIAdB04t89/1O/w1cDnyilFU=', events[0].source.groupId, events[0].source.groupId)
        }
    }

    console.log(events)

    res.status(200).send()
})

app.post('/user', async (req, res) => {

    let { channel_access } = req.body

    let response = await axios.get("https://api.line.me/v2/bot/channel/webhook/endpoint", {
        headers: {
            Authorization: `Bearer ${channel_access}`,
            "Content-Type": 'application/json'
        }
    })

    console.log(response.data)

    res.status(200).send()

})

app.post('/push', async (req, res) => {

    // channel_access = bot line token

    let api_key: any = req.headers['x-api-key']

    if (!api_key) {
        return res.status(420).send({ message: 'api key is missing!', success: false })
    }

    console.log(api_key)

    let { channel_access, to, message } = req.body

    if (channel_access && to && message) {

        let exist_key = await prisma.key.findFirst({
            where: {
                key: api_key
            }
        })

        console.log(exist_key)

        if (exist_key) {
            let data_noti = await pushNotify(api_key, channel_access, to, message)
            if (data_noti == undefined) {
                return res.status(420).send({ message: 'LINE ERROR ' + data_noti.message, success: false })
            } else {
                return res.status(200).send({ message: data_noti.message, success: true })
            }
        } else {
            return res.status(420).send({ message: 'api key is valid!', success: false })
        }
    } else {
        return res.status(400).send({ message: 'provide is missing!', success: false })

    }
})

app.listen(3002, () => {
    console.log(`Server is running on port 3002`)
})