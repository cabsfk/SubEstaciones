function MapearSubEstacionAprobada() {

    SubEstacionEliFind.layers('0');
    SubEstacionEliFind.params.layerDefs = "";
    SubEstacionEliFind.text(id_user).fields('ID_CONTACTO');
    SubEstacionEliFind.run(function (error, featureCollection, response2) {
        var CP, htmlpopup, clase;
        LimpiarAprobado();
        lyrSubEstacionsApro = L.geoJson(featureCollection, {
            pointToLayer: function (feature, latlng) {
                var clase, estilo;
                estilo = geojsonMarkerSubEstacion;
                CP = L.marker(latlng, estilo).bindLabel(feature.properties.NOM_SUBESTACION, { noHide: false, offset: [20, -45] });
                var htmlBotones = '';
                var htmlpopup = ContPopUP(feature, latlng, htmlBotones);
                CP.bindPopup(htmlpopup); 
                $("#ListaSubEstacionsApro").prepend('<div class="rowprueba"><button type="button"  class="btn btn-default" style=" width: 280px;" onclick="clickmap(' + feature.properties.OBJECTID + ',\'lyrSubEstacionApro\')">' + feature.properties.NOM_SUBESTACION + '</button></div>');
                return CP;
            }
        });

        lyrSubEstacionsApro.addTo(map);
        $('#ListaSubEstacionsApro').searchable({
            searchField: '#container-search-Apro',
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
function MapearSubEstacionEli() {

    SubEstacionEliFind.layers('1');
    SubEstacionEliFind.params.layerDefs = "1:ACTIVO=1 AND ACTUALIZACION=0";
    SubEstacionEliFind.text(id_user).fields('iD_CONTACTO');
    SubEstacionEliFind.run(function (error, featureCollection, response2) {
        var CP, htmlpopup, clase;
        LimpiarBorrado();
        lyrSubEstacionsT = L.geoJson(featureCollection, {
            pointToLayer: function (feature, latlng) {
                var clase, estilo;
                estilo = geojsonMarkerSubEstacionEdit;
                CP = L.marker(latlng, estilo).bindLabel(feature.properties.NOM_SUBESTACION, { noHide: false, offset: [20, -45] });
                var htmlBotones='<div class="popupstyle">'+
                                    '<button class="btn btn-info pull-left btn-xs " data-toggle="tooltip" data-placement="rigth" title="Editar" type="button" onclick="EditarSubEstacion(' + feature.properties.OBJECTID + ')">' +
                                        '<span class="glyphicon glyphicon-edit" aria-hidden="true"></span>' +
                                    '</button>' +
                                    '<button class="btn btn-danger pull-right btn-xs " data-toggle="tooltip" data-placement="left" title="Borrar" type="button" onclick="BorrarSubEstacion(' + feature.properties.OBJECTID + ')">' +
                                        '<span class="glyphicon glyphicon-ban-circle" aria-hidden="true"></span> ' +
                                    '</button><br>' +
                                '</div>';
                var htmlpopup = ContPopUP(feature, latlng, htmlBotones);
                CP.bindPopup(htmlpopup);
                $("#ListaSubEstacionsEli").prepend('<div class="rowprueba"><button type="button"  class="btn btn-default" style=" width: 280px;" onclick="clickmap(' + feature.properties.OBJECTID + ',\'lyrSubEstacionsT\')">' + feature.properties.NOM_SUBESTACION + '</button></div>');
                return CP;
            }
        });

        lyrSubEstacionsT.addTo(map);
        $('#ListaSubEstacionsEli').searchable({
            searchField: '#container-search-CPELI',
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


function BorrarSubEstacion(id) {
    BootstrapDialog.show({
        title: 'Confirmar',
        message: '¿Esta Seguro de ELIMINAR la SubEstacion?',
        closable: false,
        data: {
            'callback': function (result) {
                if (result) {
                    LyrSubEstacions_T.deleteFeature(id, function (error, featureCollection, response2) {
                        //console.log(featureCollection);
                        if (featureCollection.success == true) {
                            MapearSubEstacionEli();
                            msj_exito("Se ELIMINO la SubEstacion exitosamente!");
                            return true;
                        } else {
                            msj_peligro("NO SE REALIZO , REVISE EL SERVIDOR DE MAPAS !");
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

function EditSubEstacion(EditUbiCP) {
    BootstrapDialog.show({
        title: 'Confirmar',
        message: '¿Esta Seguro de EDITAR la SubEstacion?',
        closable: false,
        data: {
            'callback': function (result) {
                if (result) {
                    LyrSubEstacions_T.updateFeature(EditUbiCP, function (error, featureCollection, response2) {
                        //console.log(featureCollection);
                        if (featureCollection.success == true) {
                            console.log(Nombrepagina);
                            if (Nombrepagina == "Validar") {
                                MapearSubEstacionValid();
                            } else {
                                MapearSubEstacionEli();
                            }

                            msj_exito("Se EDITO la SubEstacion exitosamente!");
                            $("#panel_edicion").hide(100);
                            return true;
                        } else {
                            msj_peligro("NO SE REALIZO LA CREACION CON EXITO, REVISE EL SERVIDOR DE MAPAS !");
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

function EditFeature() {
    var EditUbiCP = FeatureSubEstacionEdit;
    
    EditUbiCP.properties.ACTIVO = 1;
    EditUbiCP.properties.ALTITUD = 0;
    EditUbiCP.properties.AMPLIACION = $("#EditSectAmpliacion").val();
    EditUbiCP.properties.CAPACIDAD_MVA = $("#EditInpCapacidadMVA").val().replace(".", ",");
    EditUbiCP.properties.COD_SUB_UPME = 7;
    EditUbiCP.properties.FECHA_OPERACION = $('#EditdateOperacion').data("DateTimePicker").date().format('DD/MM/YYYY');
    //EditUbiCP.properties.ID_CONTACTO = id_user;
    EditUbiCP.properties.ID_ESTADO_SUB = $("#EditSectEstado").val();
    //EditUbiCP.properties.ID_ORGANIZACION = UsrOrgJson[0].idorganizacion;
    EditUbiCP.properties.ID_SUBESTACION = 0;
    EditUbiCP.properties.LONGITUD = EditUbiCP.geometry.coordinates[0];
    EditUbiCP.properties.LATITUD = EditUbiCP.geometry.coordinates[1];
    EditUbiCP.properties.ID_NIVEL_TENSION = $("#EditSectNivelTesion").val();
    EditUbiCP.properties.NOM_SUBESTACION = $("#EditInpNomCP").val().toUpperCase();
    EditUbiCP.properties.OBSERVACION = $("#EditInpObservacion").val();
    EditUbiCP.properties.PORCENTAJE_CARGA = $("#EditInpPorcentajeCarga").val().replace(".", ",");
    EditUbiCP.properties.ID_TENSION_SUB = $("#EditSectTensionSub").val();
    EditUbiCP.properties.FECHA_CREACION = moment().format('DD/MM/YYYY h:mm:ss a');
    EditUbiCP.properties.ACTUALIZACION = 0;
    
    EditSubEstacion(EditUbiCP);
}




function selecredittension(nivel) {
    var niveltension = $('#EditSectNivelTesion').val();
    $('#EditSectTensionSub').empty();
    if (niveltension != "") {
        $("#EditSectTensionSub").append('<option value=""></option>');
        $.each(json_tension.features, function (index, value) {
            if (value.properties.ID_NIVEL_TENSION == niveltension) {
                if (value.properties.ID_TENSION == nivel) {
                    $("#EditSectTensionSub").append('<option value="' + value.properties.ID_TENSION + '" selected>' + value.properties.DESCRIPCION + '</option>');
                }else{
                    $("#EditSectTensionSub").append('<option value="' + value.properties.ID_TENSION + '" >' + value.properties.DESCRIPCION + '</option>');
                }                
            }
        });
    }
};
function EditarSubEstacion(id_feature) {

    $("#panel_edicion").show(100);
    SubEstacionEditQuery.featureIds(id_feature).run(function (error, featureCollection, response2) {
        FeatureSubEstacionEdit = featureCollection.features[0];
        $("#EditInpNomCP").val(featureCollection.features[0].properties.NOM_SUBESTACION);
        $('#EditdateOperacion').data("DateTimePicker").date(moment(featureCollection.features[0].properties.FECHA_OPERACION).tz("America/Bogota").add(5, 'hours').format('DD/MM/YYYY'));
        $("#EditSectNivelTesion").val(featureCollection.features[0].properties.ID_NIVEL_TENSION);
        selecredittension(featureCollection.features[0].properties.ID_TENSION_SUB);
        $("#EditInpPorcentajeCarga").val(featureCollection.features[0].properties.PORCENTAJE_CARGA);
        $("#EditInpCapacidadMVA").val(featureCollection.features[0].properties.CAPACIDAD_MVA);
        $("#EditSectAmpliacion").val(featureCollection.features[0].properties.AMPLIACION);
        $("#EditSectEstado").val(featureCollection.features[0].properties.ID_ESTADO_SUB);
        $("#EditInpObservacion").val(featureCollection.features[0].properties.OBSERVACION);
    });
}

function SaveFeature() {
    if (ValidarFeature("Edit")) {
        EditFeature();
    }
}
$('#EditdateOperacion').datetimepicker({
    format: 'DD/MM/YYYY',
    locale: 'es'
});
$("#EliminarCP").click(function () {
    if (map.hasLayer(CPCluster)) {
        map.removeLayer(CPCluster);
    }
    MapearSubEstacionAprobada();
    MapearSubEstacionEli();
    $(".legend").show();
    $("#FormCPPgn0").addClass("hide");
    $("#FormCPPgn1Eli").removeClass("hide");
});


$("#panel_edicion").hide();