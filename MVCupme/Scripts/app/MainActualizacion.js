function MapearSubEstacionActList() {
    SubEstacionEliFind.layers('1');
    SubEstacionEliFind.params.layerDefs = "1:ACTUALIZACION=1 AND ACTIVO=1";
    SubEstacionEliFind.text(id_user).fields('ID_CONTACTO');
    SubEstacionEliFind.run(function (error, featureCollection, response2) {
        var CP, htmlpopup, clase;
        LimpiarActValid();
        lyrSubEstacionsApro = L.geoJson(featureCollection, {
            pointToLayer: function (feature, latlng) {
                var clase, estilo;
                estilo = geojsonMarkerSubEstacion;
                CP = L.marker(latlng, estilo).bindLabel(feature.properties.NOM_SUBESTACION, { noHide: false, offset: [20, -45] });
                var htmlBotones = '<div class="popupstyle">' +
                                   '<button class="btn btn-danger pull-right btn-xs " data-toggle="tooltip" data-placement="left" title="Borrar" type="button" onclick="BorrarActualizacion(' + feature.properties.OBJECTID + ')">' +
                                        '<span class="glyphicon glyphicon-ban-circle" aria-hidden="true"></span> ' +
                                    '</button><br>' +
                                  '</div>';
                var htmlpopup = ContPopUP(feature, latlng, htmlBotones);
                CP.bindPopup(htmlpopup);
                $("#ListaSubEstacionsActValid").prepend('<div class="rowprueba"><button type="button"  class="btn btn-default" style=" width: 280px;" onclick="clickmap(' + feature.properties.OBJECTID + ',\'lyrSubEstacionApro\')">' + feature.properties.NOM_SUBESTACION + '</button></div>');
                return CP;
            }
        });

        lyrSubEstacionsApro.addTo(map);
        $('#ListaSubEstacionsActValid').searchable({
            searchField: '#container-search-ActSubEst',
            selector: '.rowprueba',
            childSelector: '.btn',
            show: function (elem) {
                elem.slideDown(100);
            },
            hide: function (elem) {
                elem.slideUp(100);
            }
        });

    });
}
function MapearSubEstacionAct() {
    SubEstacionEliFind.layers('0');
    SubEstacionEliFind.params.layerDefs = "0:ACTIVO=1";
    
    SubEstacionEliFind.text(UsrOrgJson[0].idorganizacion).fields('ID_ORGANIZACION');
    SubEstacionEliFind.run(function (error, featureCollection, response2) {
        var CP, htmlpopup, clase;
        LimpiarAct();
        lyrSubEstacionsApro = L.geoJson(featureCollection, {
            pointToLayer: function (feature, latlng) {
                var clase, estilo;
                estilo = geojsonMarkerSubEstacion;
                CP = L.marker(latlng, estilo).bindLabel(feature.properties.NOM_SUBESTACION, { noHide: false, offset: [20, -45] });
                var htmlBotones = '<div class="popupstyle">' +
                                    '<button class="btn btn-info pull-left btn-xs " data-toggle="tooltip" data-placement="rigth" title="Actualizar" type="button" onclick="ActualizarSubEstacion(' + feature.properties.OBJECTID + ')">' +
                                        '<span class="glyphicon glyphicon-edit" aria-hidden="true"></span>' +
                                    '</button><br>' +
                                  '</div>';
                var htmlpopup = ContPopUP(feature, latlng, htmlBotones);
                CP.bindPopup(htmlpopup);
                $("#ListaSubEstacionsAct").prepend('<div class="rowprueba"><button type="button"  class="btn btn-default" style=" width: 280px;" onclick="clickmap(' + feature.properties.OBJECTID + ',\'lyrSubEstacionApro\')">' + feature.properties.NOM_SUBESTACION + '</button></div>');
                return CP;
            }
        });

        lyrSubEstacionsApro.addTo(map);
        $('#ListaSubEstacionsAct').searchable({
            searchField: '#container-search-ACT',
            selector: '.rowprueba',
            childSelector: '.btn',
            show: function (elem) {
                elem.slideDown(100);
            },
            hide: function (elem) {
                elem.slideUp(100);
            }
        });

    });
}

function ActualizarSubEstacion(id_feature) {
    console.log(id_feature)
    $("#panel_actualizar").show(100);
    var QueryMap = L.esri.Tasks.query({
        url: dominio + urlHostSUEdit + 'FeatureServer/0'
    });
    QueryMap.featureIds(id_feature).run(function (error, featureCollection, response2) {
        //console.log(error);
        FeatureSubEstacionAct = featureCollection.features[0];
        //console.log(featureCollection);
        $("#ActInpNomCP").val(featureCollection.features[0].properties.NOM_SUBESTACION);
        if (featureCollection.features[0].properties.FECHA_OPERACION != null) {
            $("#ActSectEstado").val(featureCollection.features[0].properties.ID_ESTADO_SUB);
            $('#ActdateOperacion').data("DateTimePicker").date(moment(featureCollection.features[0].properties.FECHA_OPERACION).tz("America/Bogota").add(5, 'hours').format('DD/MM/YYYY'));
            $('#ActdateOperacion').prop('disabled', false);
        } else {
            $("#ActSectEstado").val("");
            $('#ActdateOperacion').val("");
            $('#ActdateOperacion').prop('disabled', true);
        }
        $("#ActSectNivelTesion").val(featureCollection.features[0].properties.ID_NIVEL_TENSION);
        selecracttension(featureCollection.features[0].properties.ID_TENSION_SUB);
        $("#ActInpPorcentajeCarga").val(featureCollection.features[0].properties.PORCENTAJE_CARGA.toFixed(2));
        $("#ActInpCapacidadMVA").val(featureCollection.features[0].properties.CAPACIDAD_MVA);
        $("#ActSectAmpliacion").val(featureCollection.features[0].properties.AMPLIACION);
        $("#ActInpObservacion").val(featureCollection.features[0].properties.OBSERVACION);
    });
}
function ActSubEstacion(ActUbiCP) {
    BootstrapDialog.show({
        title: 'Confirmar',
        message: '¿Esta Seguro de Actualizar la SubEstación?',
        closable: false,
        data: {
            'callback': function (result) {
                if (result) {
                    LyrSubEstacions_T.addFeature(ActUbiCP, function (error, featureCollection, response2) {
                        if (featureCollection.success == true) {
                            MapearSubEstacionAct();
                            msj_exito("Se Actualizo de la SubEstacion exitosamente!");
                            $("#panel_actualizar").hide(100);
                            return true;
                        } else {
                            msj_peligro("NO SE REALIZO LA OPERACION CON EXITO, REVISE EL SERVIDOR DE MAPAS !");
                            return false;
                        }
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
            }
        }]
    });

}

function ActFeature() {
    var ActUbiCP = FeatureSubEstacionAct;
    ActUbiCP.properties.ACTIVO = 1;
    ActUbiCP.properties.ALTITUD = 0;
    ActUbiCP.properties.AMPLIACION = $("#ActSectAmpliacion").val();
    ActUbiCP.properties.CAPACIDAD_MVA = $("#ActInpCapacidadMVA").val().replace(".", ",");
    ActUbiCP.properties.FECHA_OPERACION = $('#ActdateOperacion').data("DateTimePicker").date().format('DD/MM/YYYY');
    ActUbiCP.properties.ID_ESTADO_SUB = $("#ActSectEstado").val();
    ActUbiCP.properties.LONGITUD = ActUbiCP.geometry.coordinates[0];
    ActUbiCP.properties.LATITUD = ActUbiCP.geometry.coordinates[1];
    ActUbiCP.properties.ID_NIVEL_TENSION = $("#ActSectNivelTesion").val();
    ActUbiCP.properties.NOM_SUBESTACION = $("#ActInpNomCP").val().toUpperCase();
    ActUbiCP.properties.OBSERVACION = $("#ActInpObservacion").val();
    ActUbiCP.properties.PORCENTAJE_CARGA = $("#ActInpPorcentajeCarga").val().replace(".", ",");
    ActUbiCP.properties.ID_TENSION_SUB = $("#ActSectTensionSub").val();
    ActUbiCP.properties.FECHA_CREACION = moment().format('DD/MM/YYYY h:mm:ss a');
    ActUbiCP.properties.ID_USUARIO_VALIDA = 0;
    ActUbiCP.properties.ACTUALIZACION = 1;
    ActUbiCP.properties.FECHA_VALIDACION = null;
    ActSubEstacion(ActUbiCP);
}
function SaveFeatureAct() {
    if (ValidarFeature("Act")) {
        ActFeature();
    }
}
$('#ActdateOperacion').datetimepicker({
    format: 'DD/MM/YYYY',
    locale: 'es'
});

function selecracttension(nivel) {
    var niveltension = $('#ActSectNivelTesion').val();
    $('#ActSectTensionSub').empty();
    if (niveltension != "") {
        $("#ActSectTensionSub").append('<option value=""></option>');
        $.each(json_tension.features, function (index, value) {
            if (value.properties.ID_NIVEL_TENSION == niveltension) {
                if (value.properties.ID_TENSION == nivel) {
                    $("#ActSectTensionSub").append('<option value="' + value.properties.ID_TENSION + '" selected>' + value.properties.DESCRIPCION + '</option>');
                } else {
                    $("#ActSectTensionSub").append('<option value="' + value.properties.ID_TENSION + '" >' + value.properties.DESCRIPCION + '</option>');
                }
            }
        });
    }
};



function BorrarActualizacion(id) {
    BootstrapDialog.show({
        title: 'Confirmar',
        message: '¿Esta Seguro de que desea borrar la actualización?',
        closable: false,
        data: {
            'callback': function (result) {
                if (result) {
                    LyrSubEstacions_T.deleteFeature(id, function (error, featureCollection, response2) {
                        //console.log(featureCollection);
                        if (featureCollection.success == true) {
                            MapearSubEstacionActList();
                            msj_exito("Se ELIMINO exitosamente la actualización!");
                            return true;
                        } else {
                            msj_peligro("NO SE REALIZO EL PROCESO CON EXITO, REVISE EL SERVIDOR DE MAPAS!");
                            return false;
                        }
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
            }
        }]
    });

}
$("#Actualizar").click(function () {
    if (map.hasLayer(CPCluster)) {
        map.removeLayer(CPCluster);
    }
    MapearSubEstacionAct();
    $(".legend").show();
    $("#FormCPPgn0").addClass("hide");
    $("#FormCPPgn1Act").removeClass("hide");
});

$("#MisActualiciones").click(function () {
    if (map.hasLayer(CPCluster)) {
        map.removeLayer(CPCluster);
    }
    MapearSubEstacionActList();
    $(".legend").show();
    $("#FormCPPgn0").addClass("hide");
    $("#FormCPPgn2Actlist").removeClass("hide");
});


function LimpiarAct() {
    if (map.hasLayer(lyrSubEstacionsApro)) {
        map.removeLayer(lyrSubEstacionsApro);
    }
    $("#DivListaAct").empty();
    $("#DivListaAct").append('<div class="btn-group-vertical" role="group" id="ListaSubEstacionsAct" style="max-height:200px;overflow:scroll;"></div>');
}
function LimpiarActValid() {
    if (map.hasLayer(lyrSubEstacionsApro)) {
        map.removeLayer(lyrSubEstacionsApro);
    }
    $("#DivListaActValid").empty();
    $("#DivListaActValid").append('<div class="btn-group-vertical" role="group" id="ListaSubEstacionsActValid" style="max-height:200px;overflow:scroll;"></div>');
}
function CancelarAct() {
    LimpiarAct();
    if (!map.hasLayer(CPCluster)) {
        map.addLayer(CPCluster);
    }
    $("#panel_actualizar").hide(100);
    $("#FormCPPgn0").removeClass("hide");
    $("#FormCPPgn1Act").addClass("hide");
}
function CancelarActValid() {
    LimpiarActValid();
    if (!map.hasLayer(CPCluster)) {
        map.addLayer(CPCluster);
    }
    $("#FormCPPgn0").removeClass("hide");
    $("#FormCPPgn2Actlist").addClass("hide");
}

function CancelActFeature() {
    $("#panel_actualizar").hide();
}