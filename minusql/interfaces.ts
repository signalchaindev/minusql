export interface InitCacheData {
  operationName: string
  isMutation: boolean
  data: Object | null
  variables?: Object
  updateQuery?: string
}
