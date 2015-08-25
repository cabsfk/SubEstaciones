
//Definicion de layers

var LyrMunicipio, FeatureMunicipio, FeatureSubEstacion, FeatureSubEstacionEdit, LyrSubEstacion, lyrAreaSubEstacion, lyrSubEstacionsT, lyrSubEstacionsApro, lyrTotalSubEstaciones;
var lyrCircleSubEstacion = L.geoJson();
var turfCPDane, turfCPDanemerge, turfCPCircles;


/***************************************
//Definicion de Busquedas
***************************************/
var LyrSubEstacions = L.esri.featureLayer(dominio + urlHostSUEdit + 'FeatureServer/0');
var LyrSubEstacions_T = L.esri.featureLayer(dominio + urlHostSUEdit + 'FeatureServer/1');

var ServiceDaneFind = L.esri.Tasks.find({
    url: dominio + urlHostDP + 'MapServer'
});

var SubEstacionFind = L.esri.Tasks.find({
    url: dominio + urlHostSUEdit + 'MapServer'
});

var SubEstacionEliFind = L.esri.Tasks.find({
    url: dominio + urlHostSUEdit + 'MapServer'
});
var SubEstacionActFind = L.esri.Tasks.find({
    url: dominio + urlHostSUEdit + 'MapServer'
});
var SubEstacionQuery = L.esri.Tasks.query({
    url: dominio + urlHostSUEdit + 'FeatureServer/0'
});
var SubEstacionEditQuery = L.esri.Tasks.query({
    url: dominio + urlHostSUEdit + 'FeatureServer/1'
});
var lyrSubEstacionsVV_t = L.esri.featureLayer(dominio + urlHostSUEdit + 'FeatureServer/3');

//*****************************************************************

$("#panel_subestaciones").hide();
$("#panel_actualizar").hide();

var CPCluster = L.markerClusterGroup({
    disableClusteringAtZoom: 13,
    maxClusterRadius: 60,
    iconCreateFunction: function (cluster) {
        var count = cluster.getChildCount();
        var digits = (count + '').length;
        return new L.DivIcon({
            html: count,
            className: 'cluster digits-' + digits,
            iconSize: null
        });
    }
});


$("#TextValCP").hide();

$("input[name='ExisteCP']:radio").change(function () {

    if ($(this).val() == "NO") {
        $("#Pgn2Sig").removeClass("disabled");
    } else {
        $("#Pgn2Sig").addClass("disabled");
    }
});

/*
Fuciona de borrar elemento
*/
function CancelarEliminacion() {
    LimpiarBorrado();
    LimpiarAprobado();
    if (!map.hasLayer(CPCluster)) {
        map.addLayer(CPCluster);
    }

    $("#FormCPPgn0").removeClass("hide");
    $("#FormCPPgn1Eli").addClass("hide");
}


function LimpiarBorrado() {
    if (map.hasLayer(lyrSubEstacionsT)){
        map.removeLayer(lyrSubEstacionsT);
    }
    $("#DivListaCpEdit").empty();
    $("#DivListaCpEdit").append('<div class="btn-group-vertical" role="group" id="ListaSubEstacionsEli" style="max-height:200px;overflow:scroll;"></div>');
    
}
function LimpiarAprobado() {
    if (map.hasLayer(lyrSubEstacionsApro)) {
        map.removeLayer(lyrSubEstacionsApro);
    }
    $("#DivListaApro").empty();
    $("#DivListaApro").append('<div class="btn-group-vertical" role="group" id="ListaSubEstacionsApro" style="max-height:200px;overflow:scroll;"></div>');
}



function CancelEditFeature() {
    $("#panel_edicion").hide();
}


/*******************************************
NAVEGACION EN EL PANEL
*******************************************/
$("#CrearCP").click(function () {
    $("#FormCPPgn0").addClass("hide");
    $("#FormCPPgn1").removeClass("hide");
});


$("#Pgn1Ant").click(function () {
    $("#FormCPPgn1").addClass("hide");
    $("#FormCPPgn0").removeClass("hide");

});

$("#Pgn1Sig").click(function () {
    $("#FormCPPgn1").addClass("hide");
    $("#FormCPPgn2").removeClass("hide");
});

$("#Pgn2Ant").click(function () {
    $("#FormCPPgn2").addClass("hide");
    $("#FormCPPgn1").removeClass("hide");

});
$("#Pgn2Sig").click(function () {
    if (!$("#Pgn2Sig").hasClass("disabled")) {
        $("#FormCPPgn2").addClass("hide");
        $("#FormCPPgn3").removeClass("hide");
        if (map.hasLayer(LyrMunicipio)) {
            LyrMunicipio.on('click', onMapClick);
        }
    }
});
$("#Pgn3Ant").click(function () {
    $("#FormCPPgn3").addClass("hide");
    $("#FormCPPgn2").removeClass("hide");
    if (map.hasLayer(LyrMunicipio)) {
        LyrMunicipio.off('click', onMapClick);
    }
});

$("#Pgn3Sig").click(function () {
    if (!$("#Pgn3Sig").hasClass("disabled")) {
        if (FunValidarUbi()) {
            $("#FormCPPgn3").addClass("hide");
            $("#FormCPPgn4").removeClass("hide");
            if (map.hasLayer(LyrMunicipio)) {
                LyrMunicipio.off('click', onMapClick);
            }
            $("form.dimForm").scrollTop(0);
            $("#InpNomCP").focus();
            //console.log("iingreso a scroll sitionete");
        }
    }
});

$("#Pgn4Ant").click(function () {
    $("#FormCPPgn4").addClass("hide");
    $("#FormCPPgn3").removeClass("hide");
    
});

$("#Pgn4Sig").click(function () {
    if(ValidarFeature("")){
        CrearFeature("");
    }    
});

$("#BtnreiniciarCreacion").click(function () {
    CancelarCrear();
});


function CancelarCrear() {
      
    if (map.hasLayer(FeatureSubEstacion)) {
        map.removeLayer(FeatureSubEstacion);
    }
    if (map.hasLayer(LyrSubEstacion)) {
        map.removeLayer(LyrSubEstacion);
    }
    if (map.hasLayer(LyrMunicipio)) {
        map.removeLayer(LyrMunicipio);
    }
    if (map.hasLayer(FeatureMunicipio)) {
        map.removeLayer(FeatureMunicipio);
    }
    map.setView([4.12521648, -74.5020], 5);
    if(!map.hasLayer(CPCluster)){
        map.addLayer(CPCluster);
    }

    if (map.hasLayer(lyrAreaSubEstacion)) {
        map.removeLayer(lyrAreaSubEstacion);
    }
    $("#Pgn2Sig").addClass("disabled");
    $("#Pgn3Sig").addClass("disabled");
    $("#TextValCP").hide();
    $("#panel_edicion").hide(100);
    $("#city").val("");
    $("#DivListaCpAct").empty();
    $("#panel_subestaciones").hide(100);
    $("#InpLatitudCP").val("");
    $("#InpLongitudCP").val("");
    $("#PValidaUbi").empty();
    $("#InpNomCP").val("");
    $("#SectCategoriaCP").val("");
    $("#SecTipoZona").val("");
    $("#InpViviendasU").val("");
    $("#InpViviendasR").val("");
    $("#InpViviendasSSU").val("");
    $("#InpViviendasSSR").val("");
    $("#InpObservacion").val("");
    $("#FormCPPgn0").removeClass("hide");
    $("#FormCPPgn1").addClass("hide");
    $("#FormCPPgn2").addClass("hide");
    $("#FormCPPgn3").addClass("hide");
    $("#FormCPPgn4").addClass("hide");
    $("#FormCPPgn5").addClass("hide");
    $("#FormCPPgn1ActVV").addClass("hide");
    $("#ListaSubEstacions").empty();
    $("#panel_subestaciones").hide();
    $("#FormInpViviendasU").addClass('hide');
    $("#FormInpViviendasR").addClass('hide');
    $("#FormInpViviendasSSU").addClass('hide');
    
    $("#FormCPPgn2ActVV").addClass("hide");
    $("#FormInpViviendasSSR").addClass('hide');
}


/*
Mapear Todos las SubEstaciones
*/
function MapearSubEstacionTotal() {

    SubEstacionFind.layers('0');
    SubEstacionFind.params.layerDefs = "";
    SubEstacionFind.text('1').fields('ACTIVO');//.fields("ID_FUENTE_CP,ID_CLASE, ID_TIPO,NOMBRE_SITIO,V_URBANO, V_RURAL, VSS_URBANO, VSS_RURAL");
    SubEstacionFind.run(function (error, featureCollection, response2) {

        var CP, htmlpopup, clase;
        
        waitingDialog.hide();
        lyrTotalSubEstaciones = L.geoJson(featureCollection, {
            pointToLayer: function (feature, latlng) {
                var clase, estilo, tipo;
                estilo = geojsonMarkerSubEstacion;
               
                CP = L.marker(latlng, estilo).bindLabel(feature.properties.NOM_SUBESTACION, { noHide: false, offset: [20, -45] });
                var htmlpopup = ContPopUP(feature, latlng,"");
                CP.bindPopup(htmlpopup);
                return CP;

            }
        });
        if (map.hasLayer(CPCluster)) {
             CPCluster.clearLayers();
             CPCluster.addLayer(lyrTotalSubEstaciones);
            
        } else {
            CPCluster.addLayer(lyrTotalSubEstaciones);
            if (!map.hasLayer(LyrMunicipio)) {
                map.addLayer(CPCluster);
            }
        }
        $("#MisActualizarVV").prop("disabled", false);
        

    });
}

$("#MisActualizarVV").prop("disabled", true);
MapearSubEstacionTotal();


/*
Busqueda Por Municipio!!!
*/
$("#city").autocomplete({
    source: function (request, response) {
        $("#BtnBusquedaMun").empty().append("<span class='glyphicon glyphicon-repeat'></span>").removeClass("btn-default").addClass("btn-warning");
        ServiceDaneFind.layers('0').text(request.term).fields('MPIO_CNMBRSA,MPIO_CNMBR');
        // ServiceDaneFind.params.layerDefs ="1:CLASE='3'";

        ServiceDaneFind.run(function (error, featureCollection, response2) {
            console.log(featureCollection);
            $("#BtnBusquedaMun").empty().append("<span class='glyphicon glyphicon-search'></span>").removeClass("btn-warning").addClass("btn-default");
            response($.map(featureCollection.features, function (el) {
                return {
                    label: el.properties.MPIO_CNMBR + " - " + el.properties.DPTO_CNMBR,
                    value: el.properties.MPIO_CNMBR + " - " + el.properties.DPTO_CNMBR,
                    MPIO: el.properties.MPIO_CCDGO,
                    DPTO: el.properties.DPTO_CCDGO,
                    geojson: el
                };
            }));

        });
    },
    minLength: 3,
    select: function (event, ui) {
        if (map.hasLayer(LyrMunicipio)) {
            map.removeLayer(LyrMunicipio);
        }
        limpiarRadios();
        selAlfMun(ui.item.geojson, ui.item.MPIO, ui.item.DPTO);
        MapearSubEstacion(ui.item.geojson, ui.item.MPIO, ui.item.DPTO);
    },
    open: function () {
        $(this).removeClass("ui-corner-all").addClass("ui-corner-top");
        $(this).addClass("list-group");
    },
    close: function () {
        $(this).removeClass("ui-corner-top").addClass("ui-corner-all");
    }
}).keypress(function (e) {
    if (e.keyCode === 13) {
        e.preventDefault();
        return false;
    }
}).autocomplete("instance")._renderItem = function (ul, item) {
    ul.addClass("list-group");
    ul.addClass("Ancho");
    return $('<li class="list-group-item ">')
        .append('<small>' + item.label + '</small>' +
                '</li>').appendTo(ul);
};


var selAlfMun = function (json, Mpio, Dpto) {
    FeatureMunicipio = json;
    $("#label_municipio").empty();
    $("#label_municipio").append(FeatureMunicipio.properties.MPIO_CNMBR);
    $("#label_departamento").empty();
    $("#label_departamento").append(FeatureMunicipio.properties.DPTO_CNMBR);
    LyrMunicipio = L.geoJson(json, {
        style: function (feature) {
            return {
                color: '#00FFFC',
                weight: 5,
                opacity: 1,
                fillOpacity: 0.007
            }
        }
    }).addTo(map);
    //map.setMaxBounds(LyrMunicipio.getBounds());
    map.fitBounds(LyrMunicipio.getBounds());
}



function MapearSubEstacion(json, Mpio, Dpto) {
    console.log("Ingreso a mapear sub estacion")
    
    var QueryMap = L.esri.Tasks.query({
        url: dominio + urlHostSUEdit + 'FeatureServer/0'
    });
    QueryMap.intersects(json);
    QueryMap.run(function (error, featureCollection, response2) {
        if (map.hasLayer(LyrSubEstacion)) {
            map.removeLayer(LyrSubEstacion);
        }
        if (map.hasLayer(lyrCircleSubEstacion)) {
            map.removeLayer(lyrCircleSubEstacion);
        }

        var CP, htmlpopup, clase;
        ordenarGeojson = [];
        $("#TextValCP").show();
        map.removeLayer(CPCluster);
        $("#DivListaCp").empty();
        $("#DivListaCp").append('<div class="btn-group-vertical" role="group" id="ListaSubEstacions" style="max-height:200px;overflow:scroll;"></div>');
        LyrSubEstacion = L.geoJson(featureCollection, {
            pointToLayer: function (feature, latlng) {
                var clase, estilo;
                estilo = geojsonMarkerSubEstacion;
                console.log(feature.properties.FECHA_OPERACION);    
                if (feature.properties.FECHA_CORTE_UPME != null) {
                    feature.properties.FECHA_CORTE_UPME = moment(feature.properties.FECHA_CORTE_UPME).tz("America/Bogota").add(5, 'hours').format('DD/MM/YYYY');
                }
                if (feature.properties.FECHA_OPERACION != null) {
                    feature.properties.FECHA_OPERACION = moment(feature.properties.FECHA_OPERACION).tz("America/Bogota").add(5, 'hours').format('DD/MM/YYYY');
                }
                if (feature.properties.FECHA_OFICIALIZACION != null) {
                    feature.properties.FECHA_OFICIALIZACION = moment(feature.properties.FECHA_OFICIALIZACION).tz("America/Bogota").add(5, 'hours').format('DD/MM/YYYY HH:mm');
                }

                CP = L.marker(latlng, estilo).bindLabel(feature.properties.NOM_SUBESTACION, { noHide: false, offset: [20, -45] });
                var htmlpopup = ContPopUP(feature, latlng,"");
                CP.bindPopup(htmlpopup);
                $("#ListaSubEstacions").prepend('<div class="rowprueba"><button type="button" class="btn btn-default" style=" width: 230px;" onclick="clickmap(' + feature.id + ',\'LyrSubEstacion\')">' + feature.properties.NOM_SUBESTACION + '</button></div>');
                return CP;
            }
        });

        LyrSubEstacion.addTo(map);
        $("#panel_subestaciones").show(100);
        $(".legend").show(100);
        $('#ListaSubEstacions').searchable({
            searchField: '#container-search',
            selector: '.rowprueba',
            childSelector: '.btn',
            striped: true,
            show: function (elem) {
                elem.slideDown(100);
            },
            hide: function (elem) {
                elem.slideUp(100);
            },
            clearOnLoad: true
        });
    });
}
$("#BtnLimpiarMun").click(function () {
    if (map.hasLayer(FeatureSubEstacion)) {
        map.removeLayer(FeatureSubEstacion);
    }
    if (map.hasLayer(LyrSubEstacion)) {
        map.removeLayer(LyrSubEstacion);
    }
    if (map.hasLayer(LyrMunicipio)) {
        map.removeLayer(LyrMunicipio);
    }
    if (map.hasLayer(FeatureMunicipio)) {
        map.removeLayer(FeatureMunicipio);
    }
    map.setView([4.12521648, -74.5020], 5);
    if (!map.hasLayer(CPCluster)) {
        map.addLayer(CPCluster);
    }

    if (map.hasLayer(lyrAreaSubEstacion)) {
        map.removeLayer(lyrAreaSubEstacion);
    }
    $("#city").val("");
    $("#city").focus();
    $("#panel_subestaciones").hide();
    
});




$(function () {
    $('#myTab a:last').tab('show')
 })