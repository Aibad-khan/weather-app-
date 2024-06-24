const express = require('express');
const app = express();
const path = require('path');
const cheerio = require('cheerio');
const axios = require('axios');
const fs = require('fs');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//let filepath;

// Synchronously read the file content
const filePath = path.join(__dirname, 'public', 'index.htm');
try {
  filepath = fs.readFileSync(filePath, 'utf8');
} catch (err) {
  console.error('Error reading file:', err);
}
//date

const months=['Jan','Feb','March','April','May','June','July','Aug','Sept','Oct','Nov','Dec'];
const week=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const date=new Date();
const dayno=date.getDate();
const month=date.getMonth();
const weekno=date.getDay();
let time="AM"
let hour=date.getHours();
if(hour>12) time="PM"
hour=hour>12?hour-12:hour;

const minute=date.getMinutes();

// console.log(dayno);
// console.log(months[month]);
// console.log(week[weekno]);
// console.log(hour);
// console.log(minute);

const read = (data,loc ) => {

  const $ = cheerio.load(filepath);

  $('#loc').text(loc)
  $('#count').text(data.sys.country)
  // $('#temp').text(data.main.temp).css('text-align','center');

  $('#date').each((index,element)=>{
    $(element).text(`${week[weekno]} | ${months[month]} ${dayno} | ${hour}:${minute}${time}`);

  });
  $('.temp').each((index, element) => {
    const temp = data.main.temp;

    // Update the text content with desired values
    $(element).text(`${temp}°C`);
});

$('#desc').each((index,element)=>{
  $(element).text(`forecast:${data.weather[0].main}`);

});

  $('.tempmin_max').each((index, element) => {
    const tempMin = data.main.temp_min;
    const tempMax = data.main.temp_max;

    // Update the text content with desired values
    $(element).text(`Min ${tempMin}°C | Max ${tempMax}°C `);
});

  return $.html();
};

app.get('/', (req, res) => {
  res.sendFile(filePath);
});

app.post('/submit', async (req, res) => {
  let loc = req.body.name;
  
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${loc}&appid=e2dbf5eaa2478c89285d4f78afdc2b49&units=metric`;

  try {
    const response = await axios.get(url);

    if (response.status === 404) {
      return res.send('city not found');
    }

    const data = response.data;
    console.log(response.data);
    console.log(response.data.weather[0].main);

    const updated = read(data,loc);
    res.send(updated);
  } catch (error) {
    console.error('There was an error making the GET request:', error);
    res.status(500).send(`<h1>location not found</h1>`);
  }
});

app.use((req,res)=>{
  res.status(404).send('<h1>Page not found</h1>')
})

app.listen(12000, () => {
  console.log('Server is running on port 12000');
});












