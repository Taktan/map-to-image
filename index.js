const express = require('express')
const app = express()
const port = 3000

app.use(express.json())
const osmsm = require('osm-static-maps');
const geometric = require('geometric')

const toRectangle = (point1,point2)=>{
  return [
    [
      point1,
      [point2[0],point1[1]],
      point2,
      [point1[0],point2[1]],
      point1,
    ]
  ]
}
// TODO обработать ошибки
// TODO ввести ключ

app.get('/', (req, res) => {
  res.send('Hello World!')
})
// [
//   -304.5506501197815,
//   57.33192473598261
// ],
app.get('/map', (req,res)=>{
  res.sendFile(__dirname + '/index.html')
})

app.post('/toRectangle', (req,res)=>{
  res.json(toRectangle(req.body.point1, req.body.point2))
})

app.post('/render', (req,res)=>{
  let coordinates = toRectangle(req.body.point1, req.body.point2);
  console.log(coordinates)
  console.log(geometric.polygonScale(coordinates.flat(1), 2))
  osmsm({
    attribution:'  ',
    zoom: 20,
    geojson: {
      "type": "FeatureCollection",
      "features": [
        // {
        //   "type": "Feature",
        //   "geometry": {
        //     "type": "Polygon",
        //     "coordinates": toRectangle(req.body.point1, req.body.point2)
        //   }
        // },2
        {
          "type": "Feature",
          "geometry": {
            "type": "Polygon",
            "coordinates": [geometric.polygonScale(toRectangle(req.body.point1, req.body.point2).flat(1), 0.5)]
          }
        },
        
      ]
    },
    style:{
      // "opacity": 0,
      // "fillOpacity": 0
    }
  }).then(image=>{
    res.contentType('image/png')
    res.send(image)
  }).catch(err=>{
    res.status(500).send("Сломалось")
    console.log("Получена ошибка")
    console.log(err)
  })
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})