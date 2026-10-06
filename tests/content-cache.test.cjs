const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const vm = require('node:vm')
const ts = require('typescript')

function load(file, mocks) {
  const module = { exports: {} }
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText
  vm.runInNewContext(code, { module, exports: module.exports, Error, require: id => {
    assert.ok(id in mocks, `Unexpected dependency: ${id}`)
    return mocks[id]
  } })
  return module.exports
}

test('FAQ edits refresh nested pages and sitemap only after an authorized successful save', async () => {
  const events = []
  let authorized = true, fail = false
  const revalidation = load('lib/revalidate-service.ts', {
    'next/cache': { revalidatePath: (...args) => events.push(args) },
  })
  const route = load('app/api/admin/general-faqs/[id]/route.ts', {
    'next/server': {},
    '@/lib/revalidate-service': revalidation,
    '@/lib/prisma': { prisma: { generalFaq: { update: async () => {
      events.push('save')
      if (fail) throw new Error('save failed')
      return { id: 1 }
    } } } },
    '@/lib/api-auth': {
      checkAdminAuth: async () => ({ authorized, response: { status: 401 } }),
      successResponse: data => ({ status: 200, data }),
      errorResponse: message => ({ status: 500, message }),
    },
    '@/lib/sanitize-html': { sanitizeRichText: value => value },
    '@/lib/slug': { slugify: value => value },
  })
  const request = { json: async () => ({ question: 'updated FAQ' }) }
  const params = { params: Promise.resolve({ id: '1' }) }
  assert.equal((await route.PUT(request, params)).status, 200)
  assert.equal(JSON.stringify(events), JSON.stringify(['save', ['/', 'layout'], ['/sitemap.xml']]))
  events.length = 0
  fail = true
  const failure = await route.PUT(request, params)
  assert.equal(failure.status, 500)
  assert.equal(failure.message, 'save failed')
  assert.deepEqual(events, ['save'])
  events.length = 0
  authorized = false
  assert.equal((await route.PUT(request, params)).status, 401)
  assert.deepEqual(events, [])
})
