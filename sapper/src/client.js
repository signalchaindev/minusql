/* eslint-disable import/no-extraneous-dependencies */
import * as sapper from "@sapper/app"

sapper
  .start({
    target: document.body,
  })
  .then(() => {
    document.body.setAttribute("hydrated", "")
  })
