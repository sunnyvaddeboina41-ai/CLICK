import type { QueryKey, UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import type { DeviceStationState, ErrorResponse, GetRelayStatusParams, HealthStatus, PenaltyStatus, RiderInput, Station, StationAction } from './api.schemas';
import { customFetch } from '../custom-fetch';
import type { ErrorType, BodyType } from '../custom-fetch';
type AwaitedInput<T> = PromiseLike<T> | T;
type Awaited<O> = O extends AwaitedInput<infer T> ? T : never;
type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];
export declare const getHealthCheckUrl: () => string;
/**
 * Returns server health status
 * @summary Health check
 */
export declare const healthCheck: (options?: Parameters<typeof customFetch>[1]) => Promise<HealthStatus>;
export declare const getHealthCheckQueryKey: () => readonly ["/api/healthz"];
export declare const getHealthCheckQueryOptions: <TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData> & {
    queryKey: QueryKey;
};
export type HealthCheckQueryResult = NonNullable<Awaited<ReturnType<typeof healthCheck>>>;
export type HealthCheckQueryError = ErrorType<unknown>;
/**
 * @summary Health check
 */
export declare function useHealthCheck<TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetStationsUrl: () => string;
/**
 * @summary List charging stations
 */
export declare const getStations: (options?: Parameters<typeof customFetch>[1]) => Promise<Station[]>;
export declare const getGetStationsQueryKey: () => readonly ["/api/stations"];
export declare const getGetStationsQueryOptions: <TData = Awaited<ReturnType<typeof getStations>>, TError = ErrorType<ErrorResponse>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getStations>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getStations>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetStationsQueryResult = NonNullable<Awaited<ReturnType<typeof getStations>>>;
export type GetStationsQueryError = ErrorType<ErrorResponse>;
/**
 * @summary List charging stations
 */
export declare function useGetStations<TData = Awaited<ReturnType<typeof getStations>>, TError = ErrorType<ErrorResponse>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getStations>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetStationUrl: (id: number) => string;
/**
 * @summary Get the current state of a charging station
 */
export declare const getStation: (id: number, options?: Parameters<typeof customFetch>[1]) => Promise<Station>;
export declare const getGetStationQueryKey: (id: number) => readonly [`/api/stations/${number}`];
export declare const getGetStationQueryOptions: <TData = Awaited<ReturnType<typeof getStation>>, TError = ErrorType<ErrorResponse>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getStation>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getStation>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetStationQueryResult = NonNullable<Awaited<ReturnType<typeof getStation>>>;
export type GetStationQueryError = ErrorType<ErrorResponse>;
/**
 * @summary Get the current state of a charging station
 */
export declare function useGetStation<TData = Awaited<ReturnType<typeof getStation>>, TError = ErrorType<ErrorResponse>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getStation>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getBookStationUrl: (id: number) => string;
/**
 * @summary Start charging immediately or reserve the next scheduled slot
 */
export declare const bookStation: (id: number, riderInput: RiderInput, options?: Parameters<typeof customFetch>[1]) => Promise<StationAction>;
export declare const getBookStationMutationKey: () => readonly ["bookStation"];
export declare const getBookStationMutationOptions: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof bookStation>>, TError, BookStationMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof bookStation>>, TError, BookStationMutationVariables, TContext>;
export type BookStationMutationResult = NonNullable<Awaited<ReturnType<typeof bookStation>>>;
export type BookStationMutationBody = BodyType<RiderInput>;
export type BookStationMutationError = ErrorType<ErrorResponse>;
export type BookStationMutationVariables = {
    id: number;
    data: BodyType<RiderInput>;
};
/**
* @summary Start charging immediately or reserve the next scheduled slot
*/
export declare const useBookStation: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof bookStation>>, TError, BookStationMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof bookStation>>, TError, BookStationMutationVariables, TContext>;
export declare const getStartReservedChargeUrl: (id: number) => string;
/**
 * @summary Start a reservation after the transition window
 */
export declare const startReservedCharge: (id: number, riderInput: RiderInput, options?: Parameters<typeof customFetch>[1]) => Promise<StationAction>;
export declare const getStartReservedChargeMutationKey: () => readonly ["startReservedCharge"];
export declare const getStartReservedChargeMutationOptions: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof startReservedCharge>>, TError, StartReservedChargeMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof startReservedCharge>>, TError, StartReservedChargeMutationVariables, TContext>;
export type StartReservedChargeMutationResult = NonNullable<Awaited<ReturnType<typeof startReservedCharge>>>;
export type StartReservedChargeMutationBody = BodyType<RiderInput>;
export type StartReservedChargeMutationError = ErrorType<ErrorResponse>;
export type StartReservedChargeMutationVariables = {
    id: number;
    data: BodyType<RiderInput>;
};
/**
* @summary Start a reservation after the transition window
*/
export declare const useStartReservedCharge: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof startReservedCharge>>, TError, StartReservedChargeMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof startReservedCharge>>, TError, StartReservedChargeMutationVariables, TContext>;
export declare const getFinishChargingSessionUrl: (id: number) => string;
/**
 * @summary Finish a charging session and begin the 10-minute buffer
 */
export declare const finishChargingSession: (id: number, riderInput: RiderInput, options?: Parameters<typeof customFetch>[1]) => Promise<StationAction>;
export declare const getFinishChargingSessionMutationKey: () => readonly ["finishChargingSession"];
export declare const getFinishChargingSessionMutationOptions: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof finishChargingSession>>, TError, FinishChargingSessionMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof finishChargingSession>>, TError, FinishChargingSessionMutationVariables, TContext>;
export type FinishChargingSessionMutationResult = NonNullable<Awaited<ReturnType<typeof finishChargingSession>>>;
export type FinishChargingSessionMutationBody = BodyType<RiderInput>;
export type FinishChargingSessionMutationError = ErrorType<ErrorResponse>;
export type FinishChargingSessionMutationVariables = {
    id: number;
    data: BodyType<RiderInput>;
};
/**
* @summary Finish a charging session and begin the 10-minute buffer
*/
export declare const useFinishChargingSession: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof finishChargingSession>>, TError, FinishChargingSessionMutationVariables, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof finishChargingSession>>, TError, FinishChargingSessionMutationVariables, TContext>;
export declare const getGetDeviceStationStateUrl: (id: number) => string;
/**
 * @summary Poll relay and slot state from an ESP32
 */
export declare const getDeviceStationState: (id: number, options?: Parameters<typeof customFetch>[1]) => Promise<DeviceStationState>;
export declare const getGetDeviceStationStateQueryKey: (id: number) => readonly [`/api/device/stations/${number}/state`];
export declare const getGetDeviceStationStateQueryOptions: <TData = Awaited<ReturnType<typeof getDeviceStationState>>, TError = ErrorType<ErrorResponse>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getDeviceStationState>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getDeviceStationState>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetDeviceStationStateQueryResult = NonNullable<Awaited<ReturnType<typeof getDeviceStationState>>>;
export type GetDeviceStationStateQueryError = ErrorType<ErrorResponse>;
/**
 * @summary Poll relay and slot state from an ESP32
 */
export declare function useGetDeviceStationState<TData = Awaited<ReturnType<typeof getDeviceStationState>>, TError = ErrorType<ErrorResponse>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getDeviceStationState>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetRelayStatusUrl: (params: GetRelayStatusParams) => string;
/**
 * @summary Poll relay and slot state using a station query parameter
 */
export declare const getRelayStatus: (params: GetRelayStatusParams, options?: Parameters<typeof customFetch>[1]) => Promise<DeviceStationState>;
export declare const getGetRelayStatusQueryKey: (params?: GetRelayStatusParams) => readonly ["/api/relay-status", ...GetRelayStatusParams[]];
export declare const getGetRelayStatusQueryOptions: <TData = Awaited<ReturnType<typeof getRelayStatus>>, TError = ErrorType<ErrorResponse>>(params: GetRelayStatusParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getRelayStatus>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getRelayStatus>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetRelayStatusQueryResult = NonNullable<Awaited<ReturnType<typeof getRelayStatus>>>;
export type GetRelayStatusQueryError = ErrorType<ErrorResponse>;
/**
 * @summary Poll relay and slot state using a station query parameter
 */
export declare function useGetRelayStatus<TData = Awaited<ReturnType<typeof getRelayStatus>>, TError = ErrorType<ErrorResponse>>(params: GetRelayStatusParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getRelayStatus>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetRiderPenaltyUrl: (riderName: string) => string;
/**
 * @summary Check a rider's no-show cooldown
 */
export declare const getRiderPenalty: (riderName: string, options?: Parameters<typeof customFetch>[1]) => Promise<PenaltyStatus>;
export declare const getGetRiderPenaltyQueryKey: (riderName: string) => readonly [`/api/riders/${string}/penalty`];
export declare const getGetRiderPenaltyQueryOptions: <TData = Awaited<ReturnType<typeof getRiderPenalty>>, TError = ErrorType<ErrorResponse>>(riderName: string, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getRiderPenalty>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getRiderPenalty>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetRiderPenaltyQueryResult = NonNullable<Awaited<ReturnType<typeof getRiderPenalty>>>;
export type GetRiderPenaltyQueryError = ErrorType<ErrorResponse>;
/**
 * @summary Check a rider's no-show cooldown
 */
export declare function useGetRiderPenalty<TData = Awaited<ReturnType<typeof getRiderPenalty>>, TError = ErrorType<ErrorResponse>>(riderName: string, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getRiderPenalty>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export {};
//# sourceMappingURL=api.d.ts.map