
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model OpportunityZoneCache
 * 
 */
export type OpportunityZoneCache = $Result.DefaultSelection<Prisma.$OpportunityZoneCachePayload>
/**
 * Model GeocodingCache
 * 
 */
export type GeocodingCache = $Result.DefaultSelection<Prisma.$GeocodingCachePayload>

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more OpportunityZoneCaches
 * const opportunityZoneCaches = await prisma.opportunityZoneCache.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more OpportunityZoneCaches
   * const opportunityZoneCaches = await prisma.opportunityZoneCache.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

  /**
   * Add a middleware
   * @deprecated since 4.16.0. For new code, prefer client extensions instead.
   * @see https://pris.ly/d/extensions
   */
  $use(cb: Prisma.Middleware): void

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.opportunityZoneCache`: Exposes CRUD operations for the **OpportunityZoneCache** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more OpportunityZoneCaches
    * const opportunityZoneCaches = await prisma.opportunityZoneCache.findMany()
    * ```
    */
  get opportunityZoneCache(): Prisma.OpportunityZoneCacheDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.geocodingCache`: Exposes CRUD operations for the **GeocodingCache** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more GeocodingCaches
    * const geocodingCaches = await prisma.geocodingCache.findMany()
    * ```
    */
  get geocodingCache(): Prisma.GeocodingCacheDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 6.10.1
   * Query Engine version: 9b628578b3b7cae625e8c927178f15a170e74a9c
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    OpportunityZoneCache: 'OpportunityZoneCache',
    GeocodingCache: 'GeocodingCache'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "opportunityZoneCache" | "geocodingCache"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      OpportunityZoneCache: {
        payload: Prisma.$OpportunityZoneCachePayload<ExtArgs>
        fields: Prisma.OpportunityZoneCacheFieldRefs
        operations: {
          findUnique: {
            args: Prisma.OpportunityZoneCacheFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OpportunityZoneCachePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.OpportunityZoneCacheFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OpportunityZoneCachePayload>
          }
          findFirst: {
            args: Prisma.OpportunityZoneCacheFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OpportunityZoneCachePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.OpportunityZoneCacheFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OpportunityZoneCachePayload>
          }
          findMany: {
            args: Prisma.OpportunityZoneCacheFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OpportunityZoneCachePayload>[]
          }
          create: {
            args: Prisma.OpportunityZoneCacheCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OpportunityZoneCachePayload>
          }
          createMany: {
            args: Prisma.OpportunityZoneCacheCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.OpportunityZoneCacheCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OpportunityZoneCachePayload>[]
          }
          delete: {
            args: Prisma.OpportunityZoneCacheDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OpportunityZoneCachePayload>
          }
          update: {
            args: Prisma.OpportunityZoneCacheUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OpportunityZoneCachePayload>
          }
          deleteMany: {
            args: Prisma.OpportunityZoneCacheDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.OpportunityZoneCacheUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.OpportunityZoneCacheUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OpportunityZoneCachePayload>[]
          }
          upsert: {
            args: Prisma.OpportunityZoneCacheUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OpportunityZoneCachePayload>
          }
          aggregate: {
            args: Prisma.OpportunityZoneCacheAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateOpportunityZoneCache>
          }
          groupBy: {
            args: Prisma.OpportunityZoneCacheGroupByArgs<ExtArgs>
            result: $Utils.Optional<OpportunityZoneCacheGroupByOutputType>[]
          }
          count: {
            args: Prisma.OpportunityZoneCacheCountArgs<ExtArgs>
            result: $Utils.Optional<OpportunityZoneCacheCountAggregateOutputType> | number
          }
        }
      }
      GeocodingCache: {
        payload: Prisma.$GeocodingCachePayload<ExtArgs>
        fields: Prisma.GeocodingCacheFieldRefs
        operations: {
          findUnique: {
            args: Prisma.GeocodingCacheFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GeocodingCachePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.GeocodingCacheFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GeocodingCachePayload>
          }
          findFirst: {
            args: Prisma.GeocodingCacheFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GeocodingCachePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.GeocodingCacheFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GeocodingCachePayload>
          }
          findMany: {
            args: Prisma.GeocodingCacheFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GeocodingCachePayload>[]
          }
          create: {
            args: Prisma.GeocodingCacheCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GeocodingCachePayload>
          }
          createMany: {
            args: Prisma.GeocodingCacheCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.GeocodingCacheCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GeocodingCachePayload>[]
          }
          delete: {
            args: Prisma.GeocodingCacheDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GeocodingCachePayload>
          }
          update: {
            args: Prisma.GeocodingCacheUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GeocodingCachePayload>
          }
          deleteMany: {
            args: Prisma.GeocodingCacheDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.GeocodingCacheUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.GeocodingCacheUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GeocodingCachePayload>[]
          }
          upsert: {
            args: Prisma.GeocodingCacheUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GeocodingCachePayload>
          }
          aggregate: {
            args: Prisma.GeocodingCacheAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateGeocodingCache>
          }
          groupBy: {
            args: Prisma.GeocodingCacheGroupByArgs<ExtArgs>
            result: $Utils.Optional<GeocodingCacheGroupByOutputType>[]
          }
          count: {
            args: Prisma.GeocodingCacheCountArgs<ExtArgs>
            result: $Utils.Optional<GeocodingCacheCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Defaults to stdout
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events
     * log: [
     *   { emit: 'stdout', level: 'query' },
     *   { emit: 'stdout', level: 'info' },
     *   { emit: 'stdout', level: 'warn' }
     *   { emit: 'stdout', level: 'error' }
     * ]
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
  }
  export type GlobalOmitConfig = {
    opportunityZoneCache?: OpportunityZoneCacheOmit
    geocodingCache?: GeocodingCacheOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type GetLogType<T extends LogLevel | LogDefinition> = T extends LogDefinition ? T['emit'] extends 'event' ? T['level'] : never : never
  export type GetEvents<T extends any> = T extends Array<LogLevel | LogDefinition> ?
    GetLogType<T[0]> | GetLogType<T[1]> | GetLogType<T[2]> | GetLogType<T[3]>
    : never

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  /**
   * These options are being passed into the middleware as "params"
   */
  export type MiddlewareParams = {
    model?: ModelName
    action: PrismaAction
    args: any
    dataPath: string[]
    runInTransaction: boolean
  }

  /**
   * The `T` type makes sure, that the `return proceed` is not forgotten in the middleware implementation
   */
  export type Middleware<T = any> = (
    params: MiddlewareParams,
    next: (params: MiddlewareParams) => $Utils.JsPromise<T>,
  ) => $Utils.JsPromise<T>

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */



  /**
   * Models
   */

  /**
   * Model OpportunityZoneCache
   */

  export type AggregateOpportunityZoneCache = {
    _count: OpportunityZoneCacheCountAggregateOutputType | null
    _avg: OpportunityZoneCacheAvgAggregateOutputType | null
    _sum: OpportunityZoneCacheSumAggregateOutputType | null
    _min: OpportunityZoneCacheMinAggregateOutputType | null
    _max: OpportunityZoneCacheMaxAggregateOutputType | null
  }

  export type OpportunityZoneCacheAvgAggregateOutputType = {
    featureCount: number | null
  }

  export type OpportunityZoneCacheSumAggregateOutputType = {
    featureCount: number | null
  }

  export type OpportunityZoneCacheMinAggregateOutputType = {
    id: string | null
    version: string | null
    lastUpdated: Date | null
    featureCount: number | null
    nextRefresh: Date | null
    dataHash: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type OpportunityZoneCacheMaxAggregateOutputType = {
    id: string | null
    version: string | null
    lastUpdated: Date | null
    featureCount: number | null
    nextRefresh: Date | null
    dataHash: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type OpportunityZoneCacheCountAggregateOutputType = {
    id: number
    version: number
    lastUpdated: number
    featureCount: number
    nextRefresh: number
    dataHash: number
    geoJsonData: number
    spatialIndex: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type OpportunityZoneCacheAvgAggregateInputType = {
    featureCount?: true
  }

  export type OpportunityZoneCacheSumAggregateInputType = {
    featureCount?: true
  }

  export type OpportunityZoneCacheMinAggregateInputType = {
    id?: true
    version?: true
    lastUpdated?: true
    featureCount?: true
    nextRefresh?: true
    dataHash?: true
    createdAt?: true
    updatedAt?: true
  }

  export type OpportunityZoneCacheMaxAggregateInputType = {
    id?: true
    version?: true
    lastUpdated?: true
    featureCount?: true
    nextRefresh?: true
    dataHash?: true
    createdAt?: true
    updatedAt?: true
  }

  export type OpportunityZoneCacheCountAggregateInputType = {
    id?: true
    version?: true
    lastUpdated?: true
    featureCount?: true
    nextRefresh?: true
    dataHash?: true
    geoJsonData?: true
    spatialIndex?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type OpportunityZoneCacheAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which OpportunityZoneCache to aggregate.
     */
    where?: OpportunityZoneCacheWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OpportunityZoneCaches to fetch.
     */
    orderBy?: OpportunityZoneCacheOrderByWithRelationInput | OpportunityZoneCacheOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: OpportunityZoneCacheWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OpportunityZoneCaches from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OpportunityZoneCaches.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned OpportunityZoneCaches
    **/
    _count?: true | OpportunityZoneCacheCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: OpportunityZoneCacheAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: OpportunityZoneCacheSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: OpportunityZoneCacheMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: OpportunityZoneCacheMaxAggregateInputType
  }

  export type GetOpportunityZoneCacheAggregateType<T extends OpportunityZoneCacheAggregateArgs> = {
        [P in keyof T & keyof AggregateOpportunityZoneCache]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateOpportunityZoneCache[P]>
      : GetScalarType<T[P], AggregateOpportunityZoneCache[P]>
  }




  export type OpportunityZoneCacheGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: OpportunityZoneCacheWhereInput
    orderBy?: OpportunityZoneCacheOrderByWithAggregationInput | OpportunityZoneCacheOrderByWithAggregationInput[]
    by: OpportunityZoneCacheScalarFieldEnum[] | OpportunityZoneCacheScalarFieldEnum
    having?: OpportunityZoneCacheScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: OpportunityZoneCacheCountAggregateInputType | true
    _avg?: OpportunityZoneCacheAvgAggregateInputType
    _sum?: OpportunityZoneCacheSumAggregateInputType
    _min?: OpportunityZoneCacheMinAggregateInputType
    _max?: OpportunityZoneCacheMaxAggregateInputType
  }

  export type OpportunityZoneCacheGroupByOutputType = {
    id: string
    version: string
    lastUpdated: Date
    featureCount: number
    nextRefresh: Date
    dataHash: string
    geoJsonData: JsonValue
    spatialIndex: JsonValue
    createdAt: Date
    updatedAt: Date
    _count: OpportunityZoneCacheCountAggregateOutputType | null
    _avg: OpportunityZoneCacheAvgAggregateOutputType | null
    _sum: OpportunityZoneCacheSumAggregateOutputType | null
    _min: OpportunityZoneCacheMinAggregateOutputType | null
    _max: OpportunityZoneCacheMaxAggregateOutputType | null
  }

  type GetOpportunityZoneCacheGroupByPayload<T extends OpportunityZoneCacheGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<OpportunityZoneCacheGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof OpportunityZoneCacheGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], OpportunityZoneCacheGroupByOutputType[P]>
            : GetScalarType<T[P], OpportunityZoneCacheGroupByOutputType[P]>
        }
      >
    >


  export type OpportunityZoneCacheSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    version?: boolean
    lastUpdated?: boolean
    featureCount?: boolean
    nextRefresh?: boolean
    dataHash?: boolean
    geoJsonData?: boolean
    spatialIndex?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["opportunityZoneCache"]>

  export type OpportunityZoneCacheSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    version?: boolean
    lastUpdated?: boolean
    featureCount?: boolean
    nextRefresh?: boolean
    dataHash?: boolean
    geoJsonData?: boolean
    spatialIndex?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["opportunityZoneCache"]>

  export type OpportunityZoneCacheSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    version?: boolean
    lastUpdated?: boolean
    featureCount?: boolean
    nextRefresh?: boolean
    dataHash?: boolean
    geoJsonData?: boolean
    spatialIndex?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["opportunityZoneCache"]>

  export type OpportunityZoneCacheSelectScalar = {
    id?: boolean
    version?: boolean
    lastUpdated?: boolean
    featureCount?: boolean
    nextRefresh?: boolean
    dataHash?: boolean
    geoJsonData?: boolean
    spatialIndex?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type OpportunityZoneCacheOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "version" | "lastUpdated" | "featureCount" | "nextRefresh" | "dataHash" | "geoJsonData" | "spatialIndex" | "createdAt" | "updatedAt", ExtArgs["result"]["opportunityZoneCache"]>

  export type $OpportunityZoneCachePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "OpportunityZoneCache"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      version: string
      lastUpdated: Date
      featureCount: number
      nextRefresh: Date
      dataHash: string
      geoJsonData: Prisma.JsonValue
      spatialIndex: Prisma.JsonValue
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["opportunityZoneCache"]>
    composites: {}
  }

  type OpportunityZoneCacheGetPayload<S extends boolean | null | undefined | OpportunityZoneCacheDefaultArgs> = $Result.GetResult<Prisma.$OpportunityZoneCachePayload, S>

  type OpportunityZoneCacheCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<OpportunityZoneCacheFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: OpportunityZoneCacheCountAggregateInputType | true
    }

  export interface OpportunityZoneCacheDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['OpportunityZoneCache'], meta: { name: 'OpportunityZoneCache' } }
    /**
     * Find zero or one OpportunityZoneCache that matches the filter.
     * @param {OpportunityZoneCacheFindUniqueArgs} args - Arguments to find a OpportunityZoneCache
     * @example
     * // Get one OpportunityZoneCache
     * const opportunityZoneCache = await prisma.opportunityZoneCache.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends OpportunityZoneCacheFindUniqueArgs>(args: SelectSubset<T, OpportunityZoneCacheFindUniqueArgs<ExtArgs>>): Prisma__OpportunityZoneCacheClient<$Result.GetResult<Prisma.$OpportunityZoneCachePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one OpportunityZoneCache that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {OpportunityZoneCacheFindUniqueOrThrowArgs} args - Arguments to find a OpportunityZoneCache
     * @example
     * // Get one OpportunityZoneCache
     * const opportunityZoneCache = await prisma.opportunityZoneCache.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends OpportunityZoneCacheFindUniqueOrThrowArgs>(args: SelectSubset<T, OpportunityZoneCacheFindUniqueOrThrowArgs<ExtArgs>>): Prisma__OpportunityZoneCacheClient<$Result.GetResult<Prisma.$OpportunityZoneCachePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first OpportunityZoneCache that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OpportunityZoneCacheFindFirstArgs} args - Arguments to find a OpportunityZoneCache
     * @example
     * // Get one OpportunityZoneCache
     * const opportunityZoneCache = await prisma.opportunityZoneCache.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends OpportunityZoneCacheFindFirstArgs>(args?: SelectSubset<T, OpportunityZoneCacheFindFirstArgs<ExtArgs>>): Prisma__OpportunityZoneCacheClient<$Result.GetResult<Prisma.$OpportunityZoneCachePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first OpportunityZoneCache that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OpportunityZoneCacheFindFirstOrThrowArgs} args - Arguments to find a OpportunityZoneCache
     * @example
     * // Get one OpportunityZoneCache
     * const opportunityZoneCache = await prisma.opportunityZoneCache.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends OpportunityZoneCacheFindFirstOrThrowArgs>(args?: SelectSubset<T, OpportunityZoneCacheFindFirstOrThrowArgs<ExtArgs>>): Prisma__OpportunityZoneCacheClient<$Result.GetResult<Prisma.$OpportunityZoneCachePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more OpportunityZoneCaches that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OpportunityZoneCacheFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all OpportunityZoneCaches
     * const opportunityZoneCaches = await prisma.opportunityZoneCache.findMany()
     * 
     * // Get first 10 OpportunityZoneCaches
     * const opportunityZoneCaches = await prisma.opportunityZoneCache.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const opportunityZoneCacheWithIdOnly = await prisma.opportunityZoneCache.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends OpportunityZoneCacheFindManyArgs>(args?: SelectSubset<T, OpportunityZoneCacheFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OpportunityZoneCachePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a OpportunityZoneCache.
     * @param {OpportunityZoneCacheCreateArgs} args - Arguments to create a OpportunityZoneCache.
     * @example
     * // Create one OpportunityZoneCache
     * const OpportunityZoneCache = await prisma.opportunityZoneCache.create({
     *   data: {
     *     // ... data to create a OpportunityZoneCache
     *   }
     * })
     * 
     */
    create<T extends OpportunityZoneCacheCreateArgs>(args: SelectSubset<T, OpportunityZoneCacheCreateArgs<ExtArgs>>): Prisma__OpportunityZoneCacheClient<$Result.GetResult<Prisma.$OpportunityZoneCachePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many OpportunityZoneCaches.
     * @param {OpportunityZoneCacheCreateManyArgs} args - Arguments to create many OpportunityZoneCaches.
     * @example
     * // Create many OpportunityZoneCaches
     * const opportunityZoneCache = await prisma.opportunityZoneCache.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends OpportunityZoneCacheCreateManyArgs>(args?: SelectSubset<T, OpportunityZoneCacheCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many OpportunityZoneCaches and returns the data saved in the database.
     * @param {OpportunityZoneCacheCreateManyAndReturnArgs} args - Arguments to create many OpportunityZoneCaches.
     * @example
     * // Create many OpportunityZoneCaches
     * const opportunityZoneCache = await prisma.opportunityZoneCache.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many OpportunityZoneCaches and only return the `id`
     * const opportunityZoneCacheWithIdOnly = await prisma.opportunityZoneCache.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends OpportunityZoneCacheCreateManyAndReturnArgs>(args?: SelectSubset<T, OpportunityZoneCacheCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OpportunityZoneCachePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a OpportunityZoneCache.
     * @param {OpportunityZoneCacheDeleteArgs} args - Arguments to delete one OpportunityZoneCache.
     * @example
     * // Delete one OpportunityZoneCache
     * const OpportunityZoneCache = await prisma.opportunityZoneCache.delete({
     *   where: {
     *     // ... filter to delete one OpportunityZoneCache
     *   }
     * })
     * 
     */
    delete<T extends OpportunityZoneCacheDeleteArgs>(args: SelectSubset<T, OpportunityZoneCacheDeleteArgs<ExtArgs>>): Prisma__OpportunityZoneCacheClient<$Result.GetResult<Prisma.$OpportunityZoneCachePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one OpportunityZoneCache.
     * @param {OpportunityZoneCacheUpdateArgs} args - Arguments to update one OpportunityZoneCache.
     * @example
     * // Update one OpportunityZoneCache
     * const opportunityZoneCache = await prisma.opportunityZoneCache.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends OpportunityZoneCacheUpdateArgs>(args: SelectSubset<T, OpportunityZoneCacheUpdateArgs<ExtArgs>>): Prisma__OpportunityZoneCacheClient<$Result.GetResult<Prisma.$OpportunityZoneCachePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more OpportunityZoneCaches.
     * @param {OpportunityZoneCacheDeleteManyArgs} args - Arguments to filter OpportunityZoneCaches to delete.
     * @example
     * // Delete a few OpportunityZoneCaches
     * const { count } = await prisma.opportunityZoneCache.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends OpportunityZoneCacheDeleteManyArgs>(args?: SelectSubset<T, OpportunityZoneCacheDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more OpportunityZoneCaches.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OpportunityZoneCacheUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many OpportunityZoneCaches
     * const opportunityZoneCache = await prisma.opportunityZoneCache.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends OpportunityZoneCacheUpdateManyArgs>(args: SelectSubset<T, OpportunityZoneCacheUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more OpportunityZoneCaches and returns the data updated in the database.
     * @param {OpportunityZoneCacheUpdateManyAndReturnArgs} args - Arguments to update many OpportunityZoneCaches.
     * @example
     * // Update many OpportunityZoneCaches
     * const opportunityZoneCache = await prisma.opportunityZoneCache.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more OpportunityZoneCaches and only return the `id`
     * const opportunityZoneCacheWithIdOnly = await prisma.opportunityZoneCache.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends OpportunityZoneCacheUpdateManyAndReturnArgs>(args: SelectSubset<T, OpportunityZoneCacheUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OpportunityZoneCachePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one OpportunityZoneCache.
     * @param {OpportunityZoneCacheUpsertArgs} args - Arguments to update or create a OpportunityZoneCache.
     * @example
     * // Update or create a OpportunityZoneCache
     * const opportunityZoneCache = await prisma.opportunityZoneCache.upsert({
     *   create: {
     *     // ... data to create a OpportunityZoneCache
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the OpportunityZoneCache we want to update
     *   }
     * })
     */
    upsert<T extends OpportunityZoneCacheUpsertArgs>(args: SelectSubset<T, OpportunityZoneCacheUpsertArgs<ExtArgs>>): Prisma__OpportunityZoneCacheClient<$Result.GetResult<Prisma.$OpportunityZoneCachePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of OpportunityZoneCaches.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OpportunityZoneCacheCountArgs} args - Arguments to filter OpportunityZoneCaches to count.
     * @example
     * // Count the number of OpportunityZoneCaches
     * const count = await prisma.opportunityZoneCache.count({
     *   where: {
     *     // ... the filter for the OpportunityZoneCaches we want to count
     *   }
     * })
    **/
    count<T extends OpportunityZoneCacheCountArgs>(
      args?: Subset<T, OpportunityZoneCacheCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], OpportunityZoneCacheCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a OpportunityZoneCache.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OpportunityZoneCacheAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends OpportunityZoneCacheAggregateArgs>(args: Subset<T, OpportunityZoneCacheAggregateArgs>): Prisma.PrismaPromise<GetOpportunityZoneCacheAggregateType<T>>

    /**
     * Group by OpportunityZoneCache.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OpportunityZoneCacheGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends OpportunityZoneCacheGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: OpportunityZoneCacheGroupByArgs['orderBy'] }
        : { orderBy?: OpportunityZoneCacheGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, OpportunityZoneCacheGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetOpportunityZoneCacheGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the OpportunityZoneCache model
   */
  readonly fields: OpportunityZoneCacheFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for OpportunityZoneCache.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__OpportunityZoneCacheClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the OpportunityZoneCache model
   */
  interface OpportunityZoneCacheFieldRefs {
    readonly id: FieldRef<"OpportunityZoneCache", 'String'>
    readonly version: FieldRef<"OpportunityZoneCache", 'String'>
    readonly lastUpdated: FieldRef<"OpportunityZoneCache", 'DateTime'>
    readonly featureCount: FieldRef<"OpportunityZoneCache", 'Int'>
    readonly nextRefresh: FieldRef<"OpportunityZoneCache", 'DateTime'>
    readonly dataHash: FieldRef<"OpportunityZoneCache", 'String'>
    readonly geoJsonData: FieldRef<"OpportunityZoneCache", 'Json'>
    readonly spatialIndex: FieldRef<"OpportunityZoneCache", 'Json'>
    readonly createdAt: FieldRef<"OpportunityZoneCache", 'DateTime'>
    readonly updatedAt: FieldRef<"OpportunityZoneCache", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * OpportunityZoneCache findUnique
   */
  export type OpportunityZoneCacheFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OpportunityZoneCache
     */
    select?: OpportunityZoneCacheSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OpportunityZoneCache
     */
    omit?: OpportunityZoneCacheOmit<ExtArgs> | null
    /**
     * Filter, which OpportunityZoneCache to fetch.
     */
    where: OpportunityZoneCacheWhereUniqueInput
  }

  /**
   * OpportunityZoneCache findUniqueOrThrow
   */
  export type OpportunityZoneCacheFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OpportunityZoneCache
     */
    select?: OpportunityZoneCacheSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OpportunityZoneCache
     */
    omit?: OpportunityZoneCacheOmit<ExtArgs> | null
    /**
     * Filter, which OpportunityZoneCache to fetch.
     */
    where: OpportunityZoneCacheWhereUniqueInput
  }

  /**
   * OpportunityZoneCache findFirst
   */
  export type OpportunityZoneCacheFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OpportunityZoneCache
     */
    select?: OpportunityZoneCacheSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OpportunityZoneCache
     */
    omit?: OpportunityZoneCacheOmit<ExtArgs> | null
    /**
     * Filter, which OpportunityZoneCache to fetch.
     */
    where?: OpportunityZoneCacheWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OpportunityZoneCaches to fetch.
     */
    orderBy?: OpportunityZoneCacheOrderByWithRelationInput | OpportunityZoneCacheOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for OpportunityZoneCaches.
     */
    cursor?: OpportunityZoneCacheWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OpportunityZoneCaches from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OpportunityZoneCaches.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of OpportunityZoneCaches.
     */
    distinct?: OpportunityZoneCacheScalarFieldEnum | OpportunityZoneCacheScalarFieldEnum[]
  }

  /**
   * OpportunityZoneCache findFirstOrThrow
   */
  export type OpportunityZoneCacheFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OpportunityZoneCache
     */
    select?: OpportunityZoneCacheSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OpportunityZoneCache
     */
    omit?: OpportunityZoneCacheOmit<ExtArgs> | null
    /**
     * Filter, which OpportunityZoneCache to fetch.
     */
    where?: OpportunityZoneCacheWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OpportunityZoneCaches to fetch.
     */
    orderBy?: OpportunityZoneCacheOrderByWithRelationInput | OpportunityZoneCacheOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for OpportunityZoneCaches.
     */
    cursor?: OpportunityZoneCacheWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OpportunityZoneCaches from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OpportunityZoneCaches.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of OpportunityZoneCaches.
     */
    distinct?: OpportunityZoneCacheScalarFieldEnum | OpportunityZoneCacheScalarFieldEnum[]
  }

  /**
   * OpportunityZoneCache findMany
   */
  export type OpportunityZoneCacheFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OpportunityZoneCache
     */
    select?: OpportunityZoneCacheSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OpportunityZoneCache
     */
    omit?: OpportunityZoneCacheOmit<ExtArgs> | null
    /**
     * Filter, which OpportunityZoneCaches to fetch.
     */
    where?: OpportunityZoneCacheWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OpportunityZoneCaches to fetch.
     */
    orderBy?: OpportunityZoneCacheOrderByWithRelationInput | OpportunityZoneCacheOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing OpportunityZoneCaches.
     */
    cursor?: OpportunityZoneCacheWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OpportunityZoneCaches from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OpportunityZoneCaches.
     */
    skip?: number
    distinct?: OpportunityZoneCacheScalarFieldEnum | OpportunityZoneCacheScalarFieldEnum[]
  }

  /**
   * OpportunityZoneCache create
   */
  export type OpportunityZoneCacheCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OpportunityZoneCache
     */
    select?: OpportunityZoneCacheSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OpportunityZoneCache
     */
    omit?: OpportunityZoneCacheOmit<ExtArgs> | null
    /**
     * The data needed to create a OpportunityZoneCache.
     */
    data: XOR<OpportunityZoneCacheCreateInput, OpportunityZoneCacheUncheckedCreateInput>
  }

  /**
   * OpportunityZoneCache createMany
   */
  export type OpportunityZoneCacheCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many OpportunityZoneCaches.
     */
    data: OpportunityZoneCacheCreateManyInput | OpportunityZoneCacheCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * OpportunityZoneCache createManyAndReturn
   */
  export type OpportunityZoneCacheCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OpportunityZoneCache
     */
    select?: OpportunityZoneCacheSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the OpportunityZoneCache
     */
    omit?: OpportunityZoneCacheOmit<ExtArgs> | null
    /**
     * The data used to create many OpportunityZoneCaches.
     */
    data: OpportunityZoneCacheCreateManyInput | OpportunityZoneCacheCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * OpportunityZoneCache update
   */
  export type OpportunityZoneCacheUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OpportunityZoneCache
     */
    select?: OpportunityZoneCacheSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OpportunityZoneCache
     */
    omit?: OpportunityZoneCacheOmit<ExtArgs> | null
    /**
     * The data needed to update a OpportunityZoneCache.
     */
    data: XOR<OpportunityZoneCacheUpdateInput, OpportunityZoneCacheUncheckedUpdateInput>
    /**
     * Choose, which OpportunityZoneCache to update.
     */
    where: OpportunityZoneCacheWhereUniqueInput
  }

  /**
   * OpportunityZoneCache updateMany
   */
  export type OpportunityZoneCacheUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update OpportunityZoneCaches.
     */
    data: XOR<OpportunityZoneCacheUpdateManyMutationInput, OpportunityZoneCacheUncheckedUpdateManyInput>
    /**
     * Filter which OpportunityZoneCaches to update
     */
    where?: OpportunityZoneCacheWhereInput
    /**
     * Limit how many OpportunityZoneCaches to update.
     */
    limit?: number
  }

  /**
   * OpportunityZoneCache updateManyAndReturn
   */
  export type OpportunityZoneCacheUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OpportunityZoneCache
     */
    select?: OpportunityZoneCacheSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the OpportunityZoneCache
     */
    omit?: OpportunityZoneCacheOmit<ExtArgs> | null
    /**
     * The data used to update OpportunityZoneCaches.
     */
    data: XOR<OpportunityZoneCacheUpdateManyMutationInput, OpportunityZoneCacheUncheckedUpdateManyInput>
    /**
     * Filter which OpportunityZoneCaches to update
     */
    where?: OpportunityZoneCacheWhereInput
    /**
     * Limit how many OpportunityZoneCaches to update.
     */
    limit?: number
  }

  /**
   * OpportunityZoneCache upsert
   */
  export type OpportunityZoneCacheUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OpportunityZoneCache
     */
    select?: OpportunityZoneCacheSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OpportunityZoneCache
     */
    omit?: OpportunityZoneCacheOmit<ExtArgs> | null
    /**
     * The filter to search for the OpportunityZoneCache to update in case it exists.
     */
    where: OpportunityZoneCacheWhereUniqueInput
    /**
     * In case the OpportunityZoneCache found by the `where` argument doesn't exist, create a new OpportunityZoneCache with this data.
     */
    create: XOR<OpportunityZoneCacheCreateInput, OpportunityZoneCacheUncheckedCreateInput>
    /**
     * In case the OpportunityZoneCache was found with the provided `where` argument, update it with this data.
     */
    update: XOR<OpportunityZoneCacheUpdateInput, OpportunityZoneCacheUncheckedUpdateInput>
  }

  /**
   * OpportunityZoneCache delete
   */
  export type OpportunityZoneCacheDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OpportunityZoneCache
     */
    select?: OpportunityZoneCacheSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OpportunityZoneCache
     */
    omit?: OpportunityZoneCacheOmit<ExtArgs> | null
    /**
     * Filter which OpportunityZoneCache to delete.
     */
    where: OpportunityZoneCacheWhereUniqueInput
  }

  /**
   * OpportunityZoneCache deleteMany
   */
  export type OpportunityZoneCacheDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which OpportunityZoneCaches to delete
     */
    where?: OpportunityZoneCacheWhereInput
    /**
     * Limit how many OpportunityZoneCaches to delete.
     */
    limit?: number
  }

  /**
   * OpportunityZoneCache without action
   */
  export type OpportunityZoneCacheDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OpportunityZoneCache
     */
    select?: OpportunityZoneCacheSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OpportunityZoneCache
     */
    omit?: OpportunityZoneCacheOmit<ExtArgs> | null
  }


  /**
   * Model GeocodingCache
   */

  export type AggregateGeocodingCache = {
    _count: GeocodingCacheCountAggregateOutputType | null
    _avg: GeocodingCacheAvgAggregateOutputType | null
    _sum: GeocodingCacheSumAggregateOutputType | null
    _min: GeocodingCacheMinAggregateOutputType | null
    _max: GeocodingCacheMaxAggregateOutputType | null
  }

  export type GeocodingCacheAvgAggregateOutputType = {
    latitude: number | null
    longitude: number | null
  }

  export type GeocodingCacheSumAggregateOutputType = {
    latitude: number | null
    longitude: number | null
  }

  export type GeocodingCacheMinAggregateOutputType = {
    id: string | null
    address: string | null
    latitude: number | null
    longitude: number | null
    displayName: string | null
    expiresAt: Date | null
    createdAt: Date | null
  }

  export type GeocodingCacheMaxAggregateOutputType = {
    id: string | null
    address: string | null
    latitude: number | null
    longitude: number | null
    displayName: string | null
    expiresAt: Date | null
    createdAt: Date | null
  }

  export type GeocodingCacheCountAggregateOutputType = {
    id: number
    address: number
    latitude: number
    longitude: number
    displayName: number
    expiresAt: number
    createdAt: number
    _all: number
  }


  export type GeocodingCacheAvgAggregateInputType = {
    latitude?: true
    longitude?: true
  }

  export type GeocodingCacheSumAggregateInputType = {
    latitude?: true
    longitude?: true
  }

  export type GeocodingCacheMinAggregateInputType = {
    id?: true
    address?: true
    latitude?: true
    longitude?: true
    displayName?: true
    expiresAt?: true
    createdAt?: true
  }

  export type GeocodingCacheMaxAggregateInputType = {
    id?: true
    address?: true
    latitude?: true
    longitude?: true
    displayName?: true
    expiresAt?: true
    createdAt?: true
  }

  export type GeocodingCacheCountAggregateInputType = {
    id?: true
    address?: true
    latitude?: true
    longitude?: true
    displayName?: true
    expiresAt?: true
    createdAt?: true
    _all?: true
  }

  export type GeocodingCacheAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which GeocodingCache to aggregate.
     */
    where?: GeocodingCacheWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of GeocodingCaches to fetch.
     */
    orderBy?: GeocodingCacheOrderByWithRelationInput | GeocodingCacheOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: GeocodingCacheWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` GeocodingCaches from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` GeocodingCaches.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned GeocodingCaches
    **/
    _count?: true | GeocodingCacheCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: GeocodingCacheAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: GeocodingCacheSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: GeocodingCacheMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: GeocodingCacheMaxAggregateInputType
  }

  export type GetGeocodingCacheAggregateType<T extends GeocodingCacheAggregateArgs> = {
        [P in keyof T & keyof AggregateGeocodingCache]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateGeocodingCache[P]>
      : GetScalarType<T[P], AggregateGeocodingCache[P]>
  }




  export type GeocodingCacheGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: GeocodingCacheWhereInput
    orderBy?: GeocodingCacheOrderByWithAggregationInput | GeocodingCacheOrderByWithAggregationInput[]
    by: GeocodingCacheScalarFieldEnum[] | GeocodingCacheScalarFieldEnum
    having?: GeocodingCacheScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: GeocodingCacheCountAggregateInputType | true
    _avg?: GeocodingCacheAvgAggregateInputType
    _sum?: GeocodingCacheSumAggregateInputType
    _min?: GeocodingCacheMinAggregateInputType
    _max?: GeocodingCacheMaxAggregateInputType
  }

  export type GeocodingCacheGroupByOutputType = {
    id: string
    address: string
    latitude: number
    longitude: number
    displayName: string
    expiresAt: Date
    createdAt: Date
    _count: GeocodingCacheCountAggregateOutputType | null
    _avg: GeocodingCacheAvgAggregateOutputType | null
    _sum: GeocodingCacheSumAggregateOutputType | null
    _min: GeocodingCacheMinAggregateOutputType | null
    _max: GeocodingCacheMaxAggregateOutputType | null
  }

  type GetGeocodingCacheGroupByPayload<T extends GeocodingCacheGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<GeocodingCacheGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof GeocodingCacheGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], GeocodingCacheGroupByOutputType[P]>
            : GetScalarType<T[P], GeocodingCacheGroupByOutputType[P]>
        }
      >
    >


  export type GeocodingCacheSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    address?: boolean
    latitude?: boolean
    longitude?: boolean
    displayName?: boolean
    expiresAt?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["geocodingCache"]>

  export type GeocodingCacheSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    address?: boolean
    latitude?: boolean
    longitude?: boolean
    displayName?: boolean
    expiresAt?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["geocodingCache"]>

  export type GeocodingCacheSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    address?: boolean
    latitude?: boolean
    longitude?: boolean
    displayName?: boolean
    expiresAt?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["geocodingCache"]>

  export type GeocodingCacheSelectScalar = {
    id?: boolean
    address?: boolean
    latitude?: boolean
    longitude?: boolean
    displayName?: boolean
    expiresAt?: boolean
    createdAt?: boolean
  }

  export type GeocodingCacheOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "address" | "latitude" | "longitude" | "displayName" | "expiresAt" | "createdAt", ExtArgs["result"]["geocodingCache"]>

  export type $GeocodingCachePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "GeocodingCache"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      address: string
      latitude: number
      longitude: number
      displayName: string
      expiresAt: Date
      createdAt: Date
    }, ExtArgs["result"]["geocodingCache"]>
    composites: {}
  }

  type GeocodingCacheGetPayload<S extends boolean | null | undefined | GeocodingCacheDefaultArgs> = $Result.GetResult<Prisma.$GeocodingCachePayload, S>

  type GeocodingCacheCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<GeocodingCacheFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: GeocodingCacheCountAggregateInputType | true
    }

  export interface GeocodingCacheDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['GeocodingCache'], meta: { name: 'GeocodingCache' } }
    /**
     * Find zero or one GeocodingCache that matches the filter.
     * @param {GeocodingCacheFindUniqueArgs} args - Arguments to find a GeocodingCache
     * @example
     * // Get one GeocodingCache
     * const geocodingCache = await prisma.geocodingCache.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends GeocodingCacheFindUniqueArgs>(args: SelectSubset<T, GeocodingCacheFindUniqueArgs<ExtArgs>>): Prisma__GeocodingCacheClient<$Result.GetResult<Prisma.$GeocodingCachePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one GeocodingCache that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {GeocodingCacheFindUniqueOrThrowArgs} args - Arguments to find a GeocodingCache
     * @example
     * // Get one GeocodingCache
     * const geocodingCache = await prisma.geocodingCache.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends GeocodingCacheFindUniqueOrThrowArgs>(args: SelectSubset<T, GeocodingCacheFindUniqueOrThrowArgs<ExtArgs>>): Prisma__GeocodingCacheClient<$Result.GetResult<Prisma.$GeocodingCachePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first GeocodingCache that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GeocodingCacheFindFirstArgs} args - Arguments to find a GeocodingCache
     * @example
     * // Get one GeocodingCache
     * const geocodingCache = await prisma.geocodingCache.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends GeocodingCacheFindFirstArgs>(args?: SelectSubset<T, GeocodingCacheFindFirstArgs<ExtArgs>>): Prisma__GeocodingCacheClient<$Result.GetResult<Prisma.$GeocodingCachePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first GeocodingCache that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GeocodingCacheFindFirstOrThrowArgs} args - Arguments to find a GeocodingCache
     * @example
     * // Get one GeocodingCache
     * const geocodingCache = await prisma.geocodingCache.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends GeocodingCacheFindFirstOrThrowArgs>(args?: SelectSubset<T, GeocodingCacheFindFirstOrThrowArgs<ExtArgs>>): Prisma__GeocodingCacheClient<$Result.GetResult<Prisma.$GeocodingCachePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more GeocodingCaches that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GeocodingCacheFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all GeocodingCaches
     * const geocodingCaches = await prisma.geocodingCache.findMany()
     * 
     * // Get first 10 GeocodingCaches
     * const geocodingCaches = await prisma.geocodingCache.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const geocodingCacheWithIdOnly = await prisma.geocodingCache.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends GeocodingCacheFindManyArgs>(args?: SelectSubset<T, GeocodingCacheFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$GeocodingCachePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a GeocodingCache.
     * @param {GeocodingCacheCreateArgs} args - Arguments to create a GeocodingCache.
     * @example
     * // Create one GeocodingCache
     * const GeocodingCache = await prisma.geocodingCache.create({
     *   data: {
     *     // ... data to create a GeocodingCache
     *   }
     * })
     * 
     */
    create<T extends GeocodingCacheCreateArgs>(args: SelectSubset<T, GeocodingCacheCreateArgs<ExtArgs>>): Prisma__GeocodingCacheClient<$Result.GetResult<Prisma.$GeocodingCachePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many GeocodingCaches.
     * @param {GeocodingCacheCreateManyArgs} args - Arguments to create many GeocodingCaches.
     * @example
     * // Create many GeocodingCaches
     * const geocodingCache = await prisma.geocodingCache.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends GeocodingCacheCreateManyArgs>(args?: SelectSubset<T, GeocodingCacheCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many GeocodingCaches and returns the data saved in the database.
     * @param {GeocodingCacheCreateManyAndReturnArgs} args - Arguments to create many GeocodingCaches.
     * @example
     * // Create many GeocodingCaches
     * const geocodingCache = await prisma.geocodingCache.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many GeocodingCaches and only return the `id`
     * const geocodingCacheWithIdOnly = await prisma.geocodingCache.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends GeocodingCacheCreateManyAndReturnArgs>(args?: SelectSubset<T, GeocodingCacheCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$GeocodingCachePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a GeocodingCache.
     * @param {GeocodingCacheDeleteArgs} args - Arguments to delete one GeocodingCache.
     * @example
     * // Delete one GeocodingCache
     * const GeocodingCache = await prisma.geocodingCache.delete({
     *   where: {
     *     // ... filter to delete one GeocodingCache
     *   }
     * })
     * 
     */
    delete<T extends GeocodingCacheDeleteArgs>(args: SelectSubset<T, GeocodingCacheDeleteArgs<ExtArgs>>): Prisma__GeocodingCacheClient<$Result.GetResult<Prisma.$GeocodingCachePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one GeocodingCache.
     * @param {GeocodingCacheUpdateArgs} args - Arguments to update one GeocodingCache.
     * @example
     * // Update one GeocodingCache
     * const geocodingCache = await prisma.geocodingCache.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends GeocodingCacheUpdateArgs>(args: SelectSubset<T, GeocodingCacheUpdateArgs<ExtArgs>>): Prisma__GeocodingCacheClient<$Result.GetResult<Prisma.$GeocodingCachePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more GeocodingCaches.
     * @param {GeocodingCacheDeleteManyArgs} args - Arguments to filter GeocodingCaches to delete.
     * @example
     * // Delete a few GeocodingCaches
     * const { count } = await prisma.geocodingCache.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends GeocodingCacheDeleteManyArgs>(args?: SelectSubset<T, GeocodingCacheDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more GeocodingCaches.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GeocodingCacheUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many GeocodingCaches
     * const geocodingCache = await prisma.geocodingCache.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends GeocodingCacheUpdateManyArgs>(args: SelectSubset<T, GeocodingCacheUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more GeocodingCaches and returns the data updated in the database.
     * @param {GeocodingCacheUpdateManyAndReturnArgs} args - Arguments to update many GeocodingCaches.
     * @example
     * // Update many GeocodingCaches
     * const geocodingCache = await prisma.geocodingCache.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more GeocodingCaches and only return the `id`
     * const geocodingCacheWithIdOnly = await prisma.geocodingCache.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends GeocodingCacheUpdateManyAndReturnArgs>(args: SelectSubset<T, GeocodingCacheUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$GeocodingCachePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one GeocodingCache.
     * @param {GeocodingCacheUpsertArgs} args - Arguments to update or create a GeocodingCache.
     * @example
     * // Update or create a GeocodingCache
     * const geocodingCache = await prisma.geocodingCache.upsert({
     *   create: {
     *     // ... data to create a GeocodingCache
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the GeocodingCache we want to update
     *   }
     * })
     */
    upsert<T extends GeocodingCacheUpsertArgs>(args: SelectSubset<T, GeocodingCacheUpsertArgs<ExtArgs>>): Prisma__GeocodingCacheClient<$Result.GetResult<Prisma.$GeocodingCachePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of GeocodingCaches.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GeocodingCacheCountArgs} args - Arguments to filter GeocodingCaches to count.
     * @example
     * // Count the number of GeocodingCaches
     * const count = await prisma.geocodingCache.count({
     *   where: {
     *     // ... the filter for the GeocodingCaches we want to count
     *   }
     * })
    **/
    count<T extends GeocodingCacheCountArgs>(
      args?: Subset<T, GeocodingCacheCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], GeocodingCacheCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a GeocodingCache.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GeocodingCacheAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends GeocodingCacheAggregateArgs>(args: Subset<T, GeocodingCacheAggregateArgs>): Prisma.PrismaPromise<GetGeocodingCacheAggregateType<T>>

    /**
     * Group by GeocodingCache.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GeocodingCacheGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends GeocodingCacheGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: GeocodingCacheGroupByArgs['orderBy'] }
        : { orderBy?: GeocodingCacheGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, GeocodingCacheGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetGeocodingCacheGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the GeocodingCache model
   */
  readonly fields: GeocodingCacheFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for GeocodingCache.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__GeocodingCacheClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the GeocodingCache model
   */
  interface GeocodingCacheFieldRefs {
    readonly id: FieldRef<"GeocodingCache", 'String'>
    readonly address: FieldRef<"GeocodingCache", 'String'>
    readonly latitude: FieldRef<"GeocodingCache", 'Float'>
    readonly longitude: FieldRef<"GeocodingCache", 'Float'>
    readonly displayName: FieldRef<"GeocodingCache", 'String'>
    readonly expiresAt: FieldRef<"GeocodingCache", 'DateTime'>
    readonly createdAt: FieldRef<"GeocodingCache", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * GeocodingCache findUnique
   */
  export type GeocodingCacheFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GeocodingCache
     */
    select?: GeocodingCacheSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GeocodingCache
     */
    omit?: GeocodingCacheOmit<ExtArgs> | null
    /**
     * Filter, which GeocodingCache to fetch.
     */
    where: GeocodingCacheWhereUniqueInput
  }

  /**
   * GeocodingCache findUniqueOrThrow
   */
  export type GeocodingCacheFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GeocodingCache
     */
    select?: GeocodingCacheSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GeocodingCache
     */
    omit?: GeocodingCacheOmit<ExtArgs> | null
    /**
     * Filter, which GeocodingCache to fetch.
     */
    where: GeocodingCacheWhereUniqueInput
  }

  /**
   * GeocodingCache findFirst
   */
  export type GeocodingCacheFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GeocodingCache
     */
    select?: GeocodingCacheSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GeocodingCache
     */
    omit?: GeocodingCacheOmit<ExtArgs> | null
    /**
     * Filter, which GeocodingCache to fetch.
     */
    where?: GeocodingCacheWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of GeocodingCaches to fetch.
     */
    orderBy?: GeocodingCacheOrderByWithRelationInput | GeocodingCacheOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for GeocodingCaches.
     */
    cursor?: GeocodingCacheWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` GeocodingCaches from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` GeocodingCaches.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of GeocodingCaches.
     */
    distinct?: GeocodingCacheScalarFieldEnum | GeocodingCacheScalarFieldEnum[]
  }

  /**
   * GeocodingCache findFirstOrThrow
   */
  export type GeocodingCacheFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GeocodingCache
     */
    select?: GeocodingCacheSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GeocodingCache
     */
    omit?: GeocodingCacheOmit<ExtArgs> | null
    /**
     * Filter, which GeocodingCache to fetch.
     */
    where?: GeocodingCacheWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of GeocodingCaches to fetch.
     */
    orderBy?: GeocodingCacheOrderByWithRelationInput | GeocodingCacheOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for GeocodingCaches.
     */
    cursor?: GeocodingCacheWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` GeocodingCaches from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` GeocodingCaches.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of GeocodingCaches.
     */
    distinct?: GeocodingCacheScalarFieldEnum | GeocodingCacheScalarFieldEnum[]
  }

  /**
   * GeocodingCache findMany
   */
  export type GeocodingCacheFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GeocodingCache
     */
    select?: GeocodingCacheSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GeocodingCache
     */
    omit?: GeocodingCacheOmit<ExtArgs> | null
    /**
     * Filter, which GeocodingCaches to fetch.
     */
    where?: GeocodingCacheWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of GeocodingCaches to fetch.
     */
    orderBy?: GeocodingCacheOrderByWithRelationInput | GeocodingCacheOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing GeocodingCaches.
     */
    cursor?: GeocodingCacheWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` GeocodingCaches from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` GeocodingCaches.
     */
    skip?: number
    distinct?: GeocodingCacheScalarFieldEnum | GeocodingCacheScalarFieldEnum[]
  }

  /**
   * GeocodingCache create
   */
  export type GeocodingCacheCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GeocodingCache
     */
    select?: GeocodingCacheSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GeocodingCache
     */
    omit?: GeocodingCacheOmit<ExtArgs> | null
    /**
     * The data needed to create a GeocodingCache.
     */
    data: XOR<GeocodingCacheCreateInput, GeocodingCacheUncheckedCreateInput>
  }

  /**
   * GeocodingCache createMany
   */
  export type GeocodingCacheCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many GeocodingCaches.
     */
    data: GeocodingCacheCreateManyInput | GeocodingCacheCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * GeocodingCache createManyAndReturn
   */
  export type GeocodingCacheCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GeocodingCache
     */
    select?: GeocodingCacheSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the GeocodingCache
     */
    omit?: GeocodingCacheOmit<ExtArgs> | null
    /**
     * The data used to create many GeocodingCaches.
     */
    data: GeocodingCacheCreateManyInput | GeocodingCacheCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * GeocodingCache update
   */
  export type GeocodingCacheUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GeocodingCache
     */
    select?: GeocodingCacheSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GeocodingCache
     */
    omit?: GeocodingCacheOmit<ExtArgs> | null
    /**
     * The data needed to update a GeocodingCache.
     */
    data: XOR<GeocodingCacheUpdateInput, GeocodingCacheUncheckedUpdateInput>
    /**
     * Choose, which GeocodingCache to update.
     */
    where: GeocodingCacheWhereUniqueInput
  }

  /**
   * GeocodingCache updateMany
   */
  export type GeocodingCacheUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update GeocodingCaches.
     */
    data: XOR<GeocodingCacheUpdateManyMutationInput, GeocodingCacheUncheckedUpdateManyInput>
    /**
     * Filter which GeocodingCaches to update
     */
    where?: GeocodingCacheWhereInput
    /**
     * Limit how many GeocodingCaches to update.
     */
    limit?: number
  }

  /**
   * GeocodingCache updateManyAndReturn
   */
  export type GeocodingCacheUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GeocodingCache
     */
    select?: GeocodingCacheSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the GeocodingCache
     */
    omit?: GeocodingCacheOmit<ExtArgs> | null
    /**
     * The data used to update GeocodingCaches.
     */
    data: XOR<GeocodingCacheUpdateManyMutationInput, GeocodingCacheUncheckedUpdateManyInput>
    /**
     * Filter which GeocodingCaches to update
     */
    where?: GeocodingCacheWhereInput
    /**
     * Limit how many GeocodingCaches to update.
     */
    limit?: number
  }

  /**
   * GeocodingCache upsert
   */
  export type GeocodingCacheUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GeocodingCache
     */
    select?: GeocodingCacheSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GeocodingCache
     */
    omit?: GeocodingCacheOmit<ExtArgs> | null
    /**
     * The filter to search for the GeocodingCache to update in case it exists.
     */
    where: GeocodingCacheWhereUniqueInput
    /**
     * In case the GeocodingCache found by the `where` argument doesn't exist, create a new GeocodingCache with this data.
     */
    create: XOR<GeocodingCacheCreateInput, GeocodingCacheUncheckedCreateInput>
    /**
     * In case the GeocodingCache was found with the provided `where` argument, update it with this data.
     */
    update: XOR<GeocodingCacheUpdateInput, GeocodingCacheUncheckedUpdateInput>
  }

  /**
   * GeocodingCache delete
   */
  export type GeocodingCacheDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GeocodingCache
     */
    select?: GeocodingCacheSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GeocodingCache
     */
    omit?: GeocodingCacheOmit<ExtArgs> | null
    /**
     * Filter which GeocodingCache to delete.
     */
    where: GeocodingCacheWhereUniqueInput
  }

  /**
   * GeocodingCache deleteMany
   */
  export type GeocodingCacheDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which GeocodingCaches to delete
     */
    where?: GeocodingCacheWhereInput
    /**
     * Limit how many GeocodingCaches to delete.
     */
    limit?: number
  }

  /**
   * GeocodingCache without action
   */
  export type GeocodingCacheDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GeocodingCache
     */
    select?: GeocodingCacheSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GeocodingCache
     */
    omit?: GeocodingCacheOmit<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const OpportunityZoneCacheScalarFieldEnum: {
    id: 'id',
    version: 'version',
    lastUpdated: 'lastUpdated',
    featureCount: 'featureCount',
    nextRefresh: 'nextRefresh',
    dataHash: 'dataHash',
    geoJsonData: 'geoJsonData',
    spatialIndex: 'spatialIndex',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type OpportunityZoneCacheScalarFieldEnum = (typeof OpportunityZoneCacheScalarFieldEnum)[keyof typeof OpportunityZoneCacheScalarFieldEnum]


  export const GeocodingCacheScalarFieldEnum: {
    id: 'id',
    address: 'address',
    latitude: 'latitude',
    longitude: 'longitude',
    displayName: 'displayName',
    expiresAt: 'expiresAt',
    createdAt: 'createdAt'
  };

  export type GeocodingCacheScalarFieldEnum = (typeof GeocodingCacheScalarFieldEnum)[keyof typeof GeocodingCacheScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const JsonNullValueInput: {
    JsonNull: typeof JsonNull
  };

  export type JsonNullValueInput = (typeof JsonNullValueInput)[keyof typeof JsonNullValueInput]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const JsonNullValueFilter: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull,
    AnyNull: typeof AnyNull
  };

  export type JsonNullValueFilter = (typeof JsonNullValueFilter)[keyof typeof JsonNullValueFilter]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'Json'
   */
  export type JsonFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Json'>
    


  /**
   * Reference to a field of type 'QueryMode'
   */
  export type EnumQueryModeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'QueryMode'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    
  /**
   * Deep Input Types
   */


  export type OpportunityZoneCacheWhereInput = {
    AND?: OpportunityZoneCacheWhereInput | OpportunityZoneCacheWhereInput[]
    OR?: OpportunityZoneCacheWhereInput[]
    NOT?: OpportunityZoneCacheWhereInput | OpportunityZoneCacheWhereInput[]
    id?: StringFilter<"OpportunityZoneCache"> | string
    version?: StringFilter<"OpportunityZoneCache"> | string
    lastUpdated?: DateTimeFilter<"OpportunityZoneCache"> | Date | string
    featureCount?: IntFilter<"OpportunityZoneCache"> | number
    nextRefresh?: DateTimeFilter<"OpportunityZoneCache"> | Date | string
    dataHash?: StringFilter<"OpportunityZoneCache"> | string
    geoJsonData?: JsonFilter<"OpportunityZoneCache">
    spatialIndex?: JsonFilter<"OpportunityZoneCache">
    createdAt?: DateTimeFilter<"OpportunityZoneCache"> | Date | string
    updatedAt?: DateTimeFilter<"OpportunityZoneCache"> | Date | string
  }

  export type OpportunityZoneCacheOrderByWithRelationInput = {
    id?: SortOrder
    version?: SortOrder
    lastUpdated?: SortOrder
    featureCount?: SortOrder
    nextRefresh?: SortOrder
    dataHash?: SortOrder
    geoJsonData?: SortOrder
    spatialIndex?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type OpportunityZoneCacheWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: OpportunityZoneCacheWhereInput | OpportunityZoneCacheWhereInput[]
    OR?: OpportunityZoneCacheWhereInput[]
    NOT?: OpportunityZoneCacheWhereInput | OpportunityZoneCacheWhereInput[]
    version?: StringFilter<"OpportunityZoneCache"> | string
    lastUpdated?: DateTimeFilter<"OpportunityZoneCache"> | Date | string
    featureCount?: IntFilter<"OpportunityZoneCache"> | number
    nextRefresh?: DateTimeFilter<"OpportunityZoneCache"> | Date | string
    dataHash?: StringFilter<"OpportunityZoneCache"> | string
    geoJsonData?: JsonFilter<"OpportunityZoneCache">
    spatialIndex?: JsonFilter<"OpportunityZoneCache">
    createdAt?: DateTimeFilter<"OpportunityZoneCache"> | Date | string
    updatedAt?: DateTimeFilter<"OpportunityZoneCache"> | Date | string
  }, "id">

  export type OpportunityZoneCacheOrderByWithAggregationInput = {
    id?: SortOrder
    version?: SortOrder
    lastUpdated?: SortOrder
    featureCount?: SortOrder
    nextRefresh?: SortOrder
    dataHash?: SortOrder
    geoJsonData?: SortOrder
    spatialIndex?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: OpportunityZoneCacheCountOrderByAggregateInput
    _avg?: OpportunityZoneCacheAvgOrderByAggregateInput
    _max?: OpportunityZoneCacheMaxOrderByAggregateInput
    _min?: OpportunityZoneCacheMinOrderByAggregateInput
    _sum?: OpportunityZoneCacheSumOrderByAggregateInput
  }

  export type OpportunityZoneCacheScalarWhereWithAggregatesInput = {
    AND?: OpportunityZoneCacheScalarWhereWithAggregatesInput | OpportunityZoneCacheScalarWhereWithAggregatesInput[]
    OR?: OpportunityZoneCacheScalarWhereWithAggregatesInput[]
    NOT?: OpportunityZoneCacheScalarWhereWithAggregatesInput | OpportunityZoneCacheScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"OpportunityZoneCache"> | string
    version?: StringWithAggregatesFilter<"OpportunityZoneCache"> | string
    lastUpdated?: DateTimeWithAggregatesFilter<"OpportunityZoneCache"> | Date | string
    featureCount?: IntWithAggregatesFilter<"OpportunityZoneCache"> | number
    nextRefresh?: DateTimeWithAggregatesFilter<"OpportunityZoneCache"> | Date | string
    dataHash?: StringWithAggregatesFilter<"OpportunityZoneCache"> | string
    geoJsonData?: JsonWithAggregatesFilter<"OpportunityZoneCache">
    spatialIndex?: JsonWithAggregatesFilter<"OpportunityZoneCache">
    createdAt?: DateTimeWithAggregatesFilter<"OpportunityZoneCache"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"OpportunityZoneCache"> | Date | string
  }

  export type GeocodingCacheWhereInput = {
    AND?: GeocodingCacheWhereInput | GeocodingCacheWhereInput[]
    OR?: GeocodingCacheWhereInput[]
    NOT?: GeocodingCacheWhereInput | GeocodingCacheWhereInput[]
    id?: StringFilter<"GeocodingCache"> | string
    address?: StringFilter<"GeocodingCache"> | string
    latitude?: FloatFilter<"GeocodingCache"> | number
    longitude?: FloatFilter<"GeocodingCache"> | number
    displayName?: StringFilter<"GeocodingCache"> | string
    expiresAt?: DateTimeFilter<"GeocodingCache"> | Date | string
    createdAt?: DateTimeFilter<"GeocodingCache"> | Date | string
  }

  export type GeocodingCacheOrderByWithRelationInput = {
    id?: SortOrder
    address?: SortOrder
    latitude?: SortOrder
    longitude?: SortOrder
    displayName?: SortOrder
    expiresAt?: SortOrder
    createdAt?: SortOrder
  }

  export type GeocodingCacheWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    address?: string
    AND?: GeocodingCacheWhereInput | GeocodingCacheWhereInput[]
    OR?: GeocodingCacheWhereInput[]
    NOT?: GeocodingCacheWhereInput | GeocodingCacheWhereInput[]
    latitude?: FloatFilter<"GeocodingCache"> | number
    longitude?: FloatFilter<"GeocodingCache"> | number
    displayName?: StringFilter<"GeocodingCache"> | string
    expiresAt?: DateTimeFilter<"GeocodingCache"> | Date | string
    createdAt?: DateTimeFilter<"GeocodingCache"> | Date | string
  }, "id" | "address">

  export type GeocodingCacheOrderByWithAggregationInput = {
    id?: SortOrder
    address?: SortOrder
    latitude?: SortOrder
    longitude?: SortOrder
    displayName?: SortOrder
    expiresAt?: SortOrder
    createdAt?: SortOrder
    _count?: GeocodingCacheCountOrderByAggregateInput
    _avg?: GeocodingCacheAvgOrderByAggregateInput
    _max?: GeocodingCacheMaxOrderByAggregateInput
    _min?: GeocodingCacheMinOrderByAggregateInput
    _sum?: GeocodingCacheSumOrderByAggregateInput
  }

  export type GeocodingCacheScalarWhereWithAggregatesInput = {
    AND?: GeocodingCacheScalarWhereWithAggregatesInput | GeocodingCacheScalarWhereWithAggregatesInput[]
    OR?: GeocodingCacheScalarWhereWithAggregatesInput[]
    NOT?: GeocodingCacheScalarWhereWithAggregatesInput | GeocodingCacheScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"GeocodingCache"> | string
    address?: StringWithAggregatesFilter<"GeocodingCache"> | string
    latitude?: FloatWithAggregatesFilter<"GeocodingCache"> | number
    longitude?: FloatWithAggregatesFilter<"GeocodingCache"> | number
    displayName?: StringWithAggregatesFilter<"GeocodingCache"> | string
    expiresAt?: DateTimeWithAggregatesFilter<"GeocodingCache"> | Date | string
    createdAt?: DateTimeWithAggregatesFilter<"GeocodingCache"> | Date | string
  }

  export type OpportunityZoneCacheCreateInput = {
    id?: string
    version: string
    lastUpdated: Date | string
    featureCount: number
    nextRefresh: Date | string
    dataHash: string
    geoJsonData: JsonNullValueInput | InputJsonValue
    spatialIndex: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type OpportunityZoneCacheUncheckedCreateInput = {
    id?: string
    version: string
    lastUpdated: Date | string
    featureCount: number
    nextRefresh: Date | string
    dataHash: string
    geoJsonData: JsonNullValueInput | InputJsonValue
    spatialIndex: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type OpportunityZoneCacheUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    version?: StringFieldUpdateOperationsInput | string
    lastUpdated?: DateTimeFieldUpdateOperationsInput | Date | string
    featureCount?: IntFieldUpdateOperationsInput | number
    nextRefresh?: DateTimeFieldUpdateOperationsInput | Date | string
    dataHash?: StringFieldUpdateOperationsInput | string
    geoJsonData?: JsonNullValueInput | InputJsonValue
    spatialIndex?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OpportunityZoneCacheUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    version?: StringFieldUpdateOperationsInput | string
    lastUpdated?: DateTimeFieldUpdateOperationsInput | Date | string
    featureCount?: IntFieldUpdateOperationsInput | number
    nextRefresh?: DateTimeFieldUpdateOperationsInput | Date | string
    dataHash?: StringFieldUpdateOperationsInput | string
    geoJsonData?: JsonNullValueInput | InputJsonValue
    spatialIndex?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OpportunityZoneCacheCreateManyInput = {
    id?: string
    version: string
    lastUpdated: Date | string
    featureCount: number
    nextRefresh: Date | string
    dataHash: string
    geoJsonData: JsonNullValueInput | InputJsonValue
    spatialIndex: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type OpportunityZoneCacheUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    version?: StringFieldUpdateOperationsInput | string
    lastUpdated?: DateTimeFieldUpdateOperationsInput | Date | string
    featureCount?: IntFieldUpdateOperationsInput | number
    nextRefresh?: DateTimeFieldUpdateOperationsInput | Date | string
    dataHash?: StringFieldUpdateOperationsInput | string
    geoJsonData?: JsonNullValueInput | InputJsonValue
    spatialIndex?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OpportunityZoneCacheUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    version?: StringFieldUpdateOperationsInput | string
    lastUpdated?: DateTimeFieldUpdateOperationsInput | Date | string
    featureCount?: IntFieldUpdateOperationsInput | number
    nextRefresh?: DateTimeFieldUpdateOperationsInput | Date | string
    dataHash?: StringFieldUpdateOperationsInput | string
    geoJsonData?: JsonNullValueInput | InputJsonValue
    spatialIndex?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type GeocodingCacheCreateInput = {
    id?: string
    address: string
    latitude: number
    longitude: number
    displayName: string
    expiresAt: Date | string
    createdAt?: Date | string
  }

  export type GeocodingCacheUncheckedCreateInput = {
    id?: string
    address: string
    latitude: number
    longitude: number
    displayName: string
    expiresAt: Date | string
    createdAt?: Date | string
  }

  export type GeocodingCacheUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    address?: StringFieldUpdateOperationsInput | string
    latitude?: FloatFieldUpdateOperationsInput | number
    longitude?: FloatFieldUpdateOperationsInput | number
    displayName?: StringFieldUpdateOperationsInput | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type GeocodingCacheUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    address?: StringFieldUpdateOperationsInput | string
    latitude?: FloatFieldUpdateOperationsInput | number
    longitude?: FloatFieldUpdateOperationsInput | number
    displayName?: StringFieldUpdateOperationsInput | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type GeocodingCacheCreateManyInput = {
    id?: string
    address: string
    latitude: number
    longitude: number
    displayName: string
    expiresAt: Date | string
    createdAt?: Date | string
  }

  export type GeocodingCacheUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    address?: StringFieldUpdateOperationsInput | string
    latitude?: FloatFieldUpdateOperationsInput | number
    longitude?: FloatFieldUpdateOperationsInput | number
    displayName?: StringFieldUpdateOperationsInput | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type GeocodingCacheUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    address?: StringFieldUpdateOperationsInput | string
    latitude?: FloatFieldUpdateOperationsInput | number
    longitude?: FloatFieldUpdateOperationsInput | number
    displayName?: StringFieldUpdateOperationsInput | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }
  export type JsonFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonFilterBase<$PrismaModel>>, 'path'>>

  export type JsonFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type OpportunityZoneCacheCountOrderByAggregateInput = {
    id?: SortOrder
    version?: SortOrder
    lastUpdated?: SortOrder
    featureCount?: SortOrder
    nextRefresh?: SortOrder
    dataHash?: SortOrder
    geoJsonData?: SortOrder
    spatialIndex?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type OpportunityZoneCacheAvgOrderByAggregateInput = {
    featureCount?: SortOrder
  }

  export type OpportunityZoneCacheMaxOrderByAggregateInput = {
    id?: SortOrder
    version?: SortOrder
    lastUpdated?: SortOrder
    featureCount?: SortOrder
    nextRefresh?: SortOrder
    dataHash?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type OpportunityZoneCacheMinOrderByAggregateInput = {
    id?: SortOrder
    version?: SortOrder
    lastUpdated?: SortOrder
    featureCount?: SortOrder
    nextRefresh?: SortOrder
    dataHash?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type OpportunityZoneCacheSumOrderByAggregateInput = {
    featureCount?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }
  export type JsonWithAggregatesFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonWithAggregatesFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonWithAggregatesFilterBase<$PrismaModel>>, 'path'>>

  export type JsonWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedJsonFilter<$PrismaModel>
    _max?: NestedJsonFilter<$PrismaModel>
  }

  export type FloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type GeocodingCacheCountOrderByAggregateInput = {
    id?: SortOrder
    address?: SortOrder
    latitude?: SortOrder
    longitude?: SortOrder
    displayName?: SortOrder
    expiresAt?: SortOrder
    createdAt?: SortOrder
  }

  export type GeocodingCacheAvgOrderByAggregateInput = {
    latitude?: SortOrder
    longitude?: SortOrder
  }

  export type GeocodingCacheMaxOrderByAggregateInput = {
    id?: SortOrder
    address?: SortOrder
    latitude?: SortOrder
    longitude?: SortOrder
    displayName?: SortOrder
    expiresAt?: SortOrder
    createdAt?: SortOrder
  }

  export type GeocodingCacheMinOrderByAggregateInput = {
    id?: SortOrder
    address?: SortOrder
    latitude?: SortOrder
    longitude?: SortOrder
    displayName?: SortOrder
    expiresAt?: SortOrder
    createdAt?: SortOrder
  }

  export type GeocodingCacheSumOrderByAggregateInput = {
    latitude?: SortOrder
    longitude?: SortOrder
  }

  export type FloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedFloatFilter<$PrismaModel>
    _min?: NestedFloatFilter<$PrismaModel>
    _max?: NestedFloatFilter<$PrismaModel>
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type FloatFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }
  export type NestedJsonFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<NestedJsonFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonFilterBase<$PrismaModel>>, 'path'>>,
        Required<NestedJsonFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonFilterBase<$PrismaModel>>, 'path'>>

  export type NestedJsonFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type NestedFloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedFloatFilter<$PrismaModel>
    _min?: NestedFloatFilter<$PrismaModel>
    _max?: NestedFloatFilter<$PrismaModel>
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}