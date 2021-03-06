/**
 * @jest-environment jsdom
 */
import { ssrRef, setSSRContext } from '../..'

jest.setTimeout(60000)

/* eslint-disable @typescript-eslint/no-var-requires */
const { setup, get } = require('@nuxtjs/module-test-utils')
const config = require('../fixture/nuxt.config')
/* eslint-enable */

let nuxt

describe('ssrRef', () => {
  beforeAll(async () => {
    nuxt = (await setup(config)).nuxt
  }, 60000)

  afterAll(async () => {
    await nuxt.close()
  })

  test('__NUXT__ contains correct data', async () => {
    const homePage = await get('/')
    expect(homePage.includes('"only SSR rendered"')).toBeFalsy()
    expect(homePage.includes('"runs SSR or client-side"')).toBeFalsy()

    const ssrRefPage = await get('/ssr-ref')
    expect(ssrRefPage).toContain('"only SSR rendered"')
    expect(ssrRefPage).toContain('"runs SSR or client-side"')

    const noSetupPage = await get('/no-setup')
    expect(noSetupPage).toContain('"prefetched async"')
    expect(noSetupPage).toContain('"SSR overwritten"')
    expect(noSetupPage.includes('"unchanged"')).toBeFalsy()

    const rerenderedHomePage = await get('/')
    expect(rerenderedHomePage.includes('"only SSR rendered"')).toBeFalsy()
    expect(rerenderedHomePage.includes('"runs SSR or client-side"')).toBeFalsy()
  })
})

describe('ssrRef reactivity', () => {
  let ssrContext: Record<string, any>

  beforeEach(async () => {
    ssrContext = Object.assign({}, { nuxt: {} })
    setSSRContext(ssrContext)
  })
  test('ssrRefs react to change in state', async () => {
    process.client = false
    const name = ssrRef('', 'name')
    ssrRef('', 'unchanged')
    name.value = 'full name'
    expect(ssrContext).toMatchSnapshot()
  })
  test('ssrRefs react to deep change in object state', async () => {
    process.client = false
    const obj = ssrRef({ deep: { object: { name: 'nothing' } } }, 'obj')
    obj.value.deep.object.name = 'full name'
    expect(ssrContext).toMatchSnapshot()
  })
  test('ssrRefs react to deep change in array state', async () => {
    process.client = false
    const obj = ssrRef({ deep: { object: [{ name: 'nothing' }] } }, 'obj')
    obj.value.deep.object[0].name = 'full name'
    expect(ssrContext).toMatchSnapshot()
  })
})
