const TelegramBot = require('node-telegram-bot-api');
const fetch = require('node-fetch');

const bot = new TelegramBot(TOKEN, { polling: true });

async function getWeather(city) {
    const url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${APIKEYW}&units=metric`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error al obtener el tiempo:', error);
        return null;
    }
}

async function getDogGif() {
    const url = `https://api.giphy.com/v1/gifs/random?api_key=${APIKEYGIF}&tag=dog`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        return data.data.images.original.url;

    } catch (error) {
        console.error('Error al obtener el gif del perro', error);
        return null;
    }
}

bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const options = {
        reply_markup: {
            keyboard: [
                [{ text: 'Tiempo ☀️' }, { text: 'Memes 🐕' }],
                [{ text: 'Trabajando en mejores opciones...' }]
            ]
        }
    };
    bot.sendMessage(chatId, '¡Hola! Soy tu bot de Telegram. ¿En qué puedo ayudarte hoy?', options);
});

bot.onText(/Trabajando en mejores opciones.../, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Estamos trabajando en ello. ¡Gracias por tu paciencia!');
});

let awaitingWeatherCity = {};

bot.onText(/Tiempo/, (msg) => {
    const chatId = msg.chat.id;
    awaitingWeatherCity[chatId] = true;
    bot.sendMessage(chatId, 'Por favor, dime de qué ciudad quieres ver el tiempo.');
});

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const messageText = msg.text;

    if (awaitingWeatherCity[chatId]) {
        const city = messageText;
        const weatherData = await getWeather(city);
        if (weatherData && weatherData.main) {
            const temperature = weatherData.main.temp;
            bot.sendMessage(chatId, `La temperatura en ${city} es de ${temperature}°C.`);
        } else {
            bot.sendMessage(chatId, 'Lo siento, no pude obtener la información del tiempo para esa ciudad.');
        }
        awaitingWeatherCity[chatId] = false;
    } else if (messageText === 'Memes 🐕') {
        const dogGifUrl = await getDogGif();
        
        if (dogGifUrl) {
            bot.sendAnimation(chatId, dogGifUrl);
        } else {
            bot.sendMessage(chatId, 'Lo siento, no pude obtener un gif de perro.');
        }
    }
});



bot.on('polling_error', (error) => {
    console.error('Error en el polling:', error);
});
module.exports = bot;