import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {escapeHtml,embedPolicy,publicImage} from '../src/lib/portfolio-embed.ts';

test('CMS text cannot inject HTML or attributes',()=>{
 assert.equal(escapeHtml('<script>"&\''),'&lt;script&gt;&quot;&amp;&#39;');
 assert.equal(escapeHtml(null),'');
});
test('only explicit HTTPS parent origins are accepted',()=>{
 assert.match(embedPolicy('https://preview.example.com'),/frame-ancestors https:\/\/kevinzieyeo.com https:\/\/preview.example.com$/);
 for(const value of ['*','https://*.vercel.app','http://example.com','https://example.com/path','https://user:pass@example.com','https://example.com/'])assert.throws(()=>embedPolicy(value));
});
test('sandbox has no browser scripts, network APIs, forms or child frames',()=>{
 const policy=embedPolicy('');
 for(const directive of ["script-src 'none'","connect-src 'none'","form-action 'none'","frame-src 'none'","base-uri 'none'"])assert.ok(policy.includes(directive));
});
test('only safe public HTTPS images are emitted',()=>{
 for(const url of ['javascript:alert(1)','data:text/html,hi','http://example.com/a.png','https://user:pass@example.com/a.png'])assert.equal(publicImage(url),'');
 assert.equal(publicImage('https://example.com/a.png?x=1&y=2'),'https://example.com/a.png?x=1&amp;y=2');
});
test('route cannot inherit a session or perform transactions',()=>{
 const route=readFileSync(new URL('../src/app/embed/portfolio/route.ts',import.meta.url),'utf8');
 assert.ok(!/createServerClient|service_role|\.auth\.|\.insert\(|\.update\(|\.delete\(/.test(route));
 assert.ok(route.includes(".eq('active',true)"));
 assert.ok(!/<script|<form|<iframe|target=/.test(route));
});
