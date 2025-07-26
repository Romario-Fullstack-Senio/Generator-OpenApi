/**
 * Novedades SICOV
 * Auto-generated service for managing novelties
 */

import {
  HttpClient,
  HttpContext,
  HttpEvent,
  HttpHeaders,
  HttpParams,
  HttpResponse,
} from '@angular/common/http';
import { Inject, Injectable, Optional } from '@angular/core';
import { Observable } from 'rxjs';
import { CustomHttpParameterCodec } from '../encoder';

import { Configuration } from '../configuration';
import { NoveltyDTO } from '../model/novelty-dto';
import { BASE_PATH } from '../variables';

@Injectable({
  providedIn: 'root',
})
export class NoveltyService {
  protected defaultHeaders = new HttpHeaders();
  protected encoder: CustomHttpParameterCodec;
  protected configuration = new Configuration();

  constructor(
    protected httpClient: HttpClient,
    @Optional() @Inject(BASE_PATH) basePath: string | string[],
    @Optional() configuration?: Configuration
  ) {
    if (configuration) {
      this.configuration = configuration;
    }
    if (typeof this.configuration.basePath !== 'string') {
      if (Array.isArray(basePath) && basePath.length > 0) {
        this.configuration.basePath = basePath[0];
      }
      if (typeof basePath === 'string') {
        this.configuration.basePath = basePath;
      }
    }
    this.encoder = new CustomHttpParameterCodec();
  }

  /**
   * Add to HttpParams with proper type conversion
   */
  private addToHttpParams(
    httpParams: HttpParams,
    value: any,
    key?: string
  ): HttpParams {
    if (typeof value === 'object' && value instanceof Date === false) {
      httpParams = this.addToHttpParamsRecursive(httpParams, value);
    } else {
      httpParams = this.addToHttpParamsRecursive(httpParams, value, key);
    }
    return httpParams;
  }

  private addToHttpParamsRecursive(
    httpParams: HttpParams,
    value?: any,
    key?: string
  ): HttpParams {
    if (value == null) {
      return httpParams;
    }

    if (typeof value === 'object') {
      if (Array.isArray(value)) {
        (value as any[]).forEach(
          (elem) =>
            (httpParams = this.addToHttpParamsRecursive(httpParams, elem, key))
        );
      } else if (value instanceof Date) {
        if (key != null) {
          httpParams = httpParams.append(
            key,
            (value as Date).toISOString().substr(0, 10)
          );
        }
      } else {
        Object.keys(value).forEach(
          (k) =>
            (httpParams = this.addToHttpParamsRecursive(
              httpParams,
              value[k],
              key != null ? `${key}.${k}` : k
            ))
        );
      }
    } else if (key != null) {
      httpParams = httpParams.append(key, value);
    }
    return httpParams;
  }

  /**
   * Crear novedad
   * Solicitud para crear la novedad
   * @param noveltyDTO Crear las novedades
   * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
   * @param reportProgress flag to report request and response progress.
   */
  public createNovelty(
    noveltyDTO: NoveltyDTO,
    observe?: 'body',
    reportProgress?: boolean,
    options?: {
      httpHeaderAccept?: 'application/json';
      context?: HttpContext;
      transferCache?: boolean;
    }
  ): Observable<NoveltyDTO>;
  public createNovelty(
    noveltyDTO: NoveltyDTO,
    observe?: 'response',
    reportProgress?: boolean,
    options?: {
      httpHeaderAccept?: 'application/json';
      context?: HttpContext;
      transferCache?: boolean;
    }
  ): Observable<HttpResponse<NoveltyDTO>>;
  public createNovelty(
    noveltyDTO: NoveltyDTO,
    observe?: 'events',
    reportProgress?: boolean,
    options?: {
      httpHeaderAccept?: 'application/json';
      context?: HttpContext;
      transferCache?: boolean;
    }
  ): Observable<HttpEvent<NoveltyDTO>>;
  public createNovelty(
    noveltyDTO: NoveltyDTO,
    observe: any = 'body',
    reportProgress: boolean = false,
    options?: {
      httpHeaderAccept?: 'application/json';
      context?: HttpContext;
      transferCache?: boolean;
    }
  ): Observable<any> {
    if (noveltyDTO === null || noveltyDTO === undefined) {
      throw new Error(
        'Required parameter noveltyDTO was null or undefined when calling createNovelty.'
      );
    }

    let localVarHeaders = this.defaultHeaders;

    // authentication (bearerAuth) required
    localVarHeaders = this.configuration.addCredentialToHeaders(
      'bearerAuth',
      'Authorization',
      localVarHeaders,
      'Bearer '
    );

    const localVarHttpHeaderAcceptSelected: string | undefined =
      options?.httpHeaderAccept ??
      this.configuration.selectHeaderAccept(['application/json']);
    if (localVarHttpHeaderAcceptSelected !== undefined) {
      localVarHeaders = localVarHeaders.set(
        'Accept',
        localVarHttpHeaderAcceptSelected
      );
    }

    const localVarHttpContext: HttpContext =
      options?.context ?? new HttpContext();

    const localVarTransferCache: boolean = options?.transferCache ?? true;

    // to determine the Content-Type header
    const consumes: string[] = ['application/json'];
    const httpContentTypeSelected: string | undefined =
      this.configuration.selectHeaderContentType(consumes);
    if (httpContentTypeSelected !== undefined) {
      localVarHeaders = localVarHeaders.set(
        'Content-Type',
        httpContentTypeSelected
      );
    }

    let responseType_: 'text' | 'json' | 'blob' = 'json';
    if (localVarHttpHeaderAcceptSelected) {
      if (localVarHttpHeaderAcceptSelected.startsWith('text')) {
        responseType_ = 'text';
      } else if (
        this.configuration.isJsonMime(localVarHttpHeaderAcceptSelected)
      ) {
        responseType_ = 'json';
      } else {
        responseType_ = 'blob';
      }
    }

    let localVarPath = `/novelty/`;
    const { basePath, withCredentials } = this.configuration;
    return this.httpClient.request<NoveltyDTO>(
      'post',
      `${basePath}${localVarPath}`,
      {
        context: localVarHttpContext,
        body: noveltyDTO,
        responseType: <any>responseType_,
        ...(withCredentials ? { withCredentials } : {}),
        headers: localVarHeaders,
        observe: observe,
        transferCache: localVarTransferCache,
        reportProgress: reportProgress,
      }
    );
  }

  /**
   * Consulta de novedades
   * @param filter Filtrar las novedades. Claves de los criterios de búsqueda:  * &#x60;IDENTIFIER&#x60; - Código nodevades  * &#x60;IDENTIFIER_ST&#x60; - Código identifacion
   * @param paging Parámetros de paginado. Enumeración de las posibles propiedades:  * &#x60;index&#x60; - Número de página de resultados.  * &#x60;size&#x60; - Tamaño de la página de resultados - Mínimo 5, Máximo 100.
   * @param sorting Parametro para el ordenamiento:  * &#x60;asc&#x60; - Asendente .  * &#x60;dsc&#x60; - Desendente.
   * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
   * @param reportProgress flag to report request and response progress.
   */
  public getAllNovelties(
    filter?: { [key: string]: string },
    paging?: { [key: string]: string },
    sorting?: { [key: string]: string },
    observe?: 'body',
    reportProgress?: boolean,
    options?: {
      httpHeaderAccept?: 'application/json';
      context?: HttpContext;
      transferCache?: boolean;
    }
  ): Observable<Array<NoveltyDTO>>;
  public getAllNovelties(
    filter?: { [key: string]: string },
    paging?: { [key: string]: string },
    sorting?: { [key: string]: string },
    observe?: 'response',
    reportProgress?: boolean,
    options?: {
      httpHeaderAccept?: 'application/json';
      context?: HttpContext;
      transferCache?: boolean;
    }
  ): Observable<HttpResponse<Array<NoveltyDTO>>>;
  public getAllNovelties(
    filter?: { [key: string]: string },
    paging?: { [key: string]: string },
    sorting?: { [key: string]: string },
    observe?: 'events',
    reportProgress?: boolean,
    options?: {
      httpHeaderAccept?: 'application/json';
      context?: HttpContext;
      transferCache?: boolean;
    }
  ): Observable<HttpEvent<Array<NoveltyDTO>>>;
  public getAllNovelties(
    filter?: { [key: string]: string },
    paging?: { [key: string]: string },
    sorting?: { [key: string]: string },
    observe: any = 'body',
    reportProgress: boolean = false,
    options?: {
      httpHeaderAccept?: 'application/json';
      context?: HttpContext;
      transferCache?: boolean;
    }
  ): Observable<any> {
    let localVarQueryParameters = new HttpParams({ encoder: this.encoder });
    localVarQueryParameters = this.addToHttpParams(
      localVarQueryParameters,
      <any>filter,
      'filter'
    );
    localVarQueryParameters = this.addToHttpParams(
      localVarQueryParameters,
      <any>paging,
      'paging'
    );
    localVarQueryParameters = this.addToHttpParams(
      localVarQueryParameters,
      <any>sorting,
      'sorting'
    );

    let localVarHeaders = this.defaultHeaders;

    // authentication (bearerAuth) required
    localVarHeaders = this.configuration.addCredentialToHeaders(
      'bearerAuth',
      'Authorization',
      localVarHeaders,
      'Bearer '
    );

    const localVarHttpHeaderAcceptSelected: string | undefined =
      options?.httpHeaderAccept ??
      this.configuration.selectHeaderAccept(['application/json']);
    if (localVarHttpHeaderAcceptSelected !== undefined) {
      localVarHeaders = localVarHeaders.set(
        'Accept',
        localVarHttpHeaderAcceptSelected
      );
    }

    const localVarHttpContext: HttpContext =
      options?.context ?? new HttpContext();

    const localVarTransferCache: boolean = options?.transferCache ?? true;

    let responseType_: 'text' | 'json' | 'blob' = 'json';
    if (localVarHttpHeaderAcceptSelected) {
      if (localVarHttpHeaderAcceptSelected.startsWith('text')) {
        responseType_ = 'text';
      } else if (
        this.configuration.isJsonMime(localVarHttpHeaderAcceptSelected)
      ) {
        responseType_ = 'json';
      } else {
        responseType_ = 'blob';
      }
    }

    let localVarPath = `/novelty/`;
    const { basePath, withCredentials } = this.configuration;
    return this.httpClient.request<Array<NoveltyDTO>>(
      'get',
      `${basePath}${localVarPath}`,
      {
        context: localVarHttpContext,
        params: localVarQueryParameters,
        responseType: <any>responseType_,
        ...(withCredentials ? { withCredentials } : {}),
        headers: localVarHeaders,
        observe: observe,
        transferCache: localVarTransferCache,
        reportProgress: reportProgress,
      }
    );
  }

  /**
   * Actualizar la novedad
   * @param id Parámetro de código general de identificación de un recurso.
   * @param noveltyDTO Datos: idEstacion, idCarril, idTransaccion, fechaRec
   * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
   * @param reportProgress flag to report request and response progress.
   */
  public updateNovelty(
    id: string,
    noveltyDTO: NoveltyDTO,
    observe?: 'body',
    reportProgress?: boolean,
    options?: {
      httpHeaderAccept?: 'application/json';
      context?: HttpContext;
      transferCache?: boolean;
    }
  ): Observable<NoveltyDTO>;
  public updateNovelty(
    id: string,
    noveltyDTO: NoveltyDTO,
    observe?: 'response',
    reportProgress?: boolean,
    options?: {
      httpHeaderAccept?: 'application/json';
      context?: HttpContext;
      transferCache?: boolean;
    }
  ): Observable<HttpResponse<NoveltyDTO>>;
  public updateNovelty(
    id: string,
    noveltyDTO: NoveltyDTO,
    observe?: 'events',
    reportProgress?: boolean,
    options?: {
      httpHeaderAccept?: 'application/json';
      context?: HttpContext;
      transferCache?: boolean;
    }
  ): Observable<HttpEvent<NoveltyDTO>>;
  public updateNovelty(
    id: string,
    noveltyDTO: NoveltyDTO,
    observe: any = 'body',
    reportProgress: boolean = false,
    options?: {
      httpHeaderAccept?: 'application/json';
      context?: HttpContext;
      transferCache?: boolean;
    }
  ): Observable<any> {
    if (id === null || id === undefined) {
      throw new Error(
        'Required parameter id was null or undefined when calling updateNovelty.'
      );
    }
    if (noveltyDTO === null || noveltyDTO === undefined) {
      throw new Error(
        'Required parameter noveltyDTO was null or undefined when calling updateNovelty.'
      );
    }

    let localVarHeaders = this.defaultHeaders;

    // authentication (bearerAuth) required
    localVarHeaders = this.configuration.addCredentialToHeaders(
      'bearerAuth',
      'Authorization',
      localVarHeaders,
      'Bearer '
    );

    const localVarHttpHeaderAcceptSelected: string | undefined =
      options?.httpHeaderAccept ??
      this.configuration.selectHeaderAccept(['application/json']);
    if (localVarHttpHeaderAcceptSelected !== undefined) {
      localVarHeaders = localVarHeaders.set(
        'Accept',
        localVarHttpHeaderAcceptSelected
      );
    }

    const localVarHttpContext: HttpContext =
      options?.context ?? new HttpContext();

    const localVarTransferCache: boolean = options?.transferCache ?? true;

    // to determine the Content-Type header
    const consumes: string[] = ['application/json'];
    const httpContentTypeSelected: string | undefined =
      this.configuration.selectHeaderContentType(consumes);
    if (httpContentTypeSelected !== undefined) {
      localVarHeaders = localVarHeaders.set(
        'Content-Type',
        httpContentTypeSelected
      );
    }

    let responseType_: 'text' | 'json' | 'blob' = 'json';
    if (localVarHttpHeaderAcceptSelected) {
      if (localVarHttpHeaderAcceptSelected.startsWith('text')) {
        responseType_ = 'text';
      } else if (
        this.configuration.isJsonMime(localVarHttpHeaderAcceptSelected)
      ) {
        responseType_ = 'json';
      } else {
        responseType_ = 'blob';
      }
    }

    let localVarPath = `/novelty/${this.configuration.encodeParam({
      name: 'id',
      value: id,
      in: 'path',
      style: 'simple',
      explode: false,
      dataType: 'string',
      dataFormat: undefined,
    })}`;
    const { basePath, withCredentials } = this.configuration;
    return this.httpClient.request<NoveltyDTO>(
      'put',
      `${basePath}${localVarPath}`,
      {
        context: localVarHttpContext,
        body: noveltyDTO,
        responseType: <any>responseType_,
        ...(withCredentials ? { withCredentials } : {}),
        headers: localVarHeaders,
        observe: observe,
        transferCache: localVarTransferCache,
        reportProgress: reportProgress,
      }
    );
  }
}
