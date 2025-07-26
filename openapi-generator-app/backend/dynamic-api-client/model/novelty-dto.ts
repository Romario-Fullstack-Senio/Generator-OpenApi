/**
 * Novedades SICOV
 *
 * Contact: apiteam@swagger.io
 *
 

export interface NoveltyDTO { 
    /**
     * ID novedad
     */
    id?: string;
    /**
     * ID de la estación
     */
    noveltyStId?: string;
    /**
     * Tipo de novedad
     */
    typeNovelty?: string;
    /**
     * Descripción de la novedad
     */
    description?: string;
    /**
     * Información adicional
     */
    others?: string;
    /**
     * ID del despacho
     */
    dispatchId?: string;
    /**
     * ID de registro del usuario
     */
    dispatchIdSt?: string;
    /**
     * Fecha de creación
     */
    dateCreationSt?: string;
    /**
     * Fecha de actualización
     */
    dateUpdateSt?: string;
    /**
     * Estado de la novedad
     */
    stateNoveltySt?: boolean;
    /**
     * Estado general
     */
    state?: string;
}

