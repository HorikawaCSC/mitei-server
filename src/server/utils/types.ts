export type ExcludeProp<T, K> = { [I in keyof T]: I extends K ? never : T[I] };
