var dominio = "http://arcgis.simec.gov.co:6080"; //Dominio del arcgis server  http://localhost:6080


//Servicio de Edicion de Arcgis
var urlHostSUEdit = "/arcgis/rest/services/APP_SUBESTACIONES/UPME_EN_DI_SUBESTACION_edicion/";
//Servicio de Consulta de Arcgis
var urlHostSUCons = "/arcgis/rest/services/APP_SUBESTACIONES/UPME_EN_DI_SUBESTACION_consulta/";
//Servicio de Divicion politica de Arcgis
var urlHostDP = "/arcgis/rest/services/UPME_BC/UPME_BC_Sitios_UPME_Division_Politica/";
var notaAclaratoria = 'La UPME se permite disponer esta herramienta para la recolección de la información correspondiente a la ubicación geográfica de las subestaciones.Esta herramienta es una ayuda para que los operadores reporten información, produciéndose una capa propia de la UPME quien validará con otras fuentes la ubicación espacial de las localidades, para conseguir mayor calidad en la información para el Planeamiento de la Expansión de Cobertura de Energía Eléctrica.';


var buffetCP = 300;
var id_user = idUsuario;
var id_user_validacion = idUsuario;
var UsrOrgJson = "";
console.log(idUsuario);


var pagina = document.URL.split("/");
var prefijo = pagina[0] + '/' + pagina[1] + '/' + pagina[2] + '/' + pagina[3] + '/';


if (idUsuario != "") {
    $.getJSON("../../SubEstaciones/Home/UsrOrgJson?idusuario=" + idUsuario, function (data) {
        UsrOrgJson = data;
        $("#tituloOrganizacion").empty().append(UsrOrgJson[0].organizacion);
    });
} else {
    location.href = prefijo;
}



var geojsonMarkerSinAprobar = { icon: L.AwesomeMarkers.icon({ icon: 'home', prefix: 'fa', markerColor: 'orange' }), riseOnHover: true };
var geojsonMarkerSubEstacion = { icon: L.AwesomeMarkers.icon({ icon: 'bolt', prefix: 'fa', markerColor: 'cadetblue' }), riseOnHover: true };
var geojsonMarkerSubEstacionEdit = { icon: L.AwesomeMarkers.icon({ icon: 'bolt', prefix: 'fa', markerColor: 'orange' }), riseOnHover: true };

var arrayclases = [], arrayTension = [];
waitingDialog.show();


/***********************************
 // CONFIGURACION DE MAPA
 ***********************************/
var southWest = L.latLng(-15, -90),
    northEast = L.latLng(30, -60),
    bounds = L.latLngBounds(southWest, northEast);

var map = L.map('map', {
    center: [4.12521648, -74.5020],
    zoom: 5,
    minZoom: 5,
    maxBounds: bounds,
    zoomControl: false
});

new L.Control.Zoom({ position: 'topright' }).addTo(map);

/*********************************
//CONFIGURACION DE FORMATO
**********************************/
var legend = L.control({ position: 'bottomright' });



legend.onAdd = function (map) {
    var div = L.DomUtil.create('div', 'info legend');
    if (pagina.length > 5) {
        div.innerHTML += '<i ><img src="' + prefijo + 'images/leyend/SinAprobar.png" height="20px"></i> SubEstacion No Oficial<br>';
        div.innerHTML += '<i ><img src="' + prefijo + 'images/leyend/Creacion.png" height="20px"></i> SubEstacion En Creación<br>';
    }
    div.innerHTML += '<i ><img src="' + prefijo + 'images/leyend/Upme.png"  height="20px"></i>SubEstacion<br>';
    div.innerHTML += '<i ><img src="' + prefijo + 'images/leyend/Cluster.png" height="18px"></i> Agrupaciones<br>';
    div.innerHTML += '<i ><img src="' + prefijo + 'images/leyend/municipio.png"  height="17px"></i>Municipio<br>';
    div.innerHTML += '<i ><img src="' + prefijo + 'images/leyend/municipioSelecionado.png"  height="17px"></i>Municipio Seleccionado<br>';
    return div;
};

legend.addTo(map);



/*********************************
//CAPAS BASE 
**********************************/

// Activacion de carousel
$('.carousel').carousel({
    interval: 7000
});


var OpenMapSurfer_Roads = L.tileLayer('http://otile{s}.mqcdn.com/tiles/1.0.0/{type}/{z}/{x}/{y}.{ext}', {
    type: 'map',
    ext: 'jpg',
    attribution: 'Tiles Courtesy of <a href="http://www.mapquest.com/">MapQuest</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    subdomains: '1234'
});

var LyrBase = L.esri.basemapLayer('Imagery').addTo(map);
var LyrLabels = L.esri.basemapLayer('ImageryLabels').addTo(map);

function setBasemap(basemap) {
    if (map.hasLayer(LyrBase)) {
        map.removeLayer(LyrBase);
    }
    if (basemap == "OSM") {
        LyrBase = OpenMapSurfer_Roads;
    }
    else {
        LyrBase = L.esri.basemapLayer(basemap);
    }
    map.addLayer(LyrBase);
    if (map.hasLayer(LyrLabels)) {
        map.removeLayer(LyrLabels);
    }

    if (basemap === 'ShadedRelief' || basemap === 'Oceans' || basemap === 'Gray' || basemap === 'DarkGray' || basemap === 'Imagery' || basemap === 'Terrain') {
        LyrLabels = L.esri.basemapLayer(basemap + 'Labels');
        map.addLayer(LyrLabels);
    }
};

$("#BaseESRIStreets, #BaseESRISatellite, #BaseESRITopo, #BaseOSM").click(function () {
    setBasemap($(this).attr('value'));
});

$(".esri-leaflet-logo").hide();
$(".leaflet-control-attribution").hide();

var osm2 = L.tileLayer('http://otile{s}.mqcdn.com/tiles/1.0.0/{type}/{z}/{x}/{y}.{ext}', {
    type: 'map',
    ext: 'jpg',
    attribution: 'Tiles Courtesy of <a href="http://www.mapquest.com/">MapQuest</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    subdomains: '1234'
});

/*var miniMap = new L.Control.MiniMap(osm2, { toggleDisplay: true, width: 190, height: 90, zoomLevelOffset: -6 });

miniMap._minimized;
miniMap.addTo(map);*/

var promptIcon = ['glyphicon-fullscreen'];
var hoverText = ['Extensión Total'];
var functions = [function () {
    map.setView([4.12521648, -74.5020], 5);
}];


$(function () {
    for (i = 0; i < promptIcon.length ; i++) {
        var funk = 'L.easyButton(\'' + promptIcon[i] + '\', <br/>              ' + functions[i] + ',<br/>             \'' + hoverText[i] + '\'<br/>            )'
        $('#para' + i).append('<pre>' + funk + '</pre>')
        explaination = $('<p>').attr({ 'style': 'text-align:right;' }).append('This created the <i class="' + promptIcon[i] + (promptIcon[i].lastIndexOf('fa', 0) === 0 ? ' fa fa-lg' : ' glyphicon') + '"></i> button.')
        $('#para' + i).append(explaination)
        L.easyButton(promptIcon[i], functions[i], hoverText[i])
    } (i);
});
var MapLayerLimitesDane = L.esri.dynamicMapLayer({
    url: dominio + urlHostDP + 'MapServer',
    layers: [2, 3]
}).addTo(map);

MapLayerLimitesDane.on('load', function (e) {
    MapLayerLimitesDane.bringToBack();
});

/*****************************************************
******Opciones Formulario De SubEstaciones
*****************************************************/
jQuery.fn.exists = function () { return this.length > 0; }

var query_tension = L.esri.Tasks.query({
    url: dominio + urlHostSUCons + 'MapServer/1'
});
var json_tension;
query_tension.where("1=1").returnGeometry(false).run(function (error, featureCollection) {
    json_tension = featureCollection;
    $.each(featureCollection.features, function (index, value) {
        arrayTension[value.properties.ID_TENSION] = value.properties.DESCRIPCION;
    });
});

var query_nivel_tension = L.esri.Tasks.query({
    url: dominio + urlHostSUCons + 'MapServer/2'
});
var json_nivel_tension;
query_nivel_tension.where("1=1").returnGeometry(false).run(function (error, featureCollection) {
    json_nivel_tension = featureCollection;
    if ($("#SectNivelTesion").exists()) {
        iniNivelTension("");
    }
    if ($("#ActSectNivelTesion").exists()) {
        iniNivelTension("Act");
    }
    if ($("#EditSectNivelTesion").exists()) {
        iniNivelTension("Edit");
    }
});
function iniNivelTension(prevalue) {
    $('#' + prevalue + 'SectNivelTesion').empty();
    $('#' + prevalue + 'SectNivelTesion').append('<option value=""></option>');
    $.each(json_nivel_tension.features, function (index, value) {
        $('#' + prevalue + 'SectNivelTesion').append('<option value="' + value.properties.ID_NIVEL_TENSION + '">' + value.properties.ID_NIVEL_TENSION + '</option>');
    });
}


var query_estado = L.esri.Tasks.query({
    url: dominio + urlHostSUCons + 'MapServer/3'
});
var json_estado;
query_estado.where("1=1").returnGeometry(false).run(function (error, featureCollection) {
    json_estado = featureCollection;

    if ($("#SectEstado").exists()) {
        iniEstado("");
    }
    if ($("#ActSectEstado").exists()) {
        iniEstado("Act");
    }
    if ($("#EditSectEstado").exists()) {
        iniEstado("Edit");
    }
});
function iniEstado(prevalue) {
    $('#' + prevalue + 'SectEstado').empty();
    $('#' + prevalue + 'SectEstado').append('<option value=""></option>');
    $.each(json_estado.features, function (index, value) {
        $('#' + prevalue + 'SectEstado').append('<option value="' + value.properties.ID_ESTADO_SUB + '">' + value.properties.NOM_ESTADO_SUB + '</option>');
    });
}





/*********************************
//FUNCIONES
**********************************/


function clickmap(id, lyrname) {
    //console.log(LyrSubEstacion);
    if (lyrname == "LyrSubEstacion") {
        LyrSubEstacion.eachLayer(function (marker) {
            if (marker.feature.id == id) {
                marker.openPopup();
                map.panTo(marker.getLatLng());
            }
        });
    } else if (lyrname == "lyrSubEstacionsT") {
        lyrSubEstacionsT.eachLayer(function (marker) {
            if (marker.feature.id == id) {
                marker.openPopup();
                map.panTo(marker.getLatLng());
            }
        });
    } else if (lyrname == "lyrTotalSubEstaciones") {
        lyrTotalSubEstaciones.eachLayer(function (marker) {
            if (marker.feature.id == id) {

                map.setView(marker.getLatLng(), 14);
                //map.panTo(marker.getLatLng());
                marker.openPopup();
            }
        });
    } else if (lyrname == "lyrSubEstacionApro") {
        lyrSubEstacionsApro.eachLayer(function (marker) {
            if (marker.feature.id == id) {
                $("#panel_actualizar").hide(100);
                map.setView(marker.getLatLng(), 14);
                //map.panTo(marker.getLatLng());
                marker.openPopup();
            }
        });
    } else if (lyrname == "BuscarTotal") {
        lyrTotalSubEstaciones.eachLayer(function (marker) {
            if (marker.feature.properties.ID_SUBESTACION == id) {
                $("#panel_actualizar").hide(100);
                map.setView(marker.getLatLng(), 14);
                //map.panTo(marker.getLatLng());
                marker.openPopup();
            }
        });
    }

}
function zoomCP(x, y) {
    var latLng = L.latLng(y, x);
    map.setView(latLng, 14);
}
var mousemove = document.getElementById('mousemove');

map.on('mousemove', function (e) {
    window[e.type].innerHTML = 'Long:' + e.latlng.lng.toFixed(6) + '   Lat:' + e.latlng.lat.toFixed(6);
});

/****************************************
* Contenido del pop up
*/
function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}
function ContPopUP(feature, latlng, botones) {
    // console.log(feature.properties)
    var NIVEL_TENSION = (feature.properties.ID_NIVEL_TENSION == "Null") ? '-' : feature.properties.ID_NIVEL_TENSION;
    var TENSION = (feature.properties.ID_TENSION_SUB == "Null") ? 0 : (feature.properties.ID_TENSION_SUB.length > 2) ? feature.properties.ID_TENSION_SUB : arrayTension[feature.properties.ID_TENSION_SUB];
    var PORCENTAJE_CARGA = (isNumeric(feature.properties.PORCENTAJE_CARGA)) ? Number(feature.properties.PORCENTAJE_CARGA).toFixed(2) : Number(feature.properties.PORCENTAJE_CARGA.replace(",", ".")).toFixed(2);
    var CAPACIDAD_MVA = (isNumeric(feature.properties.CAPACIDAD_MVA)) ? Number(feature.properties.CAPACIDAD_MVA).toFixed(2) : Number(feature.properties.CAPACIDAD_MVA.replace(",", ".")).toFixed(2);
    var ID_ESTADO_SUB = (feature.properties.ID_ESTADO_SUB == "1") ? "En servicio" : (feature.properties.ID_ESTADO_SUB == "2") ? "Fuera de Servicio" : (feature.properties.ID_ESTADO_SUB == "3") ? "Futura" : 0;
    var AMPLIACION = (feature.properties.AMPLIACION == "Null") ? 0 : (feature.properties.AMPLIACION == "0") ? "NO" : (feature.properties.AMPLIACION == "1") ? "SI" : 0;
    var FECHA_CORTE_UPME = (feature.properties.FECHA_CORTE_UPME == "Null") ? "" : '<br><small>Fecha Corte Upme:</small> ' + feature.properties.FECHA_CORTE_UPME + ' ';
    var OBSERVACION = (feature.properties.OBSERVACION == "Null" || feature.properties.OBSERVACION == null) ? "" : '<br><small>Observación:</small> ' + feature.properties.OBSERVACION + ' ';

    htmlpopup =
    '<div class="panel panel-primary">' +
        '<div class="panel-heading">Subestación</div>' +
            '<div class="popupstyle">' +
                '<button class="btn btn-primary pull-right btn-xs " data-toggle="tooltip" data-placement="left" title="Acercar" type="button" type="button" onclick="zoomCP(\'' + latlng.lng + '\',\'' + latlng.lat + '\')">' +
                    '<span class="glyphicon glyphicon-zoom-in" aria-hidden="true"></span>' +
                '</button>' +
                '<h5><strong  class="primary-font">' + feature.properties.NOM_SUBESTACION + '</strong><br>' +
                '<small>Estado:</small> ' + ID_ESTADO_SUB + '<br>' +
                '<small>Fecha Entrada En Operación:</small> ' + feature.properties.FECHA_OPERACION + ' <br>' +
                '<small>Nivel Tensión:</small> ' + NIVEL_TENSION + '<br>' +
                '<small>Relación de trasformación:</small> ' + TENSION + ' <br>' +
                '<small>Cargabilidad:</small> ' + PORCENTAJE_CARGA + '% <br>' +
                '<small>Capacidad Nominal (MVA) :</small> ' + CAPACIDAD_MVA + '<br>' +
                '<small>Posibilidad de Ampliación:</small> ' + AMPLIACION + ' ' +
                FECHA_CORTE_UPME +
                OBSERVACION +
            '</div>' +
            botones +
        '</div>' +
    '</div>';
    return htmlpopup;
}
map.on('popupopen', function (e) {
    $('[data-toggle="tooltip"]').tooltip();
});

map.on('popupclose', function (e) {
    $("#panel_edicion").hide();
});

function ContActualizacion(feature, latlng, botones) {
    var NIVEL_TENSION = (feature.properties.ID_NIVEL_TENSION == "Null") ? '-' : feature.properties.ID_NIVEL_TENSION;
    var TENSION = (feature.properties.ID_TENSION_SUB == "Null") ? 0 : (feature.properties.ID_TENSION_SUB.length > 2) ? feature.properties.ID_TENSION_SUB : arrayTension[feature.properties.ID_TENSION_SUB];
    var PORCENTAJE_CARGA = (isNumeric(feature.properties.PORCENTAJE_CARGA)) ? Number(feature.properties.PORCENTAJE_CARGA).toFixed(2) : Number(feature.properties.PORCENTAJE_CARGA.replace(",", ".")).toFixed(2);
    var CAPACIDAD_MVA = (isNumeric(feature.properties.CAPACIDAD_MVA)) ? Number(feature.properties.CAPACIDAD_MVA).toFixed(2) : Number(feature.properties.CAPACIDAD_MVA.replace(",", ".")).toFixed(2);
    var ID_ESTADO_SUB = (feature.properties.ID_ESTADO_SUB == "1") ? "En servicio" : (feature.properties.ID_ESTADO_SUB == "2") ? "Fuera de Servicio" : (feature.properties.ID_ESTADO_SUB == "3") ? "Futura" : 0;
    var AMPLIACION = (feature.properties.AMPLIACION == "Null") ? 0 : (feature.properties.AMPLIACION == "0") ? "NO" : (feature.properties.AMPLIACION == "1") ? "SI" : 0;
    var FECHA_CORTE_UPME = (feature.properties.FECHA_CORTE_UPME == "Null") ? "" : '<br><small>Fecha Corte Upme:</small> ' + feature.properties.FECHA_CORTE_UPME + ' ';
    var OBSERVACION = (feature.properties.OBSERVACION == "Null") ? "" : '<br><small>Observación:</small> ' + feature.properties.OBSERVACION + ' ';

    var html = '<small>Estado:</small> ' + ID_ESTADO_SUB + '<br>' +
                '<small>Fecha Entrada En Operación:</small> ' + feature.properties.FECHA_OPERACION + ' <br>' +
                '<small>Nivel Tensión:</small> ' + NIVEL_TENSION + '<br>' +
                '<small>Relación de trasformación:</small> ' + TENSION + ' <br>' +
                '<small>Cargabilidad:</small> ' + PORCENTAJE_CARGA + '% <br>' +
                '<small>Capacidad Nominal (MVA) :</small> ' + CAPACIDAD_MVA + '<br>' +
                '<small>Posibilidad de Ampliación:</small> ' + AMPLIACION + ' ' +
                FECHA_CORTE_UPME +
                OBSERVACION;
    return html;
}
function NumDec(event) {
    if (event.keyCode < 48 || event.keyCode > 57) {
        if (event.keyCode != 46 && event.keyCode != 45) {
            event.returnValue = false;
        }
    }
}
function NumDecPos(event) {
    if (event.keyCode < 48 || event.keyCode > 57) {
        if (event.keyCode != 46) {
            event.returnValue = false;
        }
    }
}
function NumPositivo(event) {
    if (event.keyCode < 48 || event.keyCode > 57)
        event.returnValue = false;

}


function ValidarFeature(prevalue) {
    if (prevalue != 'Act') {
        if (!$("#" + prevalue + "InpNomCP").val()) {
            msj_peligro("Por favor ingrese el nombre de la SubEstacion");
            $("#" + prevalue + "InpNomCP").focus();
            return false;
        }
    }
    if ($("#" + prevalue + "dateOperacion").val() == "") {
        msj_peligro("Por favor Ingrese la fecha de Operacion");
        $("#" + prevalue + "dateOperacion").focus();
        return false;
    }
    if ($("#" + prevalue + "dateCorteUPME").val() == "") {
        msj_peligro("Por favor Ingrese la fecha de corte ");
        $("#" + prevalue + "dateCorteUPME").focus();
        return false;
    }
    if ($("#" + prevalue + "InpNivelTesion").val() == "") {
        msj_peligro("Por favor Ingrese el nivel de tension");
        $("#" + prevalue + "InpNivelTesion").focus();
        return false;
    }
    if ($("#" + prevalue + "SectTensionSub").val() == "") {
        msj_peligro("Por favor Ingrese el nivel de tension sub");
        $("#" + prevalue + "SectTensionSub").focus();
        return false;
    }
    if ($("#" + prevalue + "InpPorcentajeCarga").val() == "") {
        msj_peligro("Por favor Ingrese el porcentaje de  carga");
        $("#" + prevalue + "InpPorcentajeCarga").focus();
        return false;
    }
    if ($("#" + prevalue + "InpPorcentajeCarga").val() > 120) {
        msj_peligro("El Porcentaje de carga debe ser menor o igual a 100");
        $("#" + prevalue + "InpPorcentajeCarga").focus();
        return false;
    }
    if ($("#" + prevalue + "InpCapacidadMVA").val() == "") {
        msj_peligro("Por favor Ingrese el nivel la capacudad MVA");
        $("#" + prevalue + "InpCapacidadMVA").focus();
        return false;
    }
    if ($("#" + prevalue + "SectAmpliacion").val() == "") {
        msj_peligro("Por favor seleccione ampliacion");
        $("#" + prevalue + "SectAmpliacion").focus();
        return false;
    }
    if ($("#" + prevalue + "SectEstado").val() == "") {
        msj_peligro("Por favor seleccione el estado");
        $("#" + prevalue + "SectEstado").focus();
        return false;
    }
    return true;
}

$('#SectEstado,#EditSectEstado,#ActSectEstado').change(function () {
    var currentId = $(this).attr('id');
    var tipo = currentId.substr(0, 4);
    var prevalue = tipo == "Sect" ? "" : tipo == "ActS" ? tipo.substr(0, 3) : tipo;
    if ($('#' + prevalue + 'SectEstado').val() != "") {
        if ($('#' + prevalue + 'SectEstado').val() == 3) {

            $('#' + prevalue + 'dateOperacion').data("DateTimePicker").maxDate(moment("01/01/2100").format('DD/MM/YYYY'));
            $('#' + prevalue + 'dateOperacion').data("DateTimePicker").minDate(moment());
        } else {
            $('#' + prevalue + 'dateOperacion').data("DateTimePicker").minDate(moment("01/01/1900").format('DD/MM/YYYY'));
            $('#' + prevalue + 'dateOperacion').data("DateTimePicker").maxDate(moment());
        }
        $('#' + prevalue + 'dateOperacion').prop('disabled', false);
        $('#' + prevalue + 'dateOperacion').val("");
    } else {
        $('#' + prevalue + 'dateOperacion').val("");
        $('#' + prevalue + 'dateOperacion').prop('disabled', true);
    }
})

$('#SectNivelTesion,#EditSectNivelTesion,#ActSectNivelTesion').change(function () {
    var currentId = $(this).attr('id');
    var tipo = currentId.substr(0, 4);
    var prevalue = tipo == "Sect" ? "" : tipo == "ActS" ? tipo.substr(0, 3) : tipo;
    var niveltension = $('#' + prevalue + 'SectNivelTesion').val();
    $('#' + prevalue + 'SectTensionSub').empty();

    if (niveltension != "") {
        $('#' + prevalue + 'SectTensionSub').append('<option value=""></option>');
        $.each(json_tension.features, function (index, value) {
            arrayclases[value.properties.ID_TENSION] = value.properties.DESCRIPCION;
            if (value.properties.ID_NIVEL_TENSION == niveltension) {
                $('#' + prevalue + 'SectTensionSub').append('<option value="' + value.properties.ID_TENSION + '">' + value.properties.DESCRIPCION + '</option>');
                //$("#EditSectCategoriaCP").append('<option value="' + value.properties.ID + '">' + value.properties.TENSION + '</option>');
            }
        });
        $('#' + prevalue + 'SectTensionSub').prop('disabled', false);
    } else {
        $('#' + prevalue + 'SectTensionSub').prop('disabled', true);
    }

});



$("#InpPorcentajeCarga,#EditInpPorcentajeCarga,#ActInpPorcentajeCarga").focusout(function () {
    var currentId = $(this).attr('id');
    var tipo = currentId.substr(0, 4);
    var prevalue = tipo == "InpP" ? "" : tipo == "ActI" ? tipo.substr(0, 3) : tipo;
    $("#" + prevalue + "ErrorPorcentajeCarga").empty();
    if ($("#" + prevalue + "InpPorcentajeCarga").val() >= 0 && $("#" + prevalue + "InpPorcentajeCarga").val() <= 1) {
        $("#" + prevalue + "InpPorcentajeCarga").val("");
        $("#" + prevalue + "ErrorPorcentajeCarga").append("Es un porcentaje entre 0% y 100%");
        $("#" + prevalue + "InpPorcentajeCarga").focus();
    } else if ($("#" + prevalue + "InpPorcentajeCarga").val() > 120 || $("#" + prevalue + "InpPorcentajeCarga").val() < 0) {
        $("#" + prevalue + "InpPorcentajeCarga").val("");
        $("#" + prevalue + "ErrorPorcentajeCarga").append("Es un porcentaje entre 0% y 100%");
        $("#" + prevalue + "InpPorcentajeCarga").focus();
    } else if ($("#" + prevalue + "InpPorcentajeCarga").val() > 100) {
        $("#" + prevalue + "ErrorPorcentajeCarga").append("Alerta de subestación con sobrecarga");
    }

});
/*$("#dateOperacion,#EditdateOperacion,#ActdateOperacion").focusin(function () {
    //$("form.dimForm").scrollTop(500);
    console.log("iingreso a scroll fecha");
})*/

function limpiarRadios() {
    if ($("input[name='ExisteCP']:checked").val() == "SI") {
        $('#existSi').attr("checked", false);
    } else {
        $('#existNo').attr("checked", false);
    }
    $("#Pgn2Sig").addClass("disabled");
}


function limpiarFormularioCaptura(prevalue) {
    limpiarRadios();
    $("form.dimForm").scrollTop(0);
    $("#" + prevalue + "InpNomCP").val("");
    $("#" + prevalue + "SectEstado").val("");
    $("#" + prevalue + "dateOperacion").val("");
    $("#" + prevalue + "SectNivelTesion").val("");
    $("#" + prevalue + "SectTensionSub").prop("disabled", true);
    $("#" + prevalue + "SectTensionSub").val("");
    $("#" + prevalue + "InpPorcentajeCarga").val("");
    $("#" + prevalue + "InpCapacidadMVA").val("");
    $("#" + prevalue + "SectAmpliacion").val("");
    $("#" + prevalue + "InpObservacion").val("");
}