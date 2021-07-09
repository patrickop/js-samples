/*
 * Copyright 2019 Google LLC. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/* eslint-disable no-undef, @typescript-eslint/no-unused-vars, no-unused-vars */
import "./style.css";

// This example creates a 2-pixel-wide red polyline showing the path of
// the first trans-Pacific flight between Oakland, CA, and Brisbane,
// Australia which was made by Charles Kingsford Smith.


function print(v : google.maps.LatLng) :string{
    return "Lat,Lon: {" + v.lat().toFixed(6) + ", " + v.lng().toFixed(6) +"}";
}
function to_local(origin: google.maps.LatLng, v : google.maps.LatLng) :google.maps.Point{
    const rad = google.maps.geometry.spherical.computeDistanceBetween(origin,v)
    const heading = google.maps.geometry.spherical.computeHeading(origin,v)*2.0*Math.PI / 360.0
    const north = Math.cos(heading) * rad;
    const east = Math.sin(heading) * rad;
    return new google.maps.Point(north,east);
}
function print_local(origin: google.maps.LatLng, v : google.maps.LatLng) :string{
    const l = to_local(origin,v);
    return "North, east: { " + l.x.toFixed(2) + ", " + l.y.toFixed(2) +"}";
}
function to_global(origin: google.maps.LatLng, local: google.maps.Point) : google.maps.LatLng{
    const dir = Math.atan2(local.y,local.x)*180.0/Math.PI;
    const dist = Math.sqrt(Math.pow(local.x,2) + Math.pow(local.y,2)); 
    console.log(""+dir)
    return google.maps.geometry.spherical.computeOffset(origin,dist,dir);
}

function add_label(map:google.maps.Map,coords:google.maps.LatLng,text:string) {
const info = new google.maps.InfoWindow({
          position: coords,
          content : text
          
      })
      info.open({
          map:map
      })
      return info
}

function add_polyline(map,coords) {
  const line = new google.maps.Polyline({
    path: coords,
    geodesic: true,
    strokeColor: "#FF0000",
    strokeOpacity: 1.0,
    strokeWeight: 2,
    map:map
  });
  var id = 0;
  coords.forEach(element => {
      add_label(map,element,""+(id++))
  });
  
}
function add_polygon(map,coords) {
  const line = new google.maps.Polygon({
    paths: coords,
    geodesic: true,
    strokeColor: "#FF0000",
    strokeOpacity: 1.0,
    strokeWeight: 2,
    map:map
  });

  var id = 0;
  coords.forEach(element => {
      add_label(map,element,""+(id++))
  });

}

function add_local_polyline(map,origin,coords) {
  
  add_polyline(map,
     coords.map(l => to_global(origin,l))
     );
}
function add_local_polygon(map,origin,coords) {
  add_polygon(map,
     coords.map(l => to_global(origin,l))
     );
  
}

function draw_all(origin, local_polylines, local_polygons, global_polylines, global_polygons) {
    const map = new google.maps.Map(
    document.getElementById("map") as HTMLElement,
    {
      zoom: 17,
      center: origin,
      mapTypeId: "terrain",
    }
  );
  map.addListener("mousemove", (ev) => {
      var elemt = document.getElementById("info")
      if (elemt) {
          elemt.textContent = print(ev.latLng) + "\n" + print_local(origin,ev.latLng);
      }
  })
   map.addListener("click", (ev) => {
      add_label(map,ev.latLng,print(ev.latLng) + "<br>" + print_local(origin,ev.latLng))
  })
  add_label(map,origin,"Origin")
  local_polylines.forEach(lp => {
      add_local_polyline(map,origin,lp)
  });
  local_polygons.forEach(lp => {
      add_local_polygon(map,origin,lp)
  });
  global_polylines.forEach(lp => {
      add_polyline(map,lp)
  });
  global_polygons.forEach(lp => {
      add_polygon(map,lp)
  });
}

function parse_coord(s : string) : google.maps.LatLng {
    const sp = s.split(",")
    return new google.maps.LatLng({lng: parseFloat(sp[1]),  lat: parseFloat(sp[0])});
}
function parse_local_coord(s : string) : google.maps.Point {
    const sp = s.split(",")
    return new google.maps.Point(parseFloat(sp[1]), parseFloat(sp[0]));
}

function parse_local_coord_sets(s:string) {
    const lines = s.split("\n")
    var result: google.maps.Point[][] = [[]]
    lines.forEach(l => {
        console.log("line: " + l)
        if (l.length == 0) {
            result.push([])
        } else {
            result[result.length-1].push(parse_local_coord(l))
        }
    });

    return result
}

function parse_global_coord_sets(s:string) {
    const lines = s.split("\n")
    var result: google.maps.LatLng[][] = [[]]
    lines.forEach(l => {
        console.log("line: " + l)
        if (l.length == 0) {
            result.push([])
        } else {
            result[result.length-1].push(parse_coord(l))
        }
    });

    return result
}
function init(): void {
  
    let btn = document.getElementById("redraw")!;
    
        btn.addEventListener("click", (e:Event) => {

            let origin_raw = (document.getElementById("origin") as HTMLInputElement)!.value!;
            console.log(origin_raw)
            let origin = parse_coord(origin_raw);

            let local_polylines = parse_local_coord_sets((document.getElementById("local_polylines") as HTMLTextAreaElement).value!)
            let local_polygons = parse_local_coord_sets((document.getElementById("local_polygons") as HTMLTextAreaElement).value!)
            let global_polylines = parse_global_coord_sets((document.getElementById("global_polylines") as HTMLTextAreaElement).value!)
            let global_polygons = parse_global_coord_sets((document.getElementById("global_polygons") as HTMLTextAreaElement).value!)

            draw_all(origin,local_polylines, local_polygons, global_polylines, global_polygons)
        });
    

    
  
  
  

//   add_local_polygon(map,origin,
//     [
//         {x:-100,y:-100},
//         {x:100,y:-100},
//         {x:100,y:100},
//         {x:-100,y:100},
//     ]);




}
export { init };
