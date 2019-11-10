!function(t,e){"object"==typeof exports&&"undefined"!=typeof module?e(exports,require("leaflet-pointable")):"function"==typeof define&&define.amd?define(["exports","leaflet-pointable"],e):e((t=t||self)["leaflet-kmz"]={})}(this,function(t){"use strict";L.KMZParser=L.Class.extend({initialize:function(t){L.setOptions(this,t),this.loaders=[]},load:function(t,e){this._loadAsyncJS(this._requiredJSModules()),this._waitAsyncJS(this._loadKMZ.bind(this,t,e))},get:function(t){return t<this.loaders.length&&this.loaders[t]},_loadKMZ:function(t,e){var i=new L.KMZLoader(L.extend({},this.options,e));i.parse(t),this.loaders.push(i)},_loadAsyncJS:function(t){if(!L.KMZParser._jsPromise&&t.length){var e=t.map(t=>this._loadJS(t));L.KMZParser._jsPromisePending=!0,L.KMZParser._jsPromise=Promise.all(e).then(function(){L.KMZParser._jsPromisePending=!1}.bind(this))}},_loadJS:function(t){return new Promise(function(e,i){var o=document.createElement("script");o.type="text/javascript",o.src=t,o.onload=e.bind(t),o.onerror=i.bind(t),document.head.appendChild(o)})},_requiredJSModules:function(){var t=[],e="https://unpkg.com/";return"function"!=typeof JSZip&&"function"!=typeof window.JSZip&&t.push(e+"jszip@3.1.5/dist/jszip.min.js"),"object"!=typeof toGeoJSON&&"object"!=typeof window.toGeoJSON&&t.push(e+"@tmcw/togeojson@3.0.1/dist/togeojsons.min.js"),"function"!=typeof geojsonvt&&"function"!=typeof window.geojsonvt&&t.push(e+"geojson-vt@3.0.0/geojson-vt.js"),t},_waitAsyncJS:function(t){L.KMZParser._jsPromise&&L.KMZParser._jsPromisePending?L.KMZParser._jsPromise.then(t):t.call()}});var e=L.KMZParser;L.KMZLoader=L.Class.extend({options:{renderer:L.canvas({padding:.5}),tiled:!0,interactive:!0,ballon:!0,bindPopup:!0,bindTooltip:!0,debug:0,keepFront:!0,emptyIcon:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAFElEQVR4XgXAAQ0AAABAMP1L30IDCPwC/o5WcS4AAAAASUVORK5CYII="},initialize:function(t){L.setOptions(this,t),this.renderer=this.options.renderer,this.tiled=this.options.tiled,this.interactive=this.options.interactive,this.pointable=this.tiled&&!this.interactive&&this.options.pointable,this.emptyIcon=this.options.emptyIcon,this.name=this.options.name,this.callback=t.onKMZLoaded},parse:function(t){this.name=this.name?this.name:t.split("/").pop(),this._load(t)},_load:function(t){this._getBinaryContent(t,function(e,i){null!=e?console.error(t,e,i):this._parse(i)}.bind(this))},_parse:function(t){return this._isZipped(t)?this._parseKMZ(t):this._parseKML(t)},_parseKMZ:function(t){var e=this;JSZip.loadAsync(t).then(t=>{Promise.all(e._mapZipFiles(t)).then(t=>{Promise.all(e._mapListFiles(t)).then(t=>{var i=this._decodeKMZFolder(t);e._parseKML(i)})})})},_parseKML:function(t){var e=this._decodeKMLString(t),i=this._toXML(e);this._kmlToLayer(i)},_decodeKMLString:function(t){return t instanceof ArrayBuffer?String.fromCharCode.apply(null,new Uint8Array(t)):t},_decodeKMZFolder:function(t){var e=this._listToObject(t),i=this._getKmlDoc(e),o=this._getImageFiles(Object.keys(e)),n=e[i];for(var r in o){var s=o[r],a=e[s];n=this._replaceAll(n,s,a)}return n},_toXML:function(t){return(new DOMParser).parseFromString(t,"text/xml")},_toGeoJSON:function(t){return(toGeoJSON||window.toGeoJSON).kml(t)},_keepFront:function(t){var e=function(t){this.bringToFront&&this.bringToFront()}.bind(t);t.on("add",function(t){this._map.on("baselayerchange",e)}),t.on("remove",function(t){this._map.off("baselayerchange",e)})},_kmlToLayer:function(t){var e=this._toGeoJSON(t);this.interactive&&(this.geojson=L.geoJson(e,{pointToLayer:this._pointToLayer.bind(this),onEachFeature:this._onEachFeature.bind(this),renderer:this.renderer}),this.layer=this.geojson),this.tiled&&(this.gridlayer=L.gridLayer.geoJson(e,{pointable:this.pointable,ballon:this.options.ballon,bindPopup:this.options.bindPopup,bindTooltip:this.options.bindTooltip}),this.layer=this.interactive?L.featureGroup([this.gridlayer,this.geojson]):this.gridlayer),this.layer&&this._onKMZLoaded(this.layer,this.name)},_pointToLayer:function(t,e){return new L.KMZMarker(e,{renderer:this.renderer})},_onEachFeature:function(t,e){switch(t.geometry.type){case"Point":this._setLayerPointIcon(t,e);break;case"LineString":case"Polygon":case"GeometryCollection":this._setLayerStyle(t,e);break;default:console.warn("Unsupported feature type: "+t.geometry.type,t)}this._setLayerBalloon(t,e)},_onKMZLoaded:function(t,e){this.options.debug&&console.log(t,e),this.options.keepFront&&this._keepFront(t),this.callback&&this.callback(t,e)},_setLayerPointIcon:function(t,e){e.setIconUrl(this.tiled?this.emptyIcon:t.properties.icon)},_setLayerStyle:function(t,e){var i={weight:1,opacity:0,fillOpacity:0};this.tiled||(t.properties["stroke-width"]&&(i.weight=1.05*t.properties["stroke-width"]),t.properties["stroke-opacity"]&&(i.opacity=t.properties["stroke-opacity"]),t.properties["fill-opacity"]&&(i.fillOpacity=t.properties["fill-opacity"]),t.properties.stroke&&(i.color=t.properties.stroke),t.properties.fill&&(i.fillColor=t.properties.fill)),e.setStyle(i)},_setLayerBalloon:function(t,e){if(this.options.ballon){var i=t.properties.name?t.properties.name:"",o=t.properties.description?t.properties.description:"";(i||o)&&(this.options.bindPopup&&e.bindPopup("<div><b>"+i+"</b><br>"+o+"</div>"),this.options.bindTooltip&&e.bindTooltip("<b>"+i+"</b>",{direction:"auto",sticky:!0}))}},_escapeRegExp:function(t){return t.replace(/([.*+?^=!:${}()|\[\]\/\\])/g,"\\$1")},_replaceAll:function(t,e,i){return t.replace(new RegExp(this._escapeRegExp(e),"g"),i)},_mapZipFiles:function(t){return Object.keys(t.files).map(e=>t.files[e]).map(t=>t.async("blob").then(e=>[t.name,e]))},_mapListFiles:function(t){return t.map(t=>Promise.resolve().then(()=>this._readFile(t)))},_listToObject:function(t){return t.reduce(function(t,e){return t[e[0]]=e[1],t},{})},_getFileExt:function(t){return t.split(".").pop().toLowerCase().replace("jpg","jpeg")},_getMimeType:function(t,e){var i="text/plain";return/\.(jpe?g|png|gif|bmp)$/i.test(t)?i="image/"+e:/\.kml$/i.test(t)&&(i="text/plain"),i},_getKmlDoc:function(t){return t["doc.kml"]?"doc.kml":this._getKmlFiles(Object.keys(t))[0]},_getKmlFiles:function(t){return t.filter(t=>/.*\.kml/.test(t))},_getImageFiles:function(t){return t.filter(t=>/\.(jpe?g|png|gif|bmp)$/i.test(t))},_isZipped:function(t){var e=new Uint8Array(t,0,1),i=new Uint8Array(t,1,1);return"PK"===String.fromCharCode(e,i)},_readFile:function(t){var e=t[0],i=t[1],o=this._getFileExt(e),n=this._getMimeType(e,o);return this._fileReader(i,n,e)},_fileReader:function(t,e,i){return new Promise((o,n)=>{var r=new FileReader;r.onload=()=>{var t=r.result;if(-1===e.indexOf("text")){var n=r.result.split(",")[1];t="data:"+e+";base64,"+n}return o([i,t])},-1===e.indexOf("text")?r.readAsDataURL(t):r.readAsText(t)})},_getBinaryContent:function(t,e){try{var i=new window.XMLHttpRequest;i.open("GET",t,!0),i.setRequestHeader("X-Requested-With","XMLHttpRequest"),i.responseType="arraybuffer",i.onreadystatechange=function(o){var n,r;if(4===i.readyState)if(200===i.status||0===i.status){n=null,r=null;try{n=i.response||i.responseText}catch(t){r=new Error(t)}e(r,n)}else e(new Error("Ajax error for "+t+" : "+this.status+" "+this.statusText),null)},i.send()}catch(t){e(new Error(t),null)}},_blobToString:function(t){var e,i;return e=URL.createObjectURL(t),(i=new XMLHttpRequest).open("GET",e,!1),i.send(),URL.revokeObjectURL(e),i.responseText},_blobToBase64:function(t,e){var i=new FileReader;i.onload=function(){var t=i.result.split(",")[1];e(t)},i.readAsDataURL(t)}});var i=L.KMZLoader;L.KMZMarker=L.CircleMarker.extend({setIconUrl:function(t){this._iconUrl=void 0!==t?t:this._iconUrl},_updatePath:function(){var t=this._renderer,e=this;if(this._iconUrl&&t._drawing&&!e._empty()){var i=e._point,o=t._ctx,n=new Image;n.onload=function(){o.drawImage(n,i.x-14,i.y-14,28,28),t._drawnLayers[e._leaflet_id]=e},n.src=this._iconUrl}}});var o=L.KMZMarker;L.GridLayer.GeoJSON=L.GridLayer.extend({options:{pointable:!1,ballon:!1,bindPopup:!1,bindTooltip:!1,async:!1,maxZoom:24,tolerance:3,debug:0,extent:4096,buffer:256,icon:{width:28,height:28},styles:{strokeWidth:1,strokeColor:"#f00",strokeOpacity:1,fillColor:"#000",fillOpacity:.25}},initialize:function(t,e){L.setOptions(this,e),L.GridLayer.prototype.initialize.call(this,e),this.tileIndex=(geojsonvt||window.geojsonvt)(t,this.options),this.geojson=t},onAdd:function(t){L.GridLayer.prototype.onAdd.call(this,t),this.options.ballon&&(this.options.bindPopup&&this._map.on("click",this.updateBalloon,this),this.options.bindTooltip&&this._map.on("mousemove",this.updateBalloon,this))},createTile:function(t){var e=L.DomUtil.create("canvas","leaflet-tile"),i=this.getTileSize();e.width=i.x,e.height=i.y;for(var o=e.getContext("2d"),n=this.tileIndex.getTile(t.z,t.x,t.y),r=n?n.features:[],s=0;s<r.length;s++)this._drawFeature(o,r[s]);return e},_drawFeature:function(t,e){t.beginPath(),this._setStyle(t,e),1===e.type?this._drawIcon(t,e):2===e.type?this._drawLine(t,e):3===e.type?this._drawPolygon(t,e):console.warn("Unsupported feature type: "+e.geometry.type,e),t.stroke()},_drawIcon:function(t,e){var i=new Image,o=e.geometry[0],n=this.options.icon.width,r=this.options.icon.height;i.onload=function(){t.drawImage(i,o[0]/16-n/2,o[1]/16-r/2,n,r)},i.src=e.tags.icon?e.tags.icon:null},_drawLine:function(t,e){for(var i=0;i<e.geometry.length;i++)for(var o=e.geometry[i],n=0;n<o.length;n++){var r=o[n];n?t.lineTo(r[0]/16,r[1]/16):t.moveTo(r[0]/16,r[1]/16)}},_drawPolygon:function(t,e){this._drawLine(t,e),t.fill("evenodd")},_setStyle:function(t,e){var i={};1===e.type?i=this._setPointStyle(e,i):2===e.type?i=this._setLineStyle(e,i):3===e.type&&(i=this._setPolygonStyle(e,i)),t.lineWidth=i.stroke?this._setWeight(i.weight):0,t.strokeStyle=i.stroke?this._setOpacity(i.stroke,i.opacity):{},t.fillStyle=i.fill?this._setOpacity(i.fill,i.fillOpacity):{}},_setPointStyle:function(t,e){return e},_setLineStyle:function(t,e){return e.weight=1.05*(t.tags["stroke-width"]?t.tags["stroke-width"]:this.options.styles.strokeWidth),e.opacity=t.tags["stroke-opacity"]?t.tags["stroke-opacity"]:this.options.styles.strokeOpacity,e.stroke=t.tags.stroke?t.tags.stroke:this.options.styles.strokeColor,e},_setPolygonStyle:function(t,e){return(e=this._setLineStyle(t,e)).fill=t.tags.fill?t.tags.fill:this.options.styles.fillColor,e.fillOpacity=t.tags["fill-opacity"]?t.tags["fill-opacity"]:this.options.styles.fillOpacity,e},_setWeight:function(t){return t||5},_setOpacity:function(t,e){if(t=t||"#f00",e&&this._iscolorHex(t)){var i=this._colorRgb(t);return"rgba("+i[0]+","+i[1]+","+i[2]+","+e+")"}return t},_iscolorHex:function(t){return/^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/.test(t.toLowerCase())},_colorRgb:function(t){var e=t.toLowerCase();if(4===e.length){for(var i="#",o=1;o<4;o+=1)i+=e.slice(o,o+1).concat(e.slice(o,o+1));e=i}for(var n=[],r=1;r<7;r+=2)n.push(parseInt("0x"+e.slice(r,r+2)));return n},_pointInPolygon:function(t,e){for(var i=t[0],o=t[1],n=!1,r=0,s=e.length-1;r<e.length;s=r++){var a=e[r][0],l=e[r][1],p=e[s][0],c=e[s][1];l>o!=c>o&&i<(p-a)*(o-l)/(c-l)+a&&(n=!n)}return n},_getLatLngsPoly:function(t,e){for(var i=[],o=t.geometry||t,n="Polygon"==o.type?o.coordinates[0]:o.coordinates,r=e||0;r<n.length;r++)i[e++]=[n[r][0],n[r][1]];return!!i.length&&i},_getLatLngsPoint:function(t,e){var i=[],o=(t.geometry||t).coordinates;return i[e||0]=[o[0],o[1]],!!i.length&&i},_getLatLngs:function(t,e){var i,o=[];e=e||0;var n=t.geometry||t,r=n.type;if("Point"==r)(i=this._getLatLngsPoint(t,e))&&Array.prototype.push.apply(o,i);else if("LineString"==r||"Polygon"==r)(i=this._getLatLngsPoly(t,e))&&Array.prototype.push.apply(o,i);else if("GeometryCollection"==r)for(var s=n.geometries,a=0;a<s.length;a++)(i=this._getLatLngs(s[a],e))&&Array.prototype.push.apply(o,i);else console.warn("Unsupported feature type: "+r);return!!o.length&&o},pointInLayer:function(t,e,i){t instanceof L.LatLng&&(t=[t.lng,t.lat]);var o=[];i=i||!0;for(var n=(e=e||this.geojson).features,r=0;r<n.length&&(!i||!o.length);r++){var s=this._getLatLngs(n[r]);s&&this._pointInPolygon(t,s)&&o.push(n[r])}return!!o.length&&o},updateBalloon:function(t){if(this._map&&this.options.pointable&&this._map.isPointablePixel()&&this.isPointablePixel()){this._popup=this._popup||new L.Popup;var e=this.pointInLayer(t.latlng,this.geojson);if(e){var i=e[0].properties.name||"";i&&(this._popup.setLatLng(t.latlng),this._popup.setContent("<b>"+i+"</b>"),this._popup.openOn(this._map))}else this._map.closePopup(this._popup)}}}),L.gridLayer.geoJson=function(t,e){return new L.GridLayer.GeoJSON(t,e)};var n={GeoJSON:L.GridLayer.GeoJSON},r={geoJSON:L.gridLayer.geoJson};t.GridLayer=n,t.KMZLoader=i,t.KMZMarker=o,t.KMZParser=e,t.gridLayer=r,Object.defineProperty(t,"__esModule",{value:!0})});
//# sourceMappingURL=leaflet-kmz.js.map
