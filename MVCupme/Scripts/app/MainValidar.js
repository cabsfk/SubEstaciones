
/********************************************************
Capas
*******************************************************/
var lyrSubEstacionsT,lyrSubEstacionsApro,lyrTotalSubEstaciones;
var LyrSubEstacions = L.esri.featureLayer({
    url: dominio + urlHostSUEdit + 'FeatureServer/0'
});
var LyrSubEstacions_T = L.esri.featureLayer({
    url: dominio + urlHostSUEdit + 'FeatureServer/1'
});

var LyrSubEstacionsMap = L.esri.featureLayer({
    url: dominio + urlHostSUEdit + 'MapServer'
});

var SubEstacionValidQuery_T = new L.esri.Tasks.Query({
    url: LyrSubEstacions_T.options.url
});

var SubEstacionValidFind = new L.esri.Tasks.find({
        url: LyrSubEstacionsMap.options.url
});

var SubEstacionEditQuery = new L.esri.Tasks.Query({
    url: LyrSubEstacions_T.options.url
});

var SubEstacionFind = L.esri.Tasks.find({
    url: LyrSubEstacionsMap.options.url
});

    
/*******************************

**************************/


$("#Validar").click(function () {
    $("#FormCPPgn0").addClass("hide");
    $("#FormCPPgn1").removeClass("hide");
    MapearSubEstacionValid();
});

$("#ValidarAct").click(function () {
    $("#FormCPPgn0").addClass("hide");
    $("#FormCPPgn2").removeClass("hide");
    MapearSubEstacionActList();
});

function CancelarAprobacion() {
    $("#FormCPPgn0").removeClass("hide");
    $("#FormCPPgn1").addClass("hide");
    if (map.hasLayer(lyrSubEstacionsT)){
        map.removeLayer(lyrSubEstacionsT);
    }
}
function CancelarActualizacion() {
    $("#FormCPPgn0").removeClass("hide");
    $("#FormCPPgn2").addClass("hide");
    if (map.hasLayer(lyrSubEstacionsApro)) {
        map.removeLayer(lyrSubEstacionsApro);
    }
}
function Limpiar() {
    if (map.hasLayer(lyrSubEstacionsT)){
        map.removeLayer(lyrSubEstacionsT);
    }
    $("#DivListaCpValidate").empty();
    $("#DivListaCpValidate").append('<div class="btn-group-vertical" role="group" id="ListaCpValidate" style="max-height:400px;overflow:scroll; min-width: 300px;"><ul class="chat"></ul></div>');
}
function LimpiarActValid() {
    if (map.hasLayer(lyrSubEstacionsApro)) {
        map.removeLayer(lyrSubEstacionsApro);
    }
    $("#DivListaAct").empty();
    $("#DivListaAct").append('<div class="btn-group-vertical" role="group" id="ListaSubEstacionsActValid" style="max-height:400px;overflow:scroll; min-width: 300px;"><ul class="chat"></ul></div>');
        
}
function MapearSubEstacionActList() {
    SubEstacionValidFind.layers('1');
    SubEstacionValidFind.params.layerDefs = "1:ACTUALIZACION=1 AND ACTIVO=1";
    SubEstacionValidFind.text("1").fields('ACTIVO');
    SubEstacionValidFind.run(function (error, featureCollection, response2) {
        var CP, htmlpopup, clase;
        LimpiarActValid();
        lyrSubEstacionsApro = L.geoJson(featureCollection, {
            pointToLayer: function (feature, latlng) {
                var clase, estilo;
                estilo = geojsonMarkerSinAprobar;
                CP = L.marker(latlng, estilo).bindLabel(feature.properties.NOM_SUBESTACION, { noHide: false, offset: [20, -45] });
                var htmlBotones = '<div class="popupstyle">' +
                                    '<div class="popupstyle">' +
                                    '<button class="btn btn-success pull-left btn-xs " data-toggle="tooltip" data-placement="right" title="Aprobar" type="button" onclick="AprobarActualizacion(' + feature.properties.OBJECTID + ')">' +
                                        '<span class="glyphicon glyphicon-ok" aria-hidden="true"></span> ' +
                                    '</button> ' +
                                   '<button class="btn btn-danger pull-right btn-xs " data-toggle="tooltip" data-placement="left" title="Denegar" type="button" onclick="RechazarActualizacion(' + feature.properties.OBJECTID + ')">' +
                                        '<span class="glyphicon glyphicon-ban-circle" aria-hidden="true"></span> ' +
                                    '</button><br>' +
                                  '</div>';
                /*var htmlpopup = ContPopUP(feature, latlng, htmlBotones);
                CP.bindPopup(htmlpopup);*/
                var html = ContActualizacion(feature, latlng, htmlBotones);
                var datauser = "";
                if (glo.ArraydataOrg.indexOf(feature.properties.ID_CONTACTO) < 0) {
                    glo.ArraydataOrg.push(feature.properties.ID_CONTACTO);
                    $.ajax({
                        url: "../../SubEstaciones/Home/UsrOrgJson?idusuario=" + feature.properties.ID_CONTACTO,
                        dataType: 'json',
                        async: false,
                        success: function (json) {
                            glo.DataOrg.push(json);
                        }
                    });
                }
                datauser = glo.DataOrg[glo.ArraydataOrg.indexOf(feature.properties.ID_CONTACTO)]


                $("#ListaSubEstacionsActValid .chat").prepend(
                     '<li class="left" onclick="clickmap(' + feature.properties.ID_SUBESTACION + ',\'BuscarTotal\')">' +
                                '<div class="clearfix">' +
                                    '<h6>' +
                                        '<strong class="primary-font">' + feature.properties.NOM_SUBESTACION + '</strong>,<br> ' +
                                        '<small>Empresa: </small>' + datauser[0].organizacion + ', ' +
                                        '<small>Usuario: </small> ' + datauser[0].nombre + '<br />' +
                                        '<small>email: </small> ' + datauser[0].email + '<br />' +
                                        '<small>telefono: </small> ' + datauser[0].telefono +'-Ext:'+ datauser[0].ext +'<br />' +
                                        '<small>celular: </small> ' + datauser[0].celular + '<br />' +
                                        '<small>Fecha Creación: </small> ' + feature.properties.FECHA_CREACION + '<br />' +
                                        html +
                                     '</h6>' +
                                      htmlBotones +
                                '</div>' +
                            '</li>'
                    );
                return CP;
            }
        });
        //CPCluster.clearLayers();
        //lyrSubEstacionsApro.addTo(map);
        
        $('#ListaSubEstacionsActValid').searchable({
            searchField: '#container-search-ActSubEst',
            selector: 'li',
            childSelector: '.clearfix',
            show: function (elem) {
                elem.slideDown(100);
            },
            hide: function (elem) {
                elem.slideUp(100);
            }
        });
        $('[data-toggle="tooltip"]').tooltip();
    });
}

function AprobarActualizacion(id) {
    BootstrapDialog.show({
        title: 'Confirmar',
        message: '¿Esta Seguro de que desea Aprobar la actualización?',
        closable: false,
        data: {
            'callback': function (result) {
                if (result) {
                    waitingDialog.show();
                    SubEstacionValidQuery_T.featureIds(id).where("").run(function (error, featureCollectionFind, response2) {
                        featureCollectionFind.features[0].properties.ACTIVO = 0;
                        featureCollectionFind.features[0].properties.ID_USUARIO_VALIDA = id_user;
                        featureCollectionFind.features[0].properties.FECHA_VALIDACION = moment().format('DD/MM/YYYY h:mm:ss a');
                        LyrSubEstacions_T.updateFeature(featureCollectionFind.features[0], function (error, featureCollection, response2) {
                            if (featureCollection.success == true) {

                                delete featureCollectionFind.features[0].properties.ACTUALIZACION;
                                delete featureCollectionFind.features[0].properties.FECHA_VALIDACION;
                                delete featureCollectionFind.features[0].properties.ID_USUARIO_VALIDA;
                                featureCollectionFind.features[0].properties.ACTIVO = 1;
                                featureCollectionFind.features[0].properties.FECHA_OFICIALIZACION = moment().format('DD/MM/YYYY h:mm:ss a');
                                featureCollectionFind.features[0].properties.FECHA_CORTE_UPME = moment('31/12/' + moment().subtract(1, 'year').format('YYYY'), 'DD/MM/YYYY').format('DD/MM/YYYY');
                                featureCollectionFind.features[0].properties.ID_USUARIO_OFICIALIZA = id_user;
                                LyrSubEstacions.query().where("ID_SUBESTACION=" + featureCollectionFind.features[0].properties.ID_SUBESTACION).run(function (error, featureCollectionIdSub, response) {
                                    
                                    if (featureCollection.success == true) {
                                        featureCollectionFind.features[0].id = featureCollectionIdSub.features[0].id;
                                        featureCollectionFind.features[0].properties.OBJECTID = featureCollectionIdSub.features[0].properties.OBJECTID;
                                        console.log(featureCollectionFind);
                                        LyrSubEstacions.updateFeature(featureCollectionFind.features[0], function (error, featureCollection, response2) {
                                            if (featureCollection.success == true) {
                                                MapearSubEstacionActList();
                                                MapearSubEstacionTotal();
                                                msj_exito("Se CREO Actualizo la Subestacion exitosamente!");
                                                return true;
                                            } else {
                                                msj_peligro("ERROR, REVISE EL SERVIDOR DE MAPAS !");
                                                return false;
                                            }
                                        });
                                    }
                                });
                                
                            } else {
                                msj_peligro("NO SE REALIZO EL ACTUALIZACION DE TEMP CON EXITO, REVISE EL SERVIDOR DE MAPAS !");
                                return false;
                            }
                        });
                    });
                }
            }
        },
        buttons: [{
            label: 'Cancelar',
            cssClass: 'btn-default',
            action: function (dialog) {
                typeof dialog.getData('callback') === 'function' && dialog.getData('callback')(false);
                dialog.close();
            }
        }, {
            label: 'OK',
            cssClass: 'btn-primary',
            action: function (dialog) {
                typeof dialog.getData('callback') === 'function' && dialog.getData('callback')(true);
                dialog.close();
                waitingDialog.show();
            }
        }]
    });

}

function RechazarActualizacion(id) {
    BootstrapDialog.show({
        title: 'Confirmar',
        message: '¿Esta Seguro de que desea borrar la actualización?',
        closable: false,
        data: {
            'callback': function (result) {
                if (result) {
                    waitingDialog.show();
                    SubEstacionValidQuery_T.featureIds(id).where("").run(function (error, featureCollectionFind, response2) {
                        featureCollectionFind.features[0].properties.ACTIVO = 2;
                        featureCollectionFind.features[0].properties.ID_USUARIO_VALIDA = id_user;
                        featureCollectionFind.features[0].properties.FECHA_VALIDACION = moment().format('DD/MM/YYYY h:mm:ss a');
                        LyrSubEstacions_T.updateFeature(featureCollectionFind.features[0], function (error, featureCollection, response2) {
                            if (featureCollection.success == true) {
                                MapearSubEstacionActList();
                                MapearSubEstacionTotal();
                                msj_exito("Se Rechazo exitosamente la actualización!");
                                return true;
                            } else {
                                msj_peligro("NO SE REALIZO EL PROCESO CON EXITO, REVISE EL SERVIDOR DE MAPAS!");
                                return false;
                            }
                        });
                    });
                }
            }
        },
        buttons: [{
            label: 'Cancelar',
            cssClass: 'btn-default',
            action: function (dialog) {
                typeof dialog.getData('callback') === 'function' && dialog.getData('callback')(false);
                dialog.close();
            }
        }, {
            label: 'OK',
            cssClass: 'btn-primary',
            action: function (dialog) {
                typeof dialog.getData('callback') === 'function' && dialog.getData('callback')(true);
                dialog.close();
                waitingDialog.show();
            }
        }]
    });

}
function MapearSubEstacionValid() {

    SubEstacionValidFind.layers('1');
    SubEstacionValidFind.params.layerDefs = "1:ACTIVO=1";
    SubEstacionValidFind.text("0").fields('ACTUALIZACION');
    SubEstacionValidFind.run(function (error, featureCollection, response2) {
        waitingDialog.hide();
        var CP, htmlpopup, clase;
        Limpiar();
        if (map.hasLayer(lyrSubEstacionsT)) {
            map.removeLayer(lyrSubEstacionsT);
        }
        lyrSubEstacionsT = L.geoJson(featureCollection, {
            pointToLayer: function (feature, latlng) {
                var clase, estilo;
                estilo = geojsonMarkerSubEstacionEdit;
                CP = L.marker(latlng, estilo).bindLabel(feature.properties.NOM_SUBESTACION, { noHide: false, offset: [20, -45] });
                var htmlBotones = '<div class="popupstyle">' +
                                    '<button class="btn btn-success pull-left btn-xs " data-toggle="tooltip" data-placement="left" title="Aprobar" type="button" onclick="AprobarCreacion(' + feature.properties.OBJECTID + ')">' +
                                        '<span class="glyphicon glyphicon-ok" aria-hidden="true"></span> ' +
                                    '</button> ' +
                                    '<button class="btn btn-info pull-left btn-xs " data-toggle="tooltip" data-placement="top" title="Editar" type="button" onclick="EditarSubEstacion(' + feature.properties.OBJECTID + ')">' +
                                        '<span class="glyphicon glyphicon-edit" aria-hidden="true"></span>' +
                                    '</button>' +
                                    '<button class="btn btn-danger pull-right btn-xs " data-toggle="tooltip" data-placement="left" title="Denegar" type="button" onclick="RechazarCreacion(' + feature.properties.OBJECTID + ')">' +
                                        '<span class="glyphicon glyphicon-ban-circle" aria-hidden="true"></span> ' +
                                    '</button><br>' +
                                '</div>';
                var htmlpopup = ContPopUP(feature, latlng, htmlBotones);
                CP.bindPopup(htmlpopup);
                var datauser = "";
                if (glo.ArraydataOrg.indexOf(feature.properties.ID_CONTACTO) < 0) {
                    glo.ArraydataOrg.push(feature.properties.ID_CONTACTO);
                    $.ajax({
                        url: "../../SubEstaciones/Home/UsrOrgJson?idusuario=" + feature.properties.ID_CONTACTO,
                        dataType: 'json',
                        async: false,
                        success: function (json) {
                            glo.DataOrg.push(json);
                        }
                    });
                }
                datauser=glo.DataOrg[glo.ArraydataOrg.indexOf(feature.properties.ID_CONTACTO)]

                
                $("#ListaCpValidate .chat").prepend(
                     '<li class="left" onclick="clickmap(' + feature.properties.OBJECTID + ',\'lyrSubEstacionsT\')">' +
                                '<div class="clearfix">' +
                                    '<h5>' +
                                        '<strong class="primary-font">' + feature.properties.NOM_SUBESTACION + '</strong>,<br> '+
                                        '<small>Empresa: </small>' + datauser[0].organizacion + ', <br />' +
                                        '<small>Usuario: </small> ' + datauser[0].nombre + '<br />' +
                                         '<small>email: </small> ' + datauser[0].email + '<br />' +
                                        '<small>telefono: </small> ' + datauser[0].telefono + '-Ext:' + datauser[0].ext + '<br />' +
                                        '<small>celular: </small> ' + datauser[0].celular + '<br />' +
                                    '</h5>' +
                                    '<div>' +
                                        '<small class="pull-right text-muted">' +
                                            '<span class="glyphicon glyphicon-time"></span> ' + feature.properties.FECHA_CREACION +
                                        '</small>' +
                                    '</div>' +
                                '</div>' +
                            '</li>'
                    );
                
                return CP;
            }
        });


        lyrSubEstacionsT.addTo(map);
        $('#ListaCpValidate').searchable({
            searchField: '#container-search',
            selector: 'li',
            childSelector: '.clearfix',
            show: function (elem) {
                elem.slideDown(100);
            },
            hide: function (elem) {
                elem.slideUp(100);
            }
        });
        $('[data-toggle="tooltip"]').tooltip();

    });
}




function AprobarCreacion(id) {
    BootstrapDialog.show({
        title: 'Confirmar',
        message: '¿Esta Seguro de que desea Aprobar la actualización?',
        closable: false,
        data: {
            'callback': function (result) {
                if (result) {
                    waitingDialog.show();
                    SubEstacionValidQuery_T.featureIds(id).where("").run(function (error, featureCollectionFind, response2) {
                        featureCollectionFind.features[0].properties.ACTIVO = 0;
                        featureCollectionFind.features[0].properties.ID_USUARIO_VALIDA = id_user;
                        featureCollectionFind.features[0].properties.FECHA_VALIDACION = moment().format('DD/MM/YYYY h:mm:ss a');
                        LyrSubEstacions_T.updateFeature(featureCollectionFind.features[0], function (error, featureCollection, response2) {
                            if (featureCollection.success == true) {
                                
                                delete featureCollectionFind.features[0].properties.ACTUALIZACION;
                                delete featureCollectionFind.features[0].properties.FECHA_VALIDACION;
                                delete featureCollectionFind.features[0].properties.ID_USUARIO_VALIDA;
                                featureCollectionFind.features[0].properties.ACTIVO = 1;
                                featureCollectionFind.features[0].properties.FECHA_OFICIALIZACION = moment().format('DD/MM/YYYY h:mm:ss a');
                                featureCollectionFind.features[0].properties.FECHA_CORTE_UPME = moment('31/12/' + moment().subtract(1, 'year').format('YYYY'), 'DD/MM/YYYY').format('DD/MM/YYYY');
                                
                                featureCollectionFind.features[0].properties.ID_USUARIO_OFICIALIZA = id_user;
                                LyrSubEstacions.addFeature(featureCollectionFind.features[0], function (error, featureCollection, response2) {
                                    
                                    if (featureCollection.success == true) {
                                        MapearSubEstacionValid();
                                        MapearSubEstacionTotal();
                                        msj_exito("Se CREO la SubEstacion exitosamente!");
                                        return true;
                                    } else {
                                        msj_peligro("ERROR, REVISE EL SERVIDOR DE MAPAS !");
                                        return false;
                                    }
                                });
                            } else {
                                msj_peligro("NO SE REALIZO EL ACTUALIZACION DE TEMP CON EXITO, REVISE EL SERVIDOR DE MAPAS !");
                                return false;
                            }
                        });
                    });
                }
            }
        },
        buttons: [{
            label: 'Cancelar',
            cssClass: 'btn-default',
            action: function (dialog) {
                typeof dialog.getData('callback') === 'function' && dialog.getData('callback')(false);
                dialog.close();
            }
        }, {
            label: 'OK',
            cssClass: 'btn-primary',
            action: function (dialog) {
                typeof dialog.getData('callback') === 'function' && dialog.getData('callback')(true);
                dialog.close();
                waitingDialog.show();
                
            }
        }]
    });

}
function RechazarCreacion(id) {
    BootstrapDialog.show({
        title: 'Confirmar',
        
        message: '¿Esta Seguro de que desea rechazar la actualización?',
        closable: false,
        data: {
            'callback': function (result) {
                if (result) {
                    waitingDialog.show();
                    SubEstacionValidQuery_T.featureIds(id).where("").run(function (error, featureCollectionFind, response2) {
                        featureCollectionFind.features[0].properties.ACTIVO = 2;
                        featureCollectionFind.features[0].properties.ID_USUARIO_VALIDA = id_user;
                        featureCollectionFind.features[0].properties.FECHA_VALIDACION = moment().format('DD/MM/YYYY h:mm:ss a');
                        LyrSubEstacions_T.updateFeature(featureCollectionFind.features[0], function (error, featureCollection, response2) {
                            if (featureCollection.success == true) {
                                    MapearSubEstacionValid();
                                    MapearSubEstacionTotal();
                                    msj_exito("Se RECHAZO  la subestación exitosamente!");
                                    return true;
                                } else {
                                    msj_peligro("NO SE REALIZO LA CREACION CON EXITO, REVISE EL SERVIDOR DE MAPAS !");
                                    return false;
                                }
                        });
                    });

                }
            }
        },
        buttons: [{
            label: 'Cancelar',
            cssClass: 'btn-default',
            action: function (dialog) {
                typeof dialog.getData('callback') === 'function' && dialog.getData('callback')(false);
                dialog.close();
            }
        }, {
            label: 'OK',
            cssClass: 'btn-primary',
            action: function (dialog) {
                    typeof dialog.getData('callback') === 'function' && dialog.getData('callback')(true);
                    dialog.close();
                    waitingDialog.show();
            }
        }]
    });

}

/********************************************************
Aplicacion
*******************************************************/
/*
Mapear Todos las SubEstaciones
*/


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

function MapearSubEstacionTotal() {
    SubEstacionFind.layers('0');
    SubEstacionFind.params.layerDefs = "";
    SubEstacionFind.text('1').fields('ACTIVO');
    SubEstacionFind.run(function (error, featureCollection, response2) {
        var CP, htmlpopup, clase;
        waitingDialog.hide();
        lyrTotalSubEstaciones = L.geoJson(featureCollection, {
            pointToLayer: function (feature, latlng) {
                var clase, estilo, tipo;
                estilo = geojsonMarkerSubEstacion;
                CP = L.marker(latlng, estilo).bindLabel(feature.properties.NOM_SUBESTACION, { noHide: false, offset: [20, -45] });
                var htmlpopup = ContPopUP(feature, latlng, "");
                CP.bindPopup(htmlpopup);
                return CP;
            }
        });
        if (map.hasLayer(CPCluster)) {
            CPCluster.clearLayers();
            CPCluster.addLayer(lyrTotalSubEstaciones);
        } else {
            CPCluster.addLayer(lyrTotalSubEstaciones);
            map.addLayer(CPCluster);
            
        }
    });
}

MapearSubEstacionTotal();