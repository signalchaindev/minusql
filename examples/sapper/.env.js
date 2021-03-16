const sharedKeys = {
  NODE_ENV: "development",
  PORT: 3000,
  FRONTEND_URL: "http://localhost:3000",
  GQL_SERVER_ENDPOINT_BASE: "http://localhost:3001",
  GQL_SERVER_PATH: "graphql",
  APP_SECRET: "349tgrfyew5t96gwebr",
}

export default {
  development: sharedKeys,
  production: sharedKeys,
}