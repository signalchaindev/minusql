export interface InitCacheData {
  operationName: string
  isMutation: boolean
  data: Object | null
  updateQuery?: string
}
